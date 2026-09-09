import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ACCOUNT_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const BASE = 'artifacts/api-server/anexos';

// Os arquivos antigos nao tem extensao (nomeados so por UUID), entao o
// tipo precisa ser detectado pelos primeiros bytes (magic numbers).
// Sem isso o R2 guarda o objeto sem Content-Type e, ao servir o arquivo
// depois, o navegador recebe application/octet-stream — PDFs nao abrem
// no visualizador e imagens nao renderizam corretamente.
function detectarContentType(buf) {
  if (buf.length >= 4 && buf.toString('ascii', 0, 4) === '%PDF') return 'application/pdf';
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 6 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a')) return 'image/gif';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return 'application/octet-stream';
}

function listar(dir) {
  const saida = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) saida.push(...listar(p));
    else saida.push(p);
  }
  return saida;
}

const arquivos = listar(BASE);
console.log(`${arquivos.length} arquivos encontrados`);

let ok = 0;
for (const arquivo of arquivos) {
  const idx = arquivo.indexOf('/uploads/');
  if (idx === -1) {
    console.log('  pulado (fora de uploads):', arquivo);
    continue;
  }
  const key = arquivo.slice(idx + 1);
  const body = fs.readFileSync(arquivo);
  const contentType = detectarContentType(body);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  console.log('  ok:', key, `(${contentType})`);
  ok++;
}
console.log(`Concluído: ${ok} arquivos enviados.`);