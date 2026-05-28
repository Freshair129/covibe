---
id: ALGO--DRIFT-CORRECTION
tier: master
created_at: 2026-05-29T03:11:52.721+07:00
phase: 3
type: algo
status: active
vault_id: covibe
title: YouTube Player Drift Correction Algorithm
tags: [functional, video-sync, websocket]
domain: core-logic
crosslinks:
  used_by: [App.tsx]
  references: [EABS-01]
linked_symbols: [calculateCorrection]
---

# ALGO — YouTube Player Drift Correction

## Inputs / outputs

| Input | Type | Description |
|---|---|---|
| `currentDrift` | `number` | The time difference in milliseconds between the local client and the leader server. |

| Output | Type | Description |
|---|---|---|
| `CorrectionAction` | `Object` | Action object containing `type`: 'ignore' | 'adjust_rate' | 'seek' |

## Steps

1. Receive `serverTime` and `localTime`. Calculate `currentDrift = Math.abs(serverTime - localTime)`.
2. **If `currentDrift` < 250ms**: Return `type: 'ignore'`. Drift is imperceptible, maintain smooth playback.
3. **If 250ms <= `currentDrift` <= 800ms**: Return `type: 'adjust_rate'`. Client should adjust playback speed (0.95x or 1.05x) to seamlessly catch up or slow down.
4. **If `currentDrift` > 800ms**: Return `type: 'seek'`. The gap is too large; force a hard seek to `serverTime`.

## Complexity

- Time: O(1)
- Space: O(1)

## Edge cases

- `currentDrift` is negative (handled by Math.abs).
- Network jitter causes sudden spikes (debounce logic may be required upstream).
