import { describe, it, expect } from 'vitest';
import { sliceFileIntoChunks, reconstructFile } from '../utils/fileTransfer';

describe('fileTransfer', () => {
  it('sliceFileIntoChunks and reconstructFile should preserve data integrity', () => {
    // Create a 32KB dummy ArrayBuffer
    const originalSize = 32 * 1024;
    const originalBuffer = new ArrayBuffer(originalSize);
    const originalData = new Uint8Array(originalBuffer);
    for (let i = 0; i < originalSize; i++) {
      originalData[i] = i % 256;
    }

    // Slice into 16KB chunks
    const chunkSize = 16 * 1024;
    const chunks = sliceFileIntoChunks(originalBuffer, chunkSize);

    // Verify we get exactly 2 chunks
    expect(chunks.length).toBe(2);

    // Verify each chunk has the expected size
    expect(chunks[0].byteLength).toBe(chunkSize);
    expect(chunks[1].byteLength).toBe(chunkSize);

    // Reconstruct the file
    const reconstructedBuffer = reconstructFile(chunks);

    // Verify reconstruction equals original
    expect(reconstructedBuffer.byteLength).toBe(originalSize);
    expect(new Uint8Array(reconstructedBuffer)).toEqual(originalData);
  });
});
