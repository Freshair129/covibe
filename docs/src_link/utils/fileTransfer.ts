/**
 * Slices an ArrayBuffer into chunks of a specified size.
 * @param data - The original ArrayBuffer to slice.
 * @param chunkSize - The desired size of each chunk.
 * @returns An array of ArrayBuffers, each containing a chunk of the original data.
 */
export function sliceFileIntoChunks(data: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
  const result: ArrayBuffer[] = [];
  const uint8Array = new Uint8Array(data);
  let offset = 0;

  while (offset < uint8Array.length) {
    const end = Math.min(offset + chunkSize, uint8Array.length);
    const chunk = uint8Array.slice(offset, end);
    result.push(chunk.buffer);
    offset = end;
  }

  return result;
}

/**
 * Reconstructs a single ArrayBuffer from an array of chunks.
 * @param chunks - An array of ArrayBuffers to concatenate.
 * @returns A single ArrayBuffer containing the concatenated data.
 */
export function reconstructFile(chunks: ArrayBuffer[]): ArrayBuffer {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    const uint8Chunk = new Uint8Array(chunk);
    result.set(uint8Chunk, offset);
    offset += uint8Chunk.length;
  }

  return result.buffer;
}
