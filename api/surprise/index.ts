import type { IncomingMessage, ServerResponse } from 'http';
import * as LZString from 'lz-string';

// In-memory storage (ephemeral). Replace with a real database for production.
const surpriseStorage: Map<string, string> = (global as any).__SURPRISE_STORE__ || new Map();
if (!(global as any).__SURPRISE_STORE__) {
  (global as any).__SURPRISE_STORE__ = surpriseStorage;
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
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', (err: Error) => reject(err));
    });

    const raw = Buffer.concat(chunks).toString('utf-8');
    const body = raw ? JSON.parse(raw) : {};

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