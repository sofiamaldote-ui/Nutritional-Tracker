import { randomUUID } from 'crypto';
import { PassThrough, Readable } from 'stream';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.R2_ACCOUNT_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    'R2_ACCOUNT_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_BUCKET precisam estar definidos.',
  );
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

/**
 * Converte "/objects/uploads/abc" (formato guardado no banco) na chave
 * do R2 ("uploads/abc"). Aceita tambem o caminho sem a barra inicial.
 */
export function objectPathToKey(objectPath: string): string {
  if (!objectPath) {
    throw new ObjectNotFoundError();
  }
  const semBarra = objectPath.startsWith('/') ? objectPath.slice(1) : objectPath;
  if (!semBarra.startsWith('objects/')) {
    throw new ObjectNotFoundError();
  }
  const key = semBarra.slice('objects/'.length);
  if (!key || key.includes('..')) {
    throw new ObjectNotFoundError();
  }
  return key;
}

export interface ObjectStream {
  stream: Readable;
  contentType: string;
  contentLength?: number;
}

const GENERIC_CONTENT_TYPES = new Set([
  'application/octet-stream',
  'binary/octet-stream',
]);

/**
 * Detecta o tipo do arquivo pelos primeiros bytes (magic numbers).
 * Necessario porque os anexos migrados do storage antigo foram
 * enviados ao R2 sem Content-Type (ver subir-r2.mjs).
 */
function sniffMimeType(head: Buffer): string | undefined {
  if (head.length >= 4 && head.toString('ascii', 0, 4) === '%PDF') {
    return 'application/pdf';
  }
  if (
    head.length >= 8 &&
    head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
  ) {
    return 'image/png';
  }
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    head.length >= 6 &&
    (head.toString('ascii', 0, 6) === 'GIF87a' || head.toString('ascii', 0, 6) === 'GIF89a')
  ) {
    return 'image/gif';
  }
  if (
    head.length >= 12 &&
    head.toString('ascii', 0, 4) === 'RIFF' &&
    head.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return undefined;
}

/**
 * Espia os primeiros bytes do stream para identificar o tipo real do
 * arquivo, sem carregar o conteudo inteiro em memoria. Devolve um novo
 * stream equivalente ao original (com os bytes ja lidos reinseridos).
 */
function sniffStream(source: Readable): Promise<{ mimeType?: string; stream: Readable }> {
  const SNIFF_BYTES = 16;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bufferedLength = 0;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      source.removeListener('data', onData);
      source.removeListener('end', onEnd);
      source.removeListener('error', onError);

      const head = Buffer.concat(chunks, bufferedLength);
      const merged = new PassThrough();
      if (head.length > 0) merged.write(head);
      source.pipe(merged);

      resolve({ mimeType: sniffMimeType(head), stream: merged });
    };

    const onData = (chunk: Buffer) => {
      chunks.push(chunk);
      bufferedLength += chunk.length;
      if (bufferedLength >= SNIFF_BYTES) finish();
    };
    const onEnd = () => finish();
    const onError = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    source.on('data', onData);
    source.on('end', onEnd);
    source.on('error', onError);
  });
}

export class ObjectStorageService {
  /**
   * Gera uma URL assinada de escrita, valida por 15 minutos.
   *
   * Quando o cliente informa o `contentType`, ele entra na assinatura para
   * que o R2 guarde o objeto ja com o Content-Type certo (o navegador precisa
   * enviar exatamente esse mesmo header no PUT). Sem isso o objeto fica como
   * application/octet-stream e depende da deteccao por magic bytes na leitura.
   */
  async getObjectEntityUploadURL(contentType?: string): Promise<{
    uploadURL: string;
    objectPath: string;
  }> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const uploadURL = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ...(contentType ? { ContentType: contentType } : {}),
      }),
      { expiresIn: 900 },
    );

    return { uploadURL, objectPath: `/objects/${key}` };
  }

  /** Le o objeto do R2 para ser repassado ao cliente pelo proprio servidor. */
  async getObjectStream(objectPath: string): Promise<ObjectStream> {
    const key = objectPathToKey(objectPath);

    try {
      const resultado = await r2.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );

      if (!resultado.Body) {
        throw new ObjectNotFoundError();
      }

      const contentTypeDoR2 = resultado.ContentType?.toLowerCase();
      if (contentTypeDoR2 && !GENERIC_CONTENT_TYPES.has(contentTypeDoR2)) {
        return {
          stream: resultado.Body as Readable,
          contentType: resultado.ContentType!,
          contentLength: resultado.ContentLength,
        };
      }

      // R2 nao devolveu um Content-Type util (comum em anexos migrados do
      // storage antigo, que foram enviados sem esse metadado). Detecta o
      // tipo pelos bytes do proprio arquivo antes de servir.
      const { mimeType, stream } = await sniffStream(resultado.Body as Readable);
      return {
        stream,
        contentType: mimeType ?? resultado.ContentType ?? 'application/octet-stream',
        contentLength: resultado.ContentLength,
      };
    } catch (erro: unknown) {
      const nome = (erro as { name?: string })?.name;
      if (nome === 'NoSuchKey' || nome === 'NotFound') {
        throw new ObjectNotFoundError();
      }
      throw erro;
    }
  }

  /** Remove o objeto do R2. */
  async deleteObject(objectPath: string): Promise<void> {
    const key = objectPathToKey(objectPath);
    await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async objectExists(objectPath: string): Promise<boolean> {
    const key = objectPathToKey(objectPath);
    try {
      await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mantido por compatibilidade com o codigo que chamava a versao antiga.
   * O caminho ja vem normalizado do fluxo novo.
   */
  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith('/objects/')) {
      return rawPath;
    }
    try {
      const url = new URL(rawPath);
      const partes = url.pathname.split('/').filter(Boolean);
      const idx = partes.indexOf('uploads');
      if (idx !== -1) {
        return `/objects/${partes.slice(idx).join('/')}`;
      }
    } catch {
      // rawPath nao era uma URL — cai no retorno abaixo
    }
    return rawPath;
  }
}