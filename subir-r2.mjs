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

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fs.readFileSync(arquivo),
  }));
  console.log('  ok:', key);
  ok++;
}
console.log(`Concluído: ${ok} arquivos enviados.`);