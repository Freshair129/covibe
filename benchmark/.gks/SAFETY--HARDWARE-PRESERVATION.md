---
id: SAFETY--HARDWARE-PRESERVATION
tier: genesis
created_at: 2026-05-29T03:11:52.721+07:00
phase: 4
type: safety
status: active
vault_id: covibe
title: Core Hardware Preservation Guidelines
tags: [safety, hardware, rules]
domain: benchmark
crosslinks:
  used_by: [FRAMEWORK--EABS-01]
  references: [GUARD--THERMAL-LIMITS]
linked_symbols: []
---

# SAFETY — Core Hardware Preservation

## Core Rules

1. **NEVER benchmark without telemetry:** Do not run `execute_campaign.py` or `run_csb_01.py` unless MSI Afterburner or HWiNFO is actively logging.
2. **Respect the Cooldown:** A 30-60 second mandatory pause must exist between loading different models. This is non-negotiable and prevents thermal buildup.
3. **No 14B Models at 32K:** The RTX 3060 12GB physically cannot handle a 14B model at 32K context without aggressive CPU offloading, which breaks TPS comparisons. Limit 14B to 8K.
