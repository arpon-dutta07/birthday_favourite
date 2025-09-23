import * as LZString from 'lz-string';

export const config = { runtime: 'nodejs' };

// In-memory storage (ephemeral). Replace with a real database for production).
const surpriseStorage: Map<string, string> = (globalThis as any).__SURPRISE_STORE__ || new Map<string, string>();
if (!(globalThis as any).__SURPRISE_STORE__) {
  (globalThis as any).__SURPRISE_STORE__ = surpriseStorage;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Prefer pre-parsed body (Vercel/Next parses JSON when header is set)
    let body = req.body;

    // Fallback: manually parse stream if body is missing
    if (!body) {
      const raw: string = await new Promise<string>((resolve, reject) => {
        let data = '';
        try { req.setEncoding && req.setEncoding('utf8'); } catch {}
        req.on('data', (chunk: any) => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', (err: Error) => reject(err));
      });
      body = raw ? JSON.parse(raw) : {};
    }

    // Accept either a pre-compressed string or a payload object
    let compressed: string | null = null;

    if (typeof body.compressed === 'string' && body.compressed.length > 0) {
      compressed = body.compressed;
    } else if (body.payload) {
      const json = JSON.stringify(body.payload);
      compressed = LZString.compressToEncodedURIComponent(json);
      if (!compressed) {
        throw new Error('Compression failed');
      }
    } else {
      res.status(400).json({ error: 'Invalid request body. Provide { payload } or { compressed }.' });
      return;
    }

    const id = generateId();
    surpriseStorage.set(id, compressed);

    res.status(200).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}