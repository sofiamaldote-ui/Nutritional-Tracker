import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
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

export class ObjectStorageService {
  /** Gera uma URL assinada de escrita, valida por 15 minutos. */
  async getObjectEntityUploadURL(): Promise<{
    uploadURL: string;
    objectPath: string;
  }> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const uploadURL = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key }),
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

      return {
        stream: resultado.Body as Readable,
        contentType: resultado.ContentType ?? 'application/octet-stream',
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