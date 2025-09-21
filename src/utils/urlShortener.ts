// URL shortener that creates shareable links without relying on localStorage
export class URLShortener {
  // Instead of using localStorage-based shortening, we'll focus on compression
  // and accept longer URLs to ensure cross-device compatibility
  
  static createShortUrl(fullUrl: string): string {
    // For cross-device compatibility, we should avoid localStorage-based shortening
    // Instead, return the full URL - modern browsers and messaging apps can handle long URLs
    return fullUrl;
    
    // Alternative approach: If URL is still too long, we could implement
    // server-based shortening or use a third-party service, but for now
    // we prioritize functionality over URL length
  }

  // This method is kept for backward compatibility with existing short URLs
  // but will only work for URLs created on the same device
  static resolveShortUrl(shortId: string): string | null {
    try {
      const stored = localStorage.getItem('birthday_urls');
      const storedUrls = stored ? JSON.parse(stored) : {};
      const data = storedUrls[shortId];
      
      if (data) {
        return `/view?data=${data}`;
      }
    } catch {
      // Ignore errors and return null
    }
    
    return null;
  }

  // Clean up old entries (optional, for maintenance)
  static cleanup(): void {
    localStorage.removeItem('birthday_urls');
  }
}
