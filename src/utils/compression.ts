import * as LZString from 'lz-string';

interface Payload {
  name: string;
  age: string;
  message: string;
  images: Array<{ name: string; dataUrl: string; id?: string }>;
  audio: { name: string; dataUrl: string } | null;
  createdAt: string;
}

// More aggressive compression for shorter URLs
export const compressImage = (file: File, maxDimension = 600, quality = 0.5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let newWidth, newHeight;
      
      if (width > height) {
        newWidth = Math.min(width, maxDimension);
        newHeight = newWidth / aspectRatio;
      } else {
        newHeight = Math.min(height, maxDimension);
        newWidth = newHeight * aspectRatio;
      }

      // Set canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Create data URL from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const encodePayload = (payload: Payload): string => {
  try {
    const jsonString = JSON.stringify(payload);
    let compressed = LZString.compressToEncodedURIComponent(jsonString);
    
    // Double-check that the compressed data can be decoded
    let testDecode = LZString.decompressFromEncodedURIComponent(compressed);
    if (!testDecode) {
      // Fallback to Base64 if LZString fails
      compressed = btoa(encodeURIComponent(jsonString));
      testDecode = decodeURIComponent(atob(compressed));
      if (!testDecode || testDecode !== jsonString) {
        throw new Error('Both compression methods failed');
      }
    }
    
    // Use clean URL with BrowserRouter and add a version identifier
    const url = `${window.location.origin}/view?data=${compressed}&v=2`;
    
    // Warn if URL is very long (might get truncated)
    if (url.length > 8000) {
      console.warn('URL is very long and may get truncated when shared:', url.length);
    }
    
    return url;
  } catch (error) {
    throw new Error('Failed to encode payload: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const decodePayload = (encodedData: string): Payload => {
  try {
    let decompressed: string | null = null;
    
    // Try LZString decompression first
    try {
      decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    } catch (e) {
      console.warn('LZString decompression failed, trying Base64:', e);
    }
    
    // If LZString failed, try Base64 decoding
    if (!decompressed) {
      try {
        decompressed = decodeURIComponent(atob(encodedData));
      } catch (e) {
        console.warn('Base64 decompression also failed:', e);
        throw new Error('Both decompression methods failed');
      }
    }
    
    if (!decompressed) {
      throw new Error('Failed to decompress data - result is empty');
    }
    
    const payload = JSON.parse(decompressed);
    
    // Validate payload structure
    if (!payload.name || !Array.isArray(payload.images)) {
      throw new Error('Invalid payload structure - missing name or images array');
    }
    
    return payload;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to decode payload: ${errorMsg}`);
  }
};

export const estimateEncodedSize = (payload: Payload): number => {
  const jsonString = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(jsonString).length;
};