---
id: PROTOCOL--HW-TUNING
tier: safety
created_at: 2026-05-29T03:11:52.721+07:00
phase: 4
type: protocol
status: active
vault_id: covibe
title: Hardware Tuning Pre-flight SOP
tags: [sop, hardware, gpu]
domain: infrastructure
crosslinks:
  used_by: [FLOW--BENCHMARK]
  references: [GUARD--THERMAL-LIMITS]
linked_symbols: []
---

# PROTOCOL — Hardware Tuning Pre-flight SOP

## Objective
Ensure the host RTX 3060 is thermally safe and operating consistently before running benchmarks.

## Sequence

### Method A: MSI Afterburner (Preferred)
1. Open `MSIAfterburner.exe`.
2. Select **Profile 2**.
3. Verify settings:
   - Core Clock: `-104 MHz`
   - Power Limit: `90%`
4. Click **Apply**.
5. Ensure `HardwareMonitoring.hml` logging is active.

### Method B: NVIDIA-SMI (Fallback CLI)
1. Open PowerShell as Administrator.
2. Set Power Limit: `nvidia-smi -pl 153`
3. Lock Core Clocks: `nvidia-smi --lock-gpu-clocks=1500,1500`

## Verification
- Run `nvidia-smi` and verify the power cap is `153W`.
