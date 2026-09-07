import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

const SIDECAR = 'http://127.0.0.1:1106';
const storage = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${SIDECAR}/token`,
    type: 'external_account',
    credential_source: {
      url: `${SIDECAR}/credential`,
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

const dirs = [
  process.env.PRIVATE_OBJECT_DIR,
  ...(process.env.PUBLIC_OBJECT_SEARCH_PATHS || '').split(','),
].map(d => (d || '').trim()).filter(Boolean);

for (const d of dirs) {
  const [bucketName, ...rest] = d.replace(/^\//, '').split('/');
  const prefix = rest.join('/');
  const [files] = await storage.bucket(bucketName).getFiles({ prefix });
  console.log(`${d}: ${files.length} arquivos`);
  for (const f of files) {
    const dest = path.join('anexos', bucketName, f.name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await f.download({ destination: dest });
    console.log('  ok:', f.name);
  }
}
console.log('Concluído.');