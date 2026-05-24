import sys
import json
import requests
import time

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5-coder:14b-instruct-q4_K_M"

def run_bench(prompt, num_ctx=8192):
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "options": {"temperature": 0.1, "num_ctx": num_ctx},
        "stream": True
    }
    
    print(f"--- Running Benchmark (Context: {num_ctx}) ---")
    print(f"Model: {MODEL}\n")
    
    try:
        response_text = ""
        stats = {}
        
        with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=120) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line)
                    content = chunk.get("response", "")
                    print(content, end="", flush=True)
                    response_text += content
                    if chunk.get("done"):
                        stats = chunk
                        break
        
        print("\n\n" + "="*40)
        print("📊 PERFORMANCE METRICS")
        print("="*40)
        
        # Nanoseconds to Seconds
        total_sec = stats.get("total_duration", 0) / 1e9
        load_sec = stats.get("load_duration", 0) / 1e9
        prompt_eval_sec = stats.get("prompt_eval_duration", 0) / 1e9
        eval_sec = stats.get("eval_duration", 0) / 1e9
        
        prompt_tokens = stats.get("prompt_eval_count", 0)
        output_tokens = stats.get("eval_count", 0)
        
        tps = output_tokens / eval_sec if eval_sec > 0 else 0
        input_tps = prompt_tokens / prompt_eval_sec if prompt_eval_sec > 0 else 0
        
        print(f"Input (Tokens):      {prompt_tokens} tokens")
        print(f"Output (Tokens):     {output_tokens} tokens")
        print(f"Processing Speed:    {input_tps:.2f} tokens/sec (Pre-fill)")
        print(f"Generation Speed:    {tps:.2f} tokens/sec (Decoding)")
        print(f"Total Time:          {total_sec:.2f}s")
        print(f"Model Load Time:     {load_sec:.2f}s")
        print("="*40)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_prompt = "Write a comprehensive summary of React 19's new features with code examples for each."
    if len(sys.argv) > 1:
        test_prompt = sys.argv[1]
    
    ctx_to_test = 8192
    if len(sys.argv) > 2:
        ctx_to_test = int(sys.argv[2])
        
    run_bench(test_prompt, ctx_to_test)
