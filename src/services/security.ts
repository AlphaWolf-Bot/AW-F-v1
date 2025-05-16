import { handleApiError } from './errorHandler';

class SecurityService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() > parseInt(expiryTime);
  }

  clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = await response.json();
      this.setTokens(accessToken, newRefreshToken, expiresIn);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', handleApiError(error));
      this.clearTokens();
      return false;
    }
  }

  // Rate limiting
  private readonly RATE_LIMIT_KEY = 'rate_limit';
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS = 60; // 60 requests per minute

  isRateLimited(endpoint: string): boolean {
    const key = `${this.RATE_LIMIT_KEY}_${endpoint}`;
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Remove old requests
    const recentRequests = requests.filter((time: number) => now - time < this.RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return true;
    }

    // Add new request
    recentRequests.push(now);
    localStorage.setItem(key, JSON.stringify(recentRequests));
    return false;
  }

  // XSS Protection
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // CSRF Protection
  generateCSRFToken(): string {
    const token = Math.random().toString(36).substring(2);
    localStorage.setItem('csrf_token', token);
    return token;
  }

  getCSRFToken(): string | null {
    return localStorage.getItem('csrf_token');
  }

  validateCSRFToken(token: string): boolean {
    const storedToken = this.getCSRFToken();
    return storedToken === token;
  }
}

export const securityService = new SecurityService(); 