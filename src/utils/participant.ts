import { PARTICIPANT_KEY } from "../constants";

export function makeParticipantId() {
  const existing = localStorage.getItem(PARTICIPANT_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(PARTICIPANT_KEY, id);
  return id;
}
