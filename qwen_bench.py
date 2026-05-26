import sys
import json
import requests
import time

OLLAMA_URL = "http://localhost:11434/api/generate"

def run_bench(model, prompt, num_ctx=8192):
    payload = {
        "model": model,
        "prompt": prompt,
        "options": {"temperature": 0.1, "num_ctx": num_ctx},
        "stream": True
    }
    
    print(f"--- Running Benchmark ---")
    print(f"Model: {model}")
    print(f"Context: {num_ctx}\n")
    
    try:
        stats = {}
        with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=120) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line)
                    content = chunk.get("response", "")
                    print(content, end="", flush=True)
                    if chunk.get("done"):
                        stats = chunk
                        break
        
        print("\n\n" + "="*40)
        print("📊 PERFORMANCE METRICS")
        print("="*40)
        
        total_sec = stats.get("total_duration", 0) / 1e9
        eval_sec = stats.get("eval_duration", 1) / 1e9
        eval_count = stats.get("eval_count", 0)
        tps = eval_count / eval_sec if eval_sec > 0 else 0
        
        print(f"Input Tokens:    {stats.get('prompt_eval_count', 0)} t")
        print(f"Output Tokens:   {eval_count} t")
        print(f"Output Speed:    {tps:.2f} tokens/sec")
        print(f"Total Time:      {total_sec:.2f}s")
        print("="*40)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python qwen_bench.py <model_name> <prompt> [num_ctx]")
        sys.exit(1)
    
    model_name = sys.argv[1]
    prompt_text = sys.argv[2]
    ctx_window = int(sys.argv[3]) if len(sys.argv) > 3 else 8192
    
    run_bench(model_name, prompt_text, ctx_window)
