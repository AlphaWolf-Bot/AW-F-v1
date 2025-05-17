import { securityService } from '../security';
import CryptoJS from 'crypto-js';

jest.mock('crypto-js');

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Token Management', () => {
    it('should set tokens correctly', () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const expiresIn = 3600;

      securityService.setTokens(accessToken, refreshToken, expiresIn);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'token_expiry',
        expect.any(String)
      );
      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
        accessToken,
        expect.any(String)
      );
      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
        refreshToken,
        expect.any(String)
      );
    });

    it('should get access token', () => {
      const mockToken = 'test-token';
      const mockEncrypted = 'encrypted-token';
      localStorage.setItem('token', mockEncrypted);
      (CryptoJS.AES.decrypt as jest.Mock).mockReturnValue({
        toString: () => mockToken,
      });

      const token = securityService.getAccessToken();
      expect(token).toBe(mockToken);
    });

    it('should clear tokens', () => {
      securityService.clearTokens();
      expect(localStorage.removeItem).toHaveBeenCalledTimes(4);
    });

    it('should check token expiry', () => {
      const futureTime = Date.now() + 3600000;
      localStorage.setItem('token_expiry', futureTime.toString());
      expect(securityService.isTokenExpired()).toBeFalsy();

      const pastTime = Date.now() - 3600000;
      localStorage.setItem('token_expiry', pastTime.toString());
      expect(securityService.isTokenExpired()).toBeTruthy();
    });
  });

  describe('CSRF Protection', () => {
    it('should generate CSRF token', () => {
      const token = securityService.generateCSRFToken();
      expect(token).toBeDefined();
      expect(localStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    it('should get CSRF token', () => {
      const mockToken = 'test-csrf-token';
      localStorage.setItem('csrf_token', mockToken);
      expect(securityService.getCSRFToken()).toBe(mockToken);
    });
  });

  describe('Rate Limiting', () => {
    it('should not rate limit new endpoints', () => {
      expect(securityService.isRateLimited('/api/test')).toBeFalsy();
    });

    it('should rate limit after threshold', () => {
      const endpoint = '/api/test';
      const now = Date.now();

      // Simulate 100 requests
      for (let i = 0; i < 100; i++) {
        securityService.isRateLimited(endpoint);
      }

      expect(securityService.isRateLimited(endpoint)).toBeTruthy();
    });

    it('should reset rate limit after time window', () => {
      const endpoint = '/api/test';
      const oldTime = Date.now() - 61000; // Just over 1 minute ago

      // Set old rate limit data
      localStorage.setItem(
        'rate_limit',
        JSON.stringify({
          [endpoint]: Array(100).fill(oldTime),
        })
      );

      expect(securityService.isRateLimited(endpoint)).toBeFalsy();
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data', () => {
      const testData = 'sensitive-data';
      const mockEncrypted = 'encrypted-data';
      const mockDecrypted = 'decrypted-data';

      (CryptoJS.AES.encrypt as jest.Mock).mockReturnValue(mockEncrypted);
      (CryptoJS.AES.decrypt as jest.Mock).mockReturnValue({
        toString: () => mockDecrypted,
      });

      securityService.setTokens(testData, testData, 3600);
      const result = securityService.getAccessToken();

      expect(result).toBe(mockDecrypted);
    });

    it('should handle decryption errors', () => {
      const mockEncrypted = 'invalid-encrypted-data';
      localStorage.setItem('token', mockEncrypted);
      (CryptoJS.AES.decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      const result = securityService.getAccessToken();
      expect(result).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should refresh token successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await securityService.refreshToken();
      expect(result).toBeTruthy();
      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
        mockResponse.accessToken,
        expect.any(String)
      );
    });

    it('should handle refresh failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await securityService.refreshToken();
      expect(result).toBeFalsy();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize input', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = securityService.sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should escape HTML', () => {
      const input = '<div>test</div>';
      const escaped = securityService.escapeHtml(input);
      expect(escaped).toBe('&lt;div&gt;test&lt;/div&gt;');
    });
  });
}); 