// Simple and reliable data storage using multiple strategies
interface BirthdayData {
  name: string;
  age: string;
  message: string;
  images: Array<{ name: string; dataUrl: string; id?: string }>;
  audio?: { name: string; dataUrl: string } | null;
  createdAt: string;
}

// Generate a short, shareable ID
const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Better compression specifically for images
const compressImageData = (images: Array<{ name: string; dataUrl: string; id?: string }>): Array<{ name: string; dataUrl: string; id?: string }> => {
  return images.map(img => ({
    ...img,
    // Remove data URL prefix to save space, we'll add it back when retrieving
    dataUrl: img.dataUrl.replace('data:image/jpeg;base64,', ''),
  }));
};

const decompressImageData = (images: Array<{ name: string; dataUrl: string; id?: string }>): Array<{ name: string; dataUrl: string; id?: string }> => {
  return images.map(img => ({
    ...img,
    // Add back the data URL prefix
    dataUrl: img.dataUrl.startsWith('data:') ? img.dataUrl : `data:image/jpeg;base64,${img.dataUrl}`,
  }));
};

// Store birthday data via serverless API (in-memory Map on Vercel)
export const storeBirthdayData = async (data: BirthdayData): Promise<string> => {
  // Minify images for transport
  const compressedData = {
    ...data,
    images: compressImageData(data.images),
  };

  const response = await fetch('/api/surprise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: compressedData }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`API error: ${msg}`);
  }

  const { id } = await response.json();
  return `${window.location.origin}/view/${id}`;
};

// Retrieve birthday data from short ID via serverless API
export const retrieveBirthdayData = async (shortId: string): Promise<BirthdayData | null> => {
  const response = await fetch(`/api/surprise/${shortId}`);
  if (!response.ok) return null;

  const { payload } = await response.json();

  // Decompress images (re-add prefix)
  return {
    ...payload,
    images: decompressImageData(payload.images),
  } as BirthdayData;
};
