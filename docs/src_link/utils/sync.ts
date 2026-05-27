export type SyncAction = 
  | { type: 'ignore' }
  | { type: 'adjust_rate', rate: number }
  | { type: 'seek', positionSeconds: number };

/**
 * Calculates the required sync action based on drift.
 * @param actualSeconds Current player time
 * @param expectedSeconds Expected time from server
 * @returns SyncAction
 */
export function calculateSyncAction(actualSeconds: number, expectedSeconds: number): SyncAction {
  const driftSeconds = actualSeconds - expectedSeconds;
  const absDrift = Math.abs(driftSeconds);

  if (absDrift > 0.8) {
    return { type: 'seek', positionSeconds: expectedSeconds };
  } 
  
  if (absDrift > 0.25) {
    // If ahead, slow down. If behind, speed up.
    return { type: 'adjust_rate', rate: driftSeconds > 0 ? 0.95 : 1.05 };
  }

  return { type: 'ignore' };
}
