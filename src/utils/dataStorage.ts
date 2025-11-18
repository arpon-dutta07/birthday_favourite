// Simple and reliable data storage using server-side API
interface BirthdayData {
  name: string;
  age: string;
  message: string;
  images: Array<{ name: string; dataUrl: string; id?: string }>;
  audio?: { name: string; dataUrl: string } | null;
  createdAt: string;
}

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

// Store birthday data using server-side API
export const storeBirthdayData = async (data: BirthdayData): Promise<string> => {
  try {
    // Compress the data
    const compressedData = {
      ...data,
      images: compressImageData(data.images)
    };

    // Send to server API
    const response = await fetch('/api/surprise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: compressedData })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    
    if (result.success && result.url) {
      return `${window.location.origin}${result.url}`;
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('Failed to store surprise:', error);
    throw new Error('Failed to save your surprise. Please try again.');
  }
};

// Retrieve birthday data from short ID
export const retrieveBirthdayData = async (shortId: string): Promise<BirthdayData | null> => {
  try {
    // Fetch from server API
    const response = await fetch(`/api/surprise?id=${shortId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Surprise not found');
      } else {
        console.warn('Failed to retrieve surprise:', response.statusText);
      }
      return null;
    }

    const data = await response.json();

    // Decompress the data
    return {
      ...data,
      images: decompressImageData(data.images)
    };
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
};
