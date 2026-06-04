import { useCallback, useRef } from 'react';
import { FileSyncPayload } from '../types';
import { sliceFileIntoChunks, reconstructFile } from '../utils/fileTransfer';
import { saveFile } from '../utils/db';

export function useFileSync(sendP2P: (data: any) => boolean) {
  // Store metadata and chunks for incoming files
  const incomingFilesRef = useRef<Record<string, { metadata: any; chunks: ArrayBuffer[] }>>({});

  const sendFileSync = useCallback(async (hash: string, data: ArrayBuffer, metadata: any) => {
    const chunks = sliceFileIntoChunks(data, 16384); // 16KB chunks
    
    // Send Offer
    sendP2P({ type: 'FILE_SYNC', payload: { action: 'offer', metadata } });

    // Send Chunks
    for (let i = 0; i < chunks.length; i++) {
      sendP2P({ 
        type: 'FILE_SYNC', 
        payload: { action: 'chunk', hash, chunk: chunks[i], index: i } 
      });
      // Small delay to avoid flooding channel
      await new Promise(r => setTimeout(r, 10));
    }

    // Send Complete
    sendP2P({ type: 'FILE_SYNC', payload: { action: 'complete', hash } });
  }, [sendP2P]);

  const handleFileSync = useCallback(async (payload: FileSyncPayload) => {
    if (payload.action === 'offer') {
      incomingFilesRef.current[payload.metadata.hash] = { metadata: payload.metadata, chunks: [] };
      return;
    }

    if (payload.action === 'chunk') {
      const fileData = incomingFilesRef.current[payload.hash];
      if (fileData) {
        fileData.chunks[payload.index] = payload.chunk;
      }
      return;
    }

    if (payload.action === 'complete') {
      const fileData = incomingFilesRef.current[payload.hash];
      if (fileData) {
        const fullBuffer = reconstructFile(fileData.chunks);
        await saveFile(payload.hash, fullBuffer, fileData.metadata);
        console.log('File saved successfully:', fileData.metadata.title);
        delete incomingFilesRef.current[payload.hash];
      }
    }
  }, []);

  return { sendFileSync, handleFileSync };
}
