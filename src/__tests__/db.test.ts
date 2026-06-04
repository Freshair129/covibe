/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveFile, getFile, DB_NAME, STORE_NAME } from '../utils/db';

// Simple mock for IndexedDB
const mockDB: Record<string, any> = {};
const mockIDB = {
  open: vi.fn((name: string) => {
    return {
      onupgradeneeded: vi.fn(),
      onsuccess: vi.fn(),
      onerror: vi.fn(),
      result: {
        createObjectStore: vi.fn(),
        transaction: vi.fn((storeName, mode) => ({
          objectStore: vi.fn(() => ({
            put: vi.fn((value, key) => {
              mockDB[key] = value;
              return { onsuccess: vi.fn(), onerror: vi.fn() };
            }),
            get: vi.fn((key) => {
              return { result: mockDB[key], onsuccess: vi.fn(), onerror: vi.fn() };
            })
          }))
        }))
      }
    };
  })
};

global.indexedDB = mockIDB as unknown as IDBFactory;

describe('src/utils/db.ts', () => {
  beforeEach(() => {
    Object.keys(mockDB).forEach(key => delete mockDB[key]);
  });

  it.skip('should save and retrieve file metadata/data correctly', async () => {
    const hash = 'test-hash';
    const data = new ArrayBuffer(8);
    const metadata = { title: 'test.mp3' };

    await saveFile(hash, data, metadata);
    const result = await getFile(hash);

    expect(result).not.toBeNull();
    expect(result?.data).toEqual(data);
    expect(result?.metadata).toEqual(metadata);
  });
});
