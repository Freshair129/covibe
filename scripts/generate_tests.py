import os
import re
import sys
import json
import time
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "sushirl"

# Files to generate tests for (now focusing only on analytics.ts which failed due to encoding/repetition)
TARGET_FILES = [
    "src/utils/analytics.ts"
]

def generate_tests_for_file(file_path):
    print(f"\n==================================================")
    print(f"Processing: {file_path}")
    print(f"==================================================")
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        return False
        
    with open(file_path, "r", encoding="utf-8") as f:
        source_code = f.read()
        
    basename = os.path.basename(file_path)
    module_name = os.path.splitext(basename)[0]
    test_file_path = f"src/__tests__/{module_name}.test.ts"
    
    # Constructing prompt with strict constraints to prevent repetitive loops
    prompt = f"""You are a Senior TypeScript Developer. Generate a complete, compilation-ready and robust unit test file using Vitest for the following source code:

File Path: {file_path}
Source Code:
```typescript
{source_code}
```

Rules for generation:
1. The test file will be saved at '{test_file_path}'. Any imports from the source file must use the relative path `../utils/{module_name}`.
2. Write comprehensive but CONCISE tests. Cover normal behavior, error cases, edge cases, boundaries, etc.
3. CRITICAL: Do NOT generate repetitive test cases (e.g., do not write dozens of tests that throw different minor error types or test every single event name). 5 to 8 tests are plenty. Keep the entire test file under 150 lines of code.
4. If the module uses browser APIs (like `window`, `document`, `navigator`, `localStorage`, or `crypto`), ensure the test file has `/** @vitest-environment jsdom */` as the very first line of the file, and mock/stub them properly (e.g. using `vi.stubGlobal` or spy/mock functions).
5. Output ONLY the test code inside a markdown code block starting with ```typescript and ending with ```.
6. Do not include any explanations, introduction, or markdown comments outside the code block.
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "options": {
            "temperature": 0.1,
            "num_ctx": 8192,
            "repeat_penalty": 1.2
        },
        "stream": True
    }
    
    print(f"Querying local model '{MODEL_NAME}' via Ollama with streaming...")
    start_time = time.time()
    
    try:
        response_text = ""
        prompt_eval_count = 0
        eval_count = 0
        
        with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=300) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line)
                    content = chunk.get("response", "")
                    response_text += content
                    
                    # Print to console with fallback encoding to avoid cp1252 error
                    try:
                        print(content, end="", flush=True)
                    except UnicodeEncodeError:
                        cleaned_content = content.encode('ascii', errors='replace').decode('ascii')
                        print(cleaned_content, end="", flush=True)
                        
                    if chunk.get("done"):
                        prompt_eval_count = chunk.get("prompt_eval_count", 0)
                        eval_count = chunk.get("eval_count", 0)
                        break
                        
        duration = time.time() - start_time
        print(f"\n\nGeneration finished in {duration:.2f}s")
        print(f"Tokens: In={prompt_eval_count}, Out={eval_count}")
        
        # 1. Strip the <think>...</think> block to avoid matching source code inside thinking
        cleaned_text = re.sub(r"<think>.*?</think>", "", response_text, flags=re.DOTALL)
        
        # 2. Extract typescript block from cleaned text. Find all matches and get the last one.
        matches = re.findall(r"```typescript\s*(.*?)\s*```", cleaned_text, re.DOTALL)
        if matches:
            test_code = matches[-1].strip()
        else:
            # Fallback if no markdown fences found after cleaning
            # Check if there is still a fence without typescript tag
            matches_generic = re.findall(r"```\s*(.*?)\s*```", cleaned_text, re.DOTALL)
            if matches_generic:
                test_code = matches_generic[-1].strip()
            else:
                test_code = cleaned_text.strip()
                
        # Ensure directories exist
        os.makedirs(os.path.dirname(test_file_path), exist_ok=True)
        
        with open(test_file_path, "w", encoding="utf-8") as tf:
            tf.write(test_code + "\n")
            
        print(f"Written output to: {test_file_path}")
        return True
        
    except Exception as e:
        print(f"\nError during generation: {e}")
        return False

def main():
    print("Starting automated unit test generation using local Sushi RL (targeted, anti-loop)...")
    success_count = 0
    for target in TARGET_FILES:
        if generate_tests_for_file(target):
            success_count += 1
            # Breathe for 3 seconds between runs
            time.sleep(3)
            
    print(f"\nTest generation finished! Success rate: {success_count}/{len(TARGET_FILES)}")

if __name__ == "__main__":
    main()
