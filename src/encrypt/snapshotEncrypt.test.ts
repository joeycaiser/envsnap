import { encryptSnapshot, decryptSnapshot, isEncryptedPayload } from './snapshotEncrypt';
import { Snapshot } from '../storage/types';

const mockSnapshot: Snapshot = {
  id: 'snap-001',
  name: 'test-snap',
  createdAt: '2024-01-01T00:00:00.000Z',
  variables: { API_KEY: 'secret123', NODE_ENV: 'production' },
  tags: ['prod'],
};

const PASSPHRASE = 'super-secret-passphrase';

describe('encryptSnapshot', () => {
  it('returns an EncryptedPayload with required fields', () => {
    const payload = encryptSnapshot(mockSnapshot, PASSPHRASE);
    expect(payload).toHaveProperty('salt');
    expect(payload).toHaveProperty('iv');
    expect(payload).toHaveProperty('tag');
    expect(payload).toHaveProperty('data');
  });

  it('produces different ciphertext on each call (random IV)', () => {
    const p1 = encryptSnapshot(mockSnapshot, PASSPHRASE);
    const p2 = encryptSnapshot(mockSnapshot, PASSPHRASE);
    expect(p1.data).not.toBe(p2.data);
    expect(p1.iv).not.toBe(p2.iv);
  });
});

describe('decryptSnapshot', () => {
  it('round-trips a snapshot correctly', () => {
    const payload = encryptSnapshot(mockSnapshot, PASSPHRASE);
    const result = decryptSnapshot(payload, PASSPHRASE);
    expect(result).toEqual(mockSnapshot);
  });

  it('throws on wrong passphrase', () => {
    const payload = encryptSnapshot(mockSnapshot, PASSPHRASE);
    expect(() => decryptSnapshot(payload, 'wrong-passphrase')).toThrow();
  });

  it('throws on tampered data', () => {
    const payload = encryptSnapshot(mockSnapshot, PASSPHRASE);
    const tampered = { ...payload, data: payload.data.slice(0, -2) + 'ff' };
    expect(() => decryptSnapshot(tampered, PASSPHRASE)).toThrow();
  });
});

describe('isEncryptedPayload', () => {
  it('returns true for a valid payload', () => {
    const payload = encryptSnapshot(mockSnapshot, PASSPHRASE);
    expect(isEncryptedPayload(payload)).toBe(true);
  });

  it('returns false for a plain snapshot', () => {
    expect(isEncryptedPayload(mockSnapshot)).toBe(false);
  });

  it('returns false for null or primitives', () => {
    expect(isEncryptedPayload(null)).toBe(false);
    expect(isEncryptedPayload('string')).toBe(false);
    expect(isEncryptedPayload(42)).toBe(false);
  });
});
