import * as LZString from 'lz-string';

const surpriseStorage: Map<string, string> = (global as any).__SURPRISE_STORE__ || new Map();

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { id } = req.query || {};
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Missing id' });
      return;
    }

    const compressed = surpriseStorage.get(id);
    if (!compressed) {
      res.status(404).json({ error: 'Surprise not found' });
      return;
    }

    let json: string | null = null;
    try {
      json = LZString.decompressFromEncodedURIComponent(compressed);
    } catch (e) {
      json = null;
    }

    if (!json) {
      res.status(500).json({ error: 'Failed to decompress stored data' });
      return;
    }

    const payload = JSON.parse(json);
    res.status(200).json({ payload });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}