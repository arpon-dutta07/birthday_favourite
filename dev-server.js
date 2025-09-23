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
    console.log('POST /api/surprise - Request body keys:', Object.keys(req.body));
    let body = req.body;
    let compressed = null;

    if (typeof body.compressed === 'string' && body.compressed.length > 0) {
      compressed = body.compressed;
      console.log('POST /api/surprise - Using pre-compressed data, length:', compressed.length);
    } else if (body.payload) {
      const json = JSON.stringify(body.payload);
      compressed = LZString.compressToEncodedURIComponent(json);
      if (!compressed) {
        throw new Error('Compression failed');
      }
      console.log('POST /api/surprise - Compressed payload, original length:', json.length, 'compressed length:', compressed.length);
    } else {
      console.log('POST /api/surprise - Invalid request body');
      res.status(400).json({ error: 'Invalid request body. Provide { payload } or { compressed }.' });
      return;
    }

    const id = generateId();
    surpriseStorage.set(id, compressed);
    console.log('POST /api/surprise - Stored data with ID:', id, 'Storage size:', surpriseStorage.size);

    res.status(200).json({ id });
  } catch (err) {
    console.error('POST /api/surprise - Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

app.get('/api/surprise/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('GET /api/surprise/:id - Requested ID:', id, 'Storage size:', surpriseStorage.size);
    console.log('GET /api/surprise/:id - Available IDs:', Array.from(surpriseStorage.keys()));
    
    if (!id || typeof id !== 'string') {
      console.log('GET /api/surprise/:id - Missing or invalid ID');
      res.status(400).json({ error: 'Missing id' });
      return;
    }

    const compressed = surpriseStorage.get(id);
    if (!compressed) {
      console.log('GET /api/surprise/:id - Surprise not found for ID:', id);
      res.status(404).json({ error: 'Surprise not found' });
      return;
    }

    console.log('GET /api/surprise/:id - Found compressed data, length:', compressed.length);

    let json = null;
    try {
      json = LZString.decompressFromEncodedURIComponent(compressed);
    } catch (e) {
      console.error('GET /api/surprise/:id - Decompression error:', e);
      json = null;
    }

    if (!json) {
      console.log('GET /api/surprise/:id - Failed to decompress data');
      res.status(500).json({ error: 'Failed to decompress stored data' });
      return;
    }

    const payload = JSON.parse(json);
    console.log('GET /api/surprise/:id - Successfully parsed payload, keys:', Object.keys(payload));
    
    // Decompress image data if needed
    if (payload.images && Array.isArray(payload.images)) {
      payload.images = payload.images.map(img => ({
        ...img,
        dataUrl: img.dataUrl.startsWith('data:') ? img.dataUrl : `data:${img.mimeType || 'image/jpeg'};base64,${img.dataUrl}`,
      }));
      console.log('GET /api/surprise/:id - Processed', payload.images.length, 'images');
    }
    
    res.status(200).json({ payload });
  } catch (err) {
    console.error('GET /api/surprise/:id - Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Use vite's connect instance as middleware, but only for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    vite.ssrFixStacktrace(req, res, next);
  });
  
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    vite.middlewares(req, res, next);
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`🚀 Development server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);