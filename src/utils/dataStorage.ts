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



// Better compression specifically for images
const compressImageData = (images: Array<{ name: string; dataUrl: string; id?: string }>): Array<{ name: string; dataUrl: string; id?: string; mimeType?: string }> => {
  return images.map(img => {
    // Extract mime type from data URL
    const mimeMatch = img.dataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = img.dataUrl.replace(/^data:[^;]+;base64,/, '');
    
    return {
      ...img,
      dataUrl: base64Data,
      mimeType
    };
  });
};

const decompressImageData = (images: Array<{ name: string; dataUrl: string; id?: string; mimeType?: string }>): Array<{ name: string; dataUrl: string; id?: string }> => {
  return images.map(img => ({
    ...img,
    // Add back the data URL prefix with correct mime type
    dataUrl: img.dataUrl.startsWith('data:') ? img.dataUrl : `data:${img.mimeType || 'image/jpeg'};base64,${img.dataUrl}`,
  }));
};



// Store birthday data via serverless API (in-memory Map on Vercel)
export const storeBirthdayData = async (data: BirthdayData): Promise<string> => {
  console.log('dataStorage: Storing birthday data:', data);
  
  // Minify images for transport
  const compressedData = {
    ...data,
    images: compressImageData(data.images),
  };

  console.log('dataStorage: Compressed data:', compressedData);

  // Pre-compress payload to drastically reduce request size
  const json = JSON.stringify(compressedData);
  const compressed = LZString.compressToEncodedURIComponent(json);

  console.log('dataStorage: JSON length:', json.length, 'Compressed length:', compressed.length);

  try {
    console.log('dataStorage: Sending POST request to /api/surprise');
    const response = await fetch('/api/surprise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compressed }),
    });

    console.log('dataStorage: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('dataStorage: API error response:', errorText);
      throw new Error(errorText);
    }

    // Some hosts may accidentally return HTML with 200. Guard against non-JSON.
    const contentType = response.headers.get('content-type') || '';
    console.log('dataStorage: Response content-type:', contentType);
    
    if (!contentType.includes('application/json')) {
      throw new Error('Non-JSON response from API');
    }

    const responseData = await response.json();
    console.log('dataStorage: API response data:', responseData);
    
    const { id } = responseData;

    // Return a clean short link for cross-device sharing
    const shareableUrl = `${window.location.origin}/surprise/${id}`;
    console.log('dataStorage: Generated shareable URL:', shareableUrl);
    
    return shareableUrl;
  } catch (e) {
    console.error('dataStorage: Error storing data:', e);
    // No fallback to encoded URLs; enforce short-link approach only
    throw e;
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
