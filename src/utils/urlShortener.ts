// Simple URL shortener using base conversion for local storage
export class URLShortener {
  private static STORAGE_KEY = 'birthday_urls';
  private static BASE_URL = '/s/';

  // Generate a short ID using base36
  private static generateShortId(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  // Store the full URL and return a short link
  static createShortUrl(fullUrl: string): string {
    const shortId = this.generateShortId();
    const storedUrls = this.getStoredUrls();
    
    // Extract just the data parameter
    const urlObj = new URL(fullUrl);
    const data = urlObj.searchParams.get('data');
    
    if (data) {
      storedUrls[shortId] = data;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedUrls));
      return `${window.location.origin}${this.BASE_URL}${shortId}`;
    }
    
    return fullUrl; // Fallback to original URL
  }

  // Retrieve the full URL from short ID
  static resolveShortUrl(shortId: string): string | null {
    const storedUrls = this.getStoredUrls();
    const data = storedUrls[shortId];
    
    if (data) {
      return `/view?data=${data}`;
    }
    
    return null;
  }

  // Get all stored URLs
  private static getStoredUrls(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Clean up old entries (optional, for maintenance)
  static cleanup(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
