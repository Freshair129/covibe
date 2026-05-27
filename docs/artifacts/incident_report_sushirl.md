# Incident Report: Sushi RL Test Generation Regex Extraction Failure

**Date:** 2026-05-26  
**Incident Category:** Code Generation Pipeline Failure  
**Severity:** Medium (Blocked test execution / Corrupted generated files)

---

## 1. Incident Overview
During the execution of `scripts/generate_tests.py`, the pipeline generated `src/__tests__/time.test.ts` containing the original source code of `time.ts` instead of the expected Vitest unit tests. Additionally, the process appeared to hang on the subsequent file `participant.ts` with near-zero CPU usage (0.23 seconds over 7 minutes), prompting a manual termination.

---

## 2. Root Cause Analysis (RCA)

### 2.1 Think-Block Output Structure
The local **Sushi RL (9B)** model is a Reinforcement Learning reasoning model. By design, it first outputs its thought process wrapped in `<think>...</think>` tags before rendering the final solution. 
In its thinking phase, the model analyzed the source code and repeated it inside a markdown block:
```markdown
<think>
...
**Source Code Analysis:**
```typescript
export function formatTime(ms: number) { ... }
```
...
</think>
```

### 2.2 First-Match Regex Weakness
The initial Python script extracted the test code using:
```python
match = re.search(r"```typescript\s*(.*?)\s*```", response_text, re.DOTALL)
```
`re.search` matches the **first** occurrence of the pattern in the string. Consequently, it extracted the repeated source code inside the `<think>` block, bypassing the actual unit test block generated at the very end of the response.

### 2.3 Non-Streaming I/O Blocking
The python script used `"stream": False` on the Ollama API request. For a 9B parameter model generating long reasoning chains and multiple code blocks, the response can exceed 4,000 tokens.
- At ~40 TPS, this requires up to 100+ seconds of continuous generation.
- Because it was non-streaming, the Python process block-waited on the HTTP response, displaying no progress output and registering 0% CPU usage, making it appear dead or hung.

---

## 3. Resolution Actions Taken

1. **Stream API Response:** Modified `generate_tests.py` to use `"stream": True` and flush chunks to stdout in real-time. This provides immediate logging feedback and prevents blocking.
2. **Think-Block Stripping:** Added a preprocessing regex step to strip the `<think>` block entirely from the response text:
   ```python
   cleaned_text = re.sub(r"<think>.*?</think>", "", response_text, flags=re.DOTALL)
   ```
3. **Last-Match Extraction:** Changed regex matching to extract the **last** typescript code block (using `re.findall` and selecting the index `-1`), guaranteeing that the final output is the generated test code and not any code referenced in the analysis.
