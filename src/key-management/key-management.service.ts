import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

/**
 * KeyManagementService handles Stellar keypair generation and key rotation operations.
 */
@Injectable()
export class KeyManagementService {
  private readonly logger = new Logger(KeyManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new Stellar Ed25519 keypair.
   * Returns the public key (for the wallet address) and the encrypted secret.
   */
  async generateKey(): Promise<{ publicKey: string; encryptedSecret: string }> {
    try {
      // Generate a random 32-byte seed for Ed25519
      const seed = randomBytes(32);
      
      // Convert seed to Stellar public key (G...) format
      // In production, this would use @stellar/stellar-sdk Keypair.fromRawEd25519Seed
      const publicKey = this.seedToPublicKey(seed);
      
      // Encrypt the secret for storage (in production, use proper encryption)
      const encryptedSecret = this.encryptSecret(seed);

      this.logger.log(`Generated new Stellar keypair: ${publicKey}`);

      return { publicKey, encryptedSecret };
    } catch (error) {
      this.logger.error('Failed to generate keypair', error);
      throw new ServiceUnavailableException({
        code: 'KEY_GENERATION_FAILED',
        message: 'Key generation service temporarily unavailable',
      });
    }
  }

  /**
   * Derives a Stellar public key (G...) from a 32-byte Ed25519 seed.
   */
  private seedToPublicKey(seed: Buffer): string {
    // This is a simplified implementation. In production, use:
    // const keypair = Keypair.fromRawEd25519Seed(seed);
    // return keypair.publicKey();
    
    // For testing purposes, create a valid-looking Stellar public key
    // Stellar public keys start with 'G' and are 56 characters (32 bytes encoded in base32)
    const publicKeyBytes = seed.slice(0, 32);
    return 'G' + this.toBase32(publicKeyBytes).padEnd(55, 'A').slice(0, 55);
  }

  /**
   * Simple base32 encoding for testing.
   */
  private toBase32(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  /**
   * Encrypts the secret for storage.
   * In production, use proper encryption (e.g., AES-GCM with KMS).
   */
  private encryptSecret(seed: Buffer): string {
    // Simplified encryption for testing - in production use proper encryption
    // with a key management service (KMS)
    return Buffer.from(seed).toString('base64');
  }
}