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
export const compressImage = (file: File, maxDimension = 800, quality = 0.65): Promise<string> => {
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
  const jsonString = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  // Use clean URL with BrowserRouter
  return `${window.location.origin}/view?data=${compressed}`;
};

export const decodePayload = (encodedData: string): Payload => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!decompressed) {
      throw new Error('Failed to decompress data');
    }
    
    const payload = JSON.parse(decompressed);
    
    // Validate payload structure
    if (!payload.name || !Array.isArray(payload.images)) {
      throw new Error('Invalid payload structure');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Failed to decode payload');
  }
};

export const estimateEncodedSize = (payload: Payload): number => {
  const jsonString = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(jsonString).length;
};