import asyncio
import json
import time
import requests
import os
import re
import sys
from datetime import datetime

# Force UTF-8 for Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# --- CONFIGURATION (EABS-01 v2.0 Compliant) ---
LOCAL_ROSTER = [
    {"name": "llama3.2:1b", "size": "1B", "limits": ["4K", "8K", "16K", "32K", "64K"]},
    {"name": "gemma4-rust-coder:latest", "size": "3B", "limits": ["4K", "8K", "16K", "32K", "64K"]},
    {"name": "qwen3.5:4b", "size": "4B", "limits": ["4K", "8K", "16K", "32K", "64K"]},
    {"name": "hf.co/iapp/chinda-qwen3-4b-gguf:Q4_K_M", "size": "4B", "limits": ["4K", "8K", "16K", "32K", "64K"]},
    {"name": "sushirl:latest", "size": "9B", "limits": ["4K", "8K", "16K", "32K"]},
    {"name": "hf.co/Jackrong/Qwopus3.5-9B-Coder-GGUF:Q4_K_M", "size": "9B", "limits": ["4K", "8K", "16K", "32K"]},
    {"name": "qwen3:latest", "size": "14B", "limits": ["4K", "8K"]}
]

TASK_LIST = [
    {"level": "L1", "path": "L1_BASE/async_retry_ts.txt"},
    {"level": "L2", "path": "L2_LOGIC/circuit_breaker_ts.txt"},
    {"level": "L3", "path": "L3_DOMAIN/vitest_unit_test_gen.txt"},
    {"level": "L4", "path": "L4_STRESS/reasoning_stress_test.txt"},
    {"level": "L5_A", "path": "L5_INCIDENTS/regex_think_collision.txt"},
    {"level": "L5_B", "path": "L5_INCIDENTS/csp_eval_block.txt"},
    {"level": "L5_C", "path": "L5_INCIDENTS/windows_encoding_emoji.txt"}
]

OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_TASK_DIR = "G:/covibe/benchmark/tasks"
PAYLOAD_DIR = "G:/covibe/payloads"

# --- CORE LOGIC ---

def load_file(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

async def run_inference(model, prompt, num_ctx):
    payload = {
        "model": model,
        "prompt": prompt,
        "options": {
            "num_ctx": num_ctx,
            "num_predict": 2500,
            "temperature": 0.1,
            "stop": ["<|im_end|>", "### END", "```\n\n"]
        },
        "stream": True
    }
    
    start_time = time.time()
    full_response = ""
    eval_count = 0
    eval_duration = 1
    
    try:
        with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=600) as resp:
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    full_response += chunk.get("response", "")
                    if len(full_response) % 200 == 0: print("❤", end="", flush=True)
                    if chunk.get("done"):
                        eval_count = chunk.get("eval_count", 0)
                        eval_duration = chunk.get("eval_duration", 1)
                        break
        
        tps = round(eval_count / (eval_duration / 1e9), 2)
        return {"status": "success", "tps": tps, "time": round(time.time() - start_time, 2), "response": full_response}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

async def main():
    print(f"🔥 --- ULTIMATE LOCAL MODEL SWEEP STARTING --- 🔥")
    overall_results = {}

    for model_info in LOCAL_ROSTER:
        model_name = model_info["name"]
        print(f"\n🏆 COMPETITOR: {model_name} ({model_info['size']})")
        model_results = {}

        for ctx in model_info["limits"]:
            print(f"  📏 Context {ctx}...", end="", flush=True)
            payload = load_file(f"{PAYLOAD_DIR}/payload_{ctx.lower()}.txt")
            ctx_val = int(ctx.replace("K", "")) * 1024
            
            ctx_task_results = []
            for task in TASK_LIST:
                task_content = load_file(f"{BASE_TASK_DIR}/{task['path']}")
                full_prompt = f"{payload}\n\nTask: {task_content}\nSTRICT RULES: Implement logic in TypeScript. End with '### END'."
                
                res = await run_inference(model_name, full_prompt, ctx_val)
                res["level"] = task["level"]
                res["task_path"] = task["path"]
                res["model"] = model_name
                ctx_task_results.append(res)
                time.sleep(5) # Heat soak protection
            
            model_results[ctx] = ctx_task_results
            print(" [PHASE DONE]")
            time.sleep(10) # Heavy context swap protection

        overall_results[model_name] = model_results
        # Final save after each model in case of crash
        with open(f"G:/covibe/benchmark/results/sweep_{model_name.replace('/', '-').replace(':', '-')}.json", "w", encoding="utf-8") as f:
            json.dump(model_results, f, indent=4, ensure_ascii=False)

    print(f"\n🏆 --- GRAND SWEEP COMPLETED --- 🏆")

if __name__ == "__main__":
    asyncio.run(main())
