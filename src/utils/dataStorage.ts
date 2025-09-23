import * as LZString from 'lz-string';

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

// Helper: build a purely client-side encoded URL (fallback for local dev)
const buildEncodedLink = (data: BirthdayData): string => {
  const minimized = {
    ...data,
    images: compressImageData(data.images),
    __v: 2,
    __imgFmt: 'image/jpeg;base64,'
  } as any;
  const json = JSON.stringify(minimized);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${window.location.origin}/view#?data=${compressed}&v=2`;
};

// Store birthday data via serverless API (in-memory Map on Vercel)
export const storeBirthdayData = async (data: BirthdayData): Promise<string> => {
  // Minify images for transport
  const compressedData = {
    ...data,
    images: compressImageData(data.images),
  };

  // Pre-compress payload to drastically reduce request size
  const json = JSON.stringify(compressedData);
  const compressed = LZString.compressToEncodedURIComponent(json);

  try {
    const response = await fetch('/api/surprise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compressed }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    // Some hosts may accidentally return HTML with 200. Guard against non-JSON.
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Non-JSON response from API');
    }

    const { id } = await response.json();

    // Return a clean short link for cross-device sharing
    return `${window.location.origin}/surprise/${id}`;
  } catch (e) {
    // Fallback: return self-contained encoded URL directly (works everywhere)
    return buildEncodedLink(data);
  }
};

// Retrieve birthday data from short ID via serverless API
export const retrieveBirthdayData = async (shortId: string): Promise<BirthdayData | null> => {
  try {
    const response = await fetch(`/api/surprise/${shortId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Non-JSON response');
    }

    const { payload } = await response.json();

    return {
      ...payload,
      images: decompressImageData(payload.images),
    } as BirthdayData;
  } catch (err) {
    // Return null to allow caller to use hash-based fallback
    return null;
  }
};
