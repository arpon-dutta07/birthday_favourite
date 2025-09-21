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
      // Store the mapping locally for faster retrieval
      localStorage.setItem(`birthday_${shortId}`, gist.id);
      return `${window.location.origin}/view/${shortId}`;
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

// Retrieve birthday data from short ID
export const retrieveBirthdayData = async (shortId: string): Promise<BirthdayData | null> => {
  try {
    // First check if we have a gist ID stored locally
    const gistId = localStorage.getItem(`birthday_${shortId}`);
    
    if (gistId && gistId.length > 20) { // Gist IDs are longer than 20 chars
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
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
