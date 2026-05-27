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

# --- CONFIGURATION ---
# Testing ONLY the fixed Qwopus model
LOCAL_ROSTER = [
    {"name": "qwopus-fix:latest", "size": "9B"}
]

# CSB-01 Task List (Reduced for troubleshooting to L1-L3 first)
TASK_LIST = [
    {"level": "L1", "name": "DeepMerge", "path": "L1_BASE/utility_deep_merge.txt", "ctx": "8K"},
    {"level": "L2", "name": "PriorityQueue", "path": "L2_LOGIC/algorithm_priority_queue.txt", "ctx": "8K"},
    {"level": "L3", "name": "YTSync", "path": "L3_DOMAIN/covibe_yt_sync_logic.txt", "ctx": "8K"}
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
            "temperature": 1.0, # Recommended for Qwopus
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
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    text = chunk.get("response", "")
                    full_response += text
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
    print(f"🚀 --- STARTING RECOVERY BENCHMARK FOR QWOPUS-FIX --- 🚀")
    
    for model_info in LOCAL_ROSTER:
        model_name = model_info["name"]
        safe_name = "qwopus-fix"
        print(f"\n\n🤖 TARGET: {model_name}")
        
        await warmup_model(model_name)
        
        model_res_dir = f"{RESULT_DIR}/{safe_name}"
        os.makedirs(model_res_dir, exist_ok=True)

        for task in TASK_LIST:
            print(f"\n📝 Task: {task['level']} - {task['name']} ", end="", flush=True)
            
            task_content = load_file(f"{BASE_TASK_DIR}/{task['path']}")
            payload_content = load_file(f"{PAYLOAD_DIR}/payload_{task['ctx'].lower()}.txt")
            
            full_prompt = f"Context Data:\n{payload_content}\n\nTask Instruction:\n{task_content}"
            ctx_val = int(task["ctx"].replace("K", "")) * 1024
            
            result = await run_inference(model_name, full_prompt, ctx_val, task["level"])
            
            if result["status"] == "success":
                print(f" ✅ {result['tps']} t/s ({result['time']}s)")
                task_res_dir = f"{model_res_dir}/{task['level']}"
                os.makedirs(task_res_dir, exist_ok=True)
                with open(f"{task_res_dir}/response.txt", "w", encoding="utf-8") as f:
                    f.write(result["response"])
                
                metrics = {
                    "model": model_name,
                    "task": task["level"],
                    "tps": result["tps"],
                    "duration": result["time"],
                    "timestamp": datetime.now().isoformat(),
                    "status": "recovered"
                }
                with open(f"{task_res_dir}/metrics.json", "w", encoding="utf-8") as f:
                    json.dump(metrics, f, indent=2)
            else:
                print(f" ❌ FAILED: {result['error']}")

    print(f"\n\n🏁 --- QWOPUS RECOVERY FINISHED --- 🏁")

if __name__ == "__main__":
    asyncio.run(main())
