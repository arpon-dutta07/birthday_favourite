// In-memory storage (for development)
// Replace with a real database in production
const surpriseStorage = new Map<string, any>();

// Generate a short, unique ID
const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST: Store birthday surprise data
  if (req.method === 'POST') {
    try {
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      // Generate a short ID
      const shortId = generateShortId();

      // Store the data server-side
      surpriseStorage.set(shortId, data);

      // Return only the short ID
      return res.status(200).json({
        success: true,
        shortId,
        url: `/view/${shortId}`,
      });
    } catch (error) {
      console.error('Error storing surprise:', error);
      return res.status(500).json({ error: 'Failed to store surprise data' });
    }
  }

  // GET: Retrieve birthday surprise data
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Retrieve the data from storage
      const data = surpriseStorage.get(id);

      if (!data) {
        return res.status(404).json({ error: 'Surprise not found. The link may be invalid or expired.' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error retrieving surprise:', error);
      return res.status(500).json({ error: 'Failed to retrieve surprise data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
