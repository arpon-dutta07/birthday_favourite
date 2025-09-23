import express from 'express';
import { createServer } from 'vite';
import LZString from 'lz-string';
import { nanoid } from 'nanoid';

const app = express();
app.use(express.json({ limit: '50mb' }));

// In-memory storage for development
const surpriseStorage = new Map();

function generateId() {
  return nanoid(10);
}

// API Routes
app.post('/api/surprise', async (req, res) => {
  try {
    let body = req.body;
    let compressed = null;

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
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

app.get('/api/surprise/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Missing id' });
      return;
    }

    const compressed = surpriseStorage.get(id);
    if (!compressed) {
      res.status(404).json({ error: 'Surprise not found' });
      return;
    }

    let json = null;
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
    
    // Decompress image data if needed
    if (payload.images && Array.isArray(payload.images)) {
      payload.images = payload.images.map(img => ({
        ...img,
        dataUrl: img.dataUrl.startsWith('data:') ? img.dataUrl : `data:${img.mimeType || 'image/jpeg'};base64,${img.dataUrl}`,
      }));
    }
    
    res.status(200).json({ payload });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Use vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`🚀 Development server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);