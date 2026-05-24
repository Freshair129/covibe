/**
 * Calculates whether the room should be in ducking mode (low music volume).
 * Ducking is active if at least one participant has their voice enabled.
 */
export function checkIsDucking(participants: { voiceEnabled: boolean }[] | undefined): boolean {
  if (!participants) return false;
  return participants.some((p) => p.voiceEnabled);
}

/**
 * Calculates the effective volume based on the base volume and ducking state.
 * If ducking is active, the volume is reduced to 30% of its base value.
 */
export function calculateEffectiveVolume(baseVolume: number, isDucking: boolean): number {
  return isDucking ? baseVolume * 0.3 : baseVolume;
}
