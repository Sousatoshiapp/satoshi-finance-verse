// SECURITY FIX: Replace localStorage with secure storage for sensitive data
import { SecurityAudit } from './security-audit';

export class SecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = 'app_encryption_key';
  
  // Generate or retrieve encryption key using Web Crypto API
  private static async getEncryptionKey(): Promise<CryptoKey> {
    try {
      // Try to get existing key from secure storage
      const existingKey = await this.getStoredKey();
      if (existingKey) {
        return existingKey;
      }

      // Generate new key if none exists
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extractable for storage
        ['encrypt', 'decrypt']
      );

      await this.storeKey(key);
      return key;
    } catch (error) {
      SecurityAudit.logEvent({
        event_type: 'encryption_key_error',
        event_data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'critical'
      });
      throw new Error('Failed to generate encryption key');
    }
  }

  private static async getStoredKey(): Promise<CryptoKey | null> {
    try {
      const keyData = localStorage.getItem(this.ENCRYPTION_KEY_NAME);
      if (!keyData) return null;

      const keyBuffer = this.base64ToArrayBuffer(keyData);
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch {
      return null;
    }
  }

  private static async storeKey(key: CryptoKey): Promise<void> {
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    const keyBase64 = this.arrayBufferToBase64(keyBuffer);
    localStorage.setItem(this.ENCRYPTION_KEY_NAME, keyBase64);
  }

  // Secure storage for sensitive data
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const encryptionKey = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        data
      );

      const encryptedObject = {
        data: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        timestamp: Date.now()
      };

      sessionStorage.setItem(`secure_${key}`, JSON.stringify(encryptedObject));
      
      SecurityAudit.logEvent({
        event_type: 'secure_storage_write',
        event_data: { key, size: value.length },
        severity: 'low'
      });
    } catch (error) {
      SecurityAudit.logEvent({
        event_type: 'secure_storage_write_error',
        event_data: { 
          key, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        severity: 'high'
      });
      throw new Error('Failed to store secure data');
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const storedData = sessionStorage.getItem(`secure_${key}`);
      if (!storedData) return null;

      const encryptedObject = JSON.parse(storedData);
      
      // Check if data is expired (older than 1 hour)
      if (Date.now() - encryptedObject.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem(`secure_${key}`);
        return null;
      }

      const encryptionKey = await this.getEncryptionKey();
      const encryptedData = this.base64ToArrayBuffer(encryptedObject.data);
      const iv = this.base64ToArrayBuffer(encryptedObject.iv);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      SecurityAudit.logEvent({
        event_type: 'secure_storage_read_error',
        event_data: { 
          key, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        severity: 'medium'
      });
      return null;
    }
  }

  static removeSecureItem(key: string): void {
    sessionStorage.removeItem(`secure_${key}`);
    SecurityAudit.logEvent({
      event_type: 'secure_storage_remove',
      event_data: { key },
      severity: 'low'
    });
  }

  // Secure CSRF token management
  static generateCSRFToken(): string {
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenString = Array.from(token, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', tokenString);
    return tokenString;
  }

  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }

  // Utility functions
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Migration function to move existing localStorage data to secure storage
  static async migrateToSecureStorage(): Promise<void> {
    const keysToMigrate = [
      'biometric_credentials',
      'user_session_tokens',
      'financial_data'
    ];

    for (const key of keysToMigrate) {
      const existingData = localStorage.getItem(key);
      if (existingData) {
        try {
          await this.setSecureItem(key, existingData);
          localStorage.removeItem(key);
          
          SecurityAudit.logEvent({
            event_type: 'data_migration_to_secure_storage',
            event_data: { key, migrated: true },
            severity: 'low'
          });
        } catch (error) {
          SecurityAudit.logEvent({
            event_type: 'data_migration_error',
            event_data: { 
              key, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            },
            severity: 'high'
          });
        }
      }
    }
  }
}