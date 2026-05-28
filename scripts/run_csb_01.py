import asyncio
import json
import time
import requests
import os
import sys
import uuid
from datetime import datetime

# Force UTF-8 for Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# --- CONFIGURATION (EABS-01 v2.0 Compliant) ---
MODEL_METADATA = {
    "llama3.2:1b": {"size": "1B", "url": "https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct", "family": "Llama", "quant": "Q4_K_M"},
    "hf.co/iapp/chinda-qwen3-4b-gguf:Q4_K_M": {"size": "4B", "url": "https://huggingface.co/iapp/chinda-qwen3-4b-gguf", "family": "Qwen", "quant": "Q4_K_M"},
    "qwen3.5:4b": {"size": "4B", "url": "https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct", "family": "Qwen", "quant": "Default"}, 
    "gemma4-rust-coder:latest": {"size": "9B", "url": "https://huggingface.co/MassivDash/Gemma-4-Rust-Coder", "family": "Gemma", "quant": "Q4_K_M"},
    "sushirl:latest": {"size": "9B", "url": "https://huggingface.co/sushirl/sushi-rl-v1", "family": "Qwen-RL", "quant": "Default"},
    "qwen3:latest": {"size": "14B", "url": "https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct", "family": "Qwen", "quant": "Default"}
}

LOCAL_ROSTER = [
    {"name": "llama3.2:1b", "size": "1B"},
    {"name": "hf.co/iapp/chinda-qwen3-4b-gguf:Q4_K_M", "size": "4B"},
    {"name": "qwen3.5:4b", "size": "4B"},
    {"name": "gemma4-rust-coder:latest", "size": "9B"},
    {"name": "sushirl:latest", "size": "9B"},
    {"name": "qwen3:latest", "size": "14B"}
]

TASK_LIST = [
    {"level": "L1", "name": "DeepMerge", "path": "L1_BASE/utility_deep_merge.txt", "ctx": "8K"},
    {"level": "L2", "name": "PriorityQueue", "path": "L2_LOGIC/algorithm_priority_queue.txt", "ctx": "8K"},
    {"level": "L3", "name": "YTSync", "path": "L3_DOMAIN/covibe_yt_sync_logic.txt", "ctx": "8K"},
    {"level": "L4", "name": "RefactorReact", "path": "L4_STRESS/refactor_large_component.txt", "ctx": "32K"},
    {"level": "L5", "name": "AsyncRace", "path": "L5_INCIDENTS/debug_async_race_condition.txt", "ctx": "16K"}
]

OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_TASK_DIR = "G:/covibe/benchmark/benchmark-kits/tasks"
PAYLOAD_DIR = "G:/covibe/benchmark/benchmark-kits/ammunition/STRESS_TEST"
RESULT_ROOT = "G:/covibe/benchmark/benchmark-run"
TEMPLATE_DIR = "G:/covibe/benchmark/templates"

def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_file(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

async def unload_all_models():
    print(f"🧹 Clearing VRAM (Unloading all models)...", end="", flush=True)
    # Sending a generic request with keep_alive 0 to clear current model
    try:
        # We don't know exactly which model is loaded, so we try a common one or just wait for timeout
        # Ollama clears the current model if a new one is requested with keep_alive 0
        # A more effective way is to just request a non-existent small model or use the last run model
        pass 
    except: pass

def log_event(task_dir, event_name, extra_data=None):
    if not task_dir: return
    os.makedirs(task_dir, exist_ok=True)
    event = {
        "ts": datetime.now().isoformat() + "Z",
        "event": event_name
    }
    if extra_data:
        event.update(extra_data)
    
    with open(os.path.join(task_dir, "events.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

async def unload_model(model, task_dir=None):
    print(f"❄️ Unloading {model}...", end="", flush=True)
    log_event(task_dir, "model_unload_start", {"model": model})
    try:
        requests.post(OLLAMA_URL, json={"model": model, "prompt": "", "keep_alive": 0}, timeout=10)
        print(" Done.")
        log_event(task_dir, "model_unload_end", {"model": model, "status": "success"})
    except:
        print(" Timed out.")
        log_event(task_dir, "model_unload_end", {"model": model, "status": "timeout"})
    time.sleep(5)

async def warmup_model(model, task_dir=None):
    print(f"🕯️ Warmup {model}...", end="", flush=True)
    log_event(task_dir, "model_warmup_start", {"model": model})
    payload = {"model": model, "prompt": "hi", "stream": False}
    try:
        requests.post(OLLAMA_URL, json=payload, timeout=300)
        print(" OK")
        log_event(task_dir, "model_warmup_end", {"model": model, "status": "success"})
    except Exception as e:
        print(f" ERR: {e}")
        log_event(task_dir, "model_warmup_end", {"model": model, "status": "failed", "error": str(e)})

async def run_inference(model, prompt, num_ctx, task, task_dir=None):
    log_event(task_dir, "inference_start", {"model": model, "level": task["level"]})
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
    
    start_at = datetime.now().isoformat()
    start_time = time.time()
    full_response = ""
    prompt_eval_count = 0
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
                        prompt_eval_count = chunk.get("prompt_eval_count", 0)
                        eval_count = chunk.get("eval_count", 0)
                        eval_duration = chunk.get("eval_duration", 1)
                        break
        
        end_at = datetime.now().isoformat()
        tps = round(eval_count / (eval_duration / 1e9), 2)
        log_event(task_dir, "inference_end", {"model": model, "status": "success", "tps": tps})
        return {
            "status": "success", 
            "tps": tps, 
            "duration": round(time.time() - start_time, 2), 
            "start_at": start_at,
            "end_at": end_at,
            "response": full_response,
            "tokens": {
                "input": prompt_eval_count,
                "output": eval_count,
                "total": prompt_eval_count + eval_count
            }
        }
    except Exception as e:
        log_event(task_dir, "inference_end", {"model": model, "status": "failed", "error": str(e)})
        return {"status": "failed", "error": str(e)}

async def main():
    print(f"🚀 --- STARTING CLEAN-VRAM CSB-01 CAMPAIGN --- 🚀")
    
    metrics_tpl = load_json(f"{TEMPLATE_DIR}/metrics.json")
    metadata_tpl = load_json(f"{TEMPLATE_DIR}/metadata.json")
    
    session_id = datetime.now().strftime("%Y%m%d_%H%M")
    
    for model_info in LOCAL_ROSTER:
        model_name = model_info["name"]
        m_meta = MODEL_METADATA.get(model_name, {"url": "N/A", "family": "Unknown", "quant": "Unknown"})
        safe_model_name = model_name.replace("/", "_").replace(":", "_")
        
        # 1. ENSURE CLEAN START
        await unload_model(model_name) 
        
        # 2. WARMUP
        await warmup_model(model_name)
        
        for task in TASK_LIST:
            if model_info["size"] == "14B" and task["ctx"] != "8K":
                continue

            print(f"\n📝 {model_name} | {task['level']} ({task['ctx']}) ", end="", flush=True)
            
            task_content = load_file(f"{BASE_TASK_DIR}/{task['path']}")
            payload_content = load_file(f"{PAYLOAD_DIR}/payload_{task['ctx'].lower()}.txt")
            
            ctx_val = int(task["ctx"].replace("K", "")) * 1024
            
            full_prompt = f"""### SYSTEM INSTRUCTION
You are an expert Senior Developer. Your task is to provide a clean, functional TypeScript implementation based on the instruction below.
CRITICAL: Output ONLY the solution code inside a single markdown block. DO NOT repeat the context data or provide long explanations.

### TASK
{task_content}

### CONTEXT DATA (For reference only)
{payload_content}

### SOLUTION
"""
            result = await run_inference(model_name, full_prompt, ctx_val, task)
            
            if result["status"] == "success":
                print(f" ✅ {result['tps']} TPS")
                
                # Directory Setup
                task_dir = f"{RESULT_ROOT}/{safe_model_name}/{task['level']}"
                os.makedirs(f"{task_dir}/artifacts", exist_ok=True)
                os.makedirs(f"{task_dir}/traces", exist_ok=True)
                
                # Populate Metadata
                meta = metadata_tpl.copy()
                meta.update({
                    "benchmark_id": f"bench_{session_id}_{task['level']}",
                    "run_id": f"run_{uuid.uuid4().hex[:8]}",
                    "created_at": result["start_at"],
                    "model": {
                        **meta["model"],
                        "name": model_name,
                        "family": m_meta["family"],
                        "model_url": m_meta["url"],
                        "quantization": m_meta["quant"],
                        "parameter_size": model_info["size"],
                        "context_length": ctx_val
                    },
                    "dataset": {
                        **meta["dataset"],
                        "sample_id": task["level"]
                    }
                })
                
                # Populate Metrics
                met = metrics_tpl.copy()
                met.update({
                    "benchmark_id": meta["benchmark_id"],
                    "task_id": task["level"],
                    "context_length": ctx_val,
                    "started_at": result["start_at"],
                    "ended_at": result["end_at"],
                    "duration_seconds": result["duration"],
                    "tokens": result["tokens"],
                    "throughput": {**met["throughput"], "avg_tps": result["tps"]}
                })
                
                with open(f"{task_dir}/metadata.json", "w", encoding="utf-8") as f: json.dump(meta, f, indent=2)
                with open(f"{task_dir}/metrics.json", "w", encoding="utf-8") as f: json.dump(met, f, indent=2)
                with open(f"{task_dir}/artifacts/response.txt", "w", encoding="utf-8") as f: f.write(result["response"])
                with open(f"{task_dir}/artifacts/prompt.txt", "w", encoding="utf-8") as f: f.write(payload_content + "\n\n" + task_content)
                
                open(f"{task_dir}/samples.jsonl", 'a').close()
                open(f"{task_dir}/events.jsonl", 'a').close()
                
            else:
                print(f" ❌ {result['error']}")

            time.sleep(10) # Cooldown between tasks

        # 3. UNLOAD AFTER MODEL FINISHED
        await unload_model(model_name)
        print(f"❄️ Model {model_name} cycle finished. Cooling down (30s)...")
        time.sleep(30)

if __name__ == "__main__":
    asyncio.run(main())
