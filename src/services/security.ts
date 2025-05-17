import { handleApiError } from './errorHandler';
import CryptoJS from 'crypto-js';

class SecurityService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly CSRF_TOKEN_KEY = 'csrf_token';
  private readonly RATE_LIMIT_KEY = 'rate_limit';
  private readonly ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key';

  // Token Management
  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiryTime = Date.now() + expiresIn * 1000;
    this.setEncryptedItem(this.TOKEN_KEY, accessToken);
    this.setEncryptedItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  getAccessToken(): string | null {
    return this.getEncryptedItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getEncryptedItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.CSRF_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() > parseInt(expiryTime);
  }

  // CSRF Protection
  generateCSRFToken(): string {
    const token = this.generateRandomString(32);
    localStorage.setItem(this.CSRF_TOKEN_KEY, token);
    return token;
  }

  getCSRFToken(): string | null {
    return localStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  // Rate Limiting
  isRateLimited(endpoint: string): boolean {
    const rateLimits = this.getRateLimits();
    const now = Date.now();
    const endpointLimit = rateLimits[endpoint];

    if (!endpointLimit) return false;

    // Clean up old entries
    const recentRequests = endpointLimit.filter(time => now - time < 60000);
    if (recentRequests.length >= 100) { // 100 requests per minute
      return true;
    }

    // Update rate limits
    recentRequests.push(now);
    rateLimits[endpoint] = recentRequests;
    this.setRateLimits(rateLimits);

    return false;
  }

  private getRateLimits(): Record<string, number[]> {
    const limits = localStorage.getItem(this.RATE_LIMIT_KEY);
    return limits ? JSON.parse(limits) : {};
  }

  private setRateLimits(limits: Record<string, number[]>) {
    localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(limits));
  }

  // Encryption
  private setEncryptedItem(key: string, value: string) {
    const encrypted = CryptoJS.AES.encrypt(value, this.ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encrypted);
  }

  private getEncryptedItem(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting item:', error);
      return null;
    }
  }

  // Token Refresh
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken() || '',
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

  // Utility Functions
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // XSS Protection
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export const securityService = new SecurityService(); 