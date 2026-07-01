import { generateGeminiContent, getGeminiApiKey, isGeminiApiKeyConfigured } from '../server/gemini-proxy.mjs';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

console.log('configured:', isGeminiApiKeyConfigured());
console.log('key_present:', Boolean(getGeminiApiKey()));

const result = await generateGeminiContent({
  prompt: 'Return JSON only: {"text":"live gemini works"}',
  jsonMode: true,
});

console.log('ok:', result.ok);
console.log('status:', result.status);
console.log('model:', result.model ?? 'none');
console.log('text:', result.text ?? result.error?.slice(0, 200));

process.exit(result.ok ? 0 : 1);
