import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portal-state.json');
const PORT = Number(process.env.PORT) || 3001;
const POLL_HEADER = 'x-portal-revision';

const app = express();
app.use(express.json({ limit: '10mb' }));

async function readEnvelope() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { _revision: 0, _updatedAt: null, _seedVersion: 0, data: null };
  }
}

async function writeEnvelope(data, seedVersion = 0) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const current = await readEnvelope();
  const envelope = {
    _revision: (current._revision ?? 0) + 1,
    _updatedAt: new Date().toISOString(),
    _seedVersion: seedVersion || current._seedVersion || 0,
    data,
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(envelope, null, 2), 'utf-8');
  return envelope;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', async (_req, res) => {
  const envelope = await readEnvelope();
  res.setHeader(POLL_HEADER, String(envelope._revision ?? 0));
  res.json(envelope);
});

app.put('/api/state', async (req, res) => {
  if (!req.body?.data) {
    res.status(400).json({ error: 'Missing data payload' });
    return;
  }
  const envelope = await writeEnvelope(req.body.data, req.body._seedVersion ?? 0);
  res.setHeader(POLL_HEADER, String(envelope._revision));
  res.json(envelope);
});

const distPath = path.join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) res.status(404).end();
    });
  });
}

app.listen(PORT, () => {
  console.log(`API Portal server listening on http://localhost:${PORT}`);
  console.log(`Persisted state file: ${DATA_FILE}`);
});
