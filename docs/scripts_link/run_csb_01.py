import asyncio
import json
import time
import requests
import os
import sys
from datetime import datetime

# Force UTF-8 for Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# --- CONFIGURATION (EABS-01 v2.0 Compliant) ---
# Ordered by size: 1B -> 4B -> 4B -> 9B -> 9B -> 9B -> 14B
LOCAL_ROSTER = [
    {"name": "llama3.2:1b", "size": "1B"},
    {"name": "hf.co/iapp/chinda-qwen3-4b-gguf:Q4_K_M", "size": "4B"},
    {"name": "qwen3.5:4b", "size": "4B"},
    {"name": "gemma4-rust-coder:latest", "size": "9B"},
    {"name": "sushirl:latest", "size": "9B"},
    {"name": "hf.co/Jackrong/Qwopus3.5-9B-Coder-GGUF:Q4_K_M", "size": "9B"},
    {"name": "qwen3:latest", "size": "14B"}
]

# CSB-01 Task List
TASK_LIST = [
    {"level": "L1", "name": "DeepMerge", "path": "L1_BASE/utility_deep_merge.txt", "ctx": "8K"},
    {"level": "L2", "name": "PriorityQueue", "path": "L2_LOGIC/algorithm_priority_queue.txt", "ctx": "8K"},
    {"level": "L3", "name": "YTSync", "path": "L3_DOMAIN/covibe_yt_sync_logic.txt", "ctx": "8K"},
    {"level": "L4", "name": "RefactorReact", "path": "L4_STRESS/refactor_large_component.txt", "ctx": "32K"},
    {"level": "L5", "name": "AsyncRace", "path": "L5_INCIDENTS/debug_async_race_condition.txt", "ctx": "16K"}
]

OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_TASK_DIR = "G:/covibe/benchmark/tasks"
PAYLOAD_DIR = "G:/covibe/payloads"
RESULT_DIR = "G:/covibe/benchmark/results/CSB-01"

os.makedirs(RESULT_DIR, exist_ok=True)

def load_file(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

async def warmup_model(model):
    print(f"🕯️ Warming up {model}...", end="", flush=True)
    payload = {"model": model, "prompt": "hi", "stream": False}
    try:
        requests.post(OLLAMA_URL, json=payload, timeout=300)
        print(" Ready.")
    except Exception as e:
        print(f" Failed to warm up: {e}")

async def run_inference(model, prompt, num_ctx, task_level):
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
        # Increase timeout to 10 minutes for large models/contexts
        with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=600) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    text = chunk.get("response", "")
                    full_response += text
                    # Minimal feedback to keep log clean but active
                    if len(full_response) % 500 == 0: print("·", end="", flush=True)
                    
                    if chunk.get("done"):
                        eval_count = chunk.get("eval_count", 0)
                        eval_duration = chunk.get("eval_duration", 1)
                        break
        
        tps = round(eval_count / (eval_duration / 1e9), 2)
        return {"status": "success", "tps": tps, "time": round(time.time() - start_time, 2), "response": full_response}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

async def main():
    print(f"🚀 --- STARTING FIXED CSB-01 CODING BASELINE CAMPAIGN --- 🚀")
    
    for model_info in LOCAL_ROSTER:
        model_name = model_info["name"]
        safe_name = model_name.replace("/", "_").replace(":", "_")
        print(f"\n\n🤖 TARGET: {model_name} ({model_info['size']})")
        
        # Mandatory Warmup
        await warmup_model(model_name)
        
        model_res_dir = f"{RESULT_DIR}/{safe_name}"
        os.makedirs(model_res_dir, exist_ok=True)

        for task in TASK_LIST:
            # EABS-01 Safety Check
            if model_info["size"] == "14B" and task["ctx"] != "8K":
                print(f"⚠️ Safety Skip: {task['level']} ({task['ctx']}) context exceeds 8K limit for 14B model.")
                continue

            print(f"\n📝 Task: {task['level']} - {task['name']} (Ctx: {task['ctx']}) ", end="", flush=True)
            
            task_content = load_file(f"{BASE_TASK_DIR}/{task['path']}")
            payload_content = load_file(f"{PAYLOAD_DIR}/payload_{task['ctx'].lower()}.txt")
            
            full_prompt = f"Context Data:\n{payload_content}\n\nTask Instruction:\n{task_content}"
            ctx_val = int(task["ctx"].replace("K", "")) * 1024
            
            result = await run_inference(model_name, full_prompt, ctx_val, task["level"])
            
            if result["status"] == "success":
                print(f" ✅ {result['tps']} t/s ({result['time']}s)")
                # Save results
                task_res_dir = f"{model_res_dir}/{task['level']}"
                os.makedirs(task_res_dir, exist_ok=True)
                with open(f"{task_res_dir}/response.txt", "w", encoding="utf-8") as f:
                    f.write(result["response"])
                
                metrics = {
                    "model": model_name,
                    "task": task["level"],
                    "tps": result["tps"],
                    "duration": result["time"],
                    "timestamp": datetime.now().isoformat()
                }
                with open(f"{task_res_dir}/metrics.json", "w", encoding="utf-8") as f:
                    json.dump(metrics, f, indent=2)
            else:
                print(f" ❌ FAILED: {result['error']}")

            # Thermal Rest (EABS-01) - 10 seconds between tasks to cool down
            time.sleep(10)

        # Longer rest between model swaps (60 seconds)
        print(f"❄️ Cooldown between models (60s)...")
        time.sleep(60)

    print(f"\n\n🏁 --- CSB-01 CAMPAIGN FINISHED --- 🏁")

if __name__ == "__main__":
    asyncio.run(main())
