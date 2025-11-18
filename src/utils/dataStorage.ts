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

// Store birthday data using GitHub Gist (free and reliable)
export const storeBirthdayData = async (data: BirthdayData): Promise<string> => {
  const shortId = generateShortId();
  
  try {
    // Compress the data
    const compressedData = {
      ...data,
      images: compressImageData(data.images)
    };
    
    // Create a GitHub Gist (anonymous, public)
    const gistData = {
      description: `Birthday surprise data - ${data.name}`,
      public: false,
      files: {
        [`birthday_${shortId}.json`]: {
          content: JSON.stringify(compressedData)
        }
      }
    };

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gistData)
    });

    if (response.ok) {
      const gist = await response.json();
      // Encode the gist ID in the URL so it works on any device
      const encodedGistId = btoa(gist.id); // Base64 encode for compact URL
      return `${window.location.origin}/view/${shortId}?gist=${encodedGistId}`;
    } else {
      throw new Error('GitHub API failed');
    }
  } catch (error) {
    console.warn('GitHub Gist storage failed, using localStorage fallback:', error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem(`birthday_${shortId}`, JSON.stringify(data));
      return `${window.location.origin}/view/${shortId}`;
    } catch (storageError) {
      throw new Error('Both storage methods failed. Data might be too large.');
    }
  }
};

// Retrieve birthday data from short ID and optional gist ID
export const retrieveBirthdayData = async (shortId: string, gistIdParam?: string): Promise<BirthdayData | null> => {
  try {
    // First try to use gist ID from URL parameter (works on any device)
    let gistId = gistIdParam;
    
    // If not in URL, check localStorage as fallback (for backward compatibility)
    if (!gistId) {
      gistId = localStorage.getItem(`birthday_${shortId}`) || undefined;
    }
    
    // Decode gist ID if it was base64 encoded
    if (gistId && gistId.length > 20) {
      try {
        // Try to decode if it looks like base64
        const decodedGistId = gistId.length === 24 ? atob(gistId) : gistId;
        const response = await fetch(`https://api.github.com/gists/${decodedGistId}`);
        if (response.ok) {
          const gist = await response.json();
          const fileName = Object.keys(gist.files)[0];
          const content = gist.files[fileName].content;
          const data = JSON.parse(content);
          
          // Decompress the data
          return {
            ...data,
            images: decompressImageData(data.images)
          };
        }
      } catch (error) {
        console.warn('Failed to retrieve from GitHub:', error);
      }
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(`birthday_${shortId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored data:', error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
};
