---
id: RISK--EMOJI-CRASH
tier: safety
created_at: 2026-05-29T03:11:52.721+07:00
phase: 4
type: risk
status: mitigated
vault_id: covibe
title: Windows CP1252 Encoding Crash
tags: [risk, windows, encoding]
domain: script
crosslinks:
  used_by: []
  references: [FRAMEWORK--EABS-01]
linked_symbols: []
---

# RISK — Windows CP1252 Encoding Crash

## Hazard
When an LLM generates high-plane Unicode characters (e.g., Emojis 🚀, ✅, ❌), Python running on standard Windows command prompts (using `CP1252` encoding) will throw a `UnicodeEncodeError` and crash the entire benchmark campaign.

## Severity
**HIGH** - Causes complete data loss for a long-running batch job.

## Mitigation
All Python orchestration scripts must override standard output streams to force UTF-8 detachment at the top of the file:

```python
import sys, codecs
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())
```
