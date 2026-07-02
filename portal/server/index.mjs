import express from 'express';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { emptyEnvelope, normalizeData, validateData } from './state-schema.mjs';
import { registerGeminiRoutes } from './gemini-routes.mjs';
import { registerSdkRoutes } from './sdk-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith("'") && value.endsWith("'"))
      || (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portal-state.json');
const TMP_FILE = `${DATA_FILE}.tmp`;
const BAK_FILE = `${DATA_FILE}.bak`;
const PORT = Number(process.env.PORT) || 3001;
const POLL_HEADER = 'x-portal-revision';

const app = express();
app.use(express.json({ limit: '25mb' }));

// Serialize all writes through a single promise chain so concurrent PUTs
// cannot interleave their read-modify-write cycles (lost-update protection).
let writeChain = Promise.resolve();
function enqueueWrite(task) {
  const run = writeChain.then(task, task);
  // Keep the chain alive even if a task rejects.
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function parseFile(file) {
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Read the persisted envelope with recovery:
 * 1. Try the live file.
 * 2. On corruption, try the .bak file.
 * 3. If both fail, quarantine the corrupt file and return an empty envelope.
 */
async function readEnvelope() {
  if (!existsSync(DATA_FILE)) return emptyEnvelope();
  try {
    return await parseFile(DATA_FILE);
  } catch (primaryErr) {
    console.error('[state] live file unreadable, attempting .bak recovery:', primaryErr.message);
    if (existsSync(BAK_FILE)) {
      try {
        const recovered = await parseFile(BAK_FILE);
        console.warn('[state] recovered from .bak');
        return recovered;
      } catch (bakErr) {
        console.error('[state] .bak also unreadable:', bakErr.message);
      }
    }
    try {
      const quarantine = `${DATA_FILE}.corrupt-${Date.now()}`;
      await fs.rename(DATA_FILE, quarantine);
      console.error(`[state] quarantined corrupt file to ${path.basename(quarantine)}`);
    } catch {
      /* ignore quarantine failures */
    }
    return emptyEnvelope();
  }
}

/**
 * Atomically persist a new envelope: write to a temp file, fsync-style flush via
 * writeFile, back up the previous good file, then rename temp over the target.
 * rename(2) is atomic on the same filesystem, so readers never see a partial file.
 */
async function writeEnvelope(data, seedVersion, baseRevision) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const current = await readEnvelope();

  // Optimistic concurrency: if the client based its edit on an older revision,
  // reject so it can refetch/merge instead of clobbering a newer write.
  if (typeof baseRevision === 'number' && (current._revision ?? 0) !== baseRevision) {
    const conflict = new Error('revision_conflict');
    conflict.code = 'CONFLICT';
    conflict.current = current;
    throw conflict;
  }

  const envelope = {
    _revision: (current._revision ?? 0) + 1,
    _updatedAt: new Date().toISOString(),
    _seedVersion: seedVersion || current._seedVersion || 0,
    data: normalizeData(data),
  };

  const serialized = JSON.stringify(envelope, null, 2);
  await fs.writeFile(TMP_FILE, serialized, 'utf-8');
  if (existsSync(DATA_FILE)) {
    await fs.copyFile(DATA_FILE, BAK_FILE);
  }
  await fs.rename(TMP_FILE, DATA_FILE);
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

registerGeminiRoutes(app);
registerSdkRoutes(app);

app.put('/api/state', async (req, res) => {
  if (!req.body?.data) {
    res.status(400).json({ error: 'Missing data payload' });
    return;
  }

  const { valid, errors } = validateData(req.body.data);
  if (!valid) {
    res.status(400).json({ error: 'Invalid state payload', details: errors.slice(0, 20) });
    return;
  }

  try {
    const envelope = await enqueueWrite(() =>
      writeEnvelope(req.body.data, req.body._seedVersion ?? 0, req.body._baseRevision),
    );
    res.setHeader(POLL_HEADER, String(envelope._revision));
    res.json(envelope);
  } catch (err) {
    if (err.code === 'CONFLICT') {
      res.setHeader(POLL_HEADER, String(err.current._revision ?? 0));
      res.status(409).json({ error: 'revision_conflict', current: err.current });
      return;
    }
    console.error('[state] write failed:', err);
    res.status(500).json({ error: 'Failed to persist state' });
  }
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
