import os
import json
import time
import datetime
import requests
import re
import sys
import codecs
import subprocess
import shutil

# Configuration based on EABS-01 & SOP
OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_RUN_DIR = "benchmark-run"

def strip_reasoning(text):
    """SOP 3.3: Remove <think> tags from RL models."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

def force_restart_ollama():
    """Forcibly restarts Ollama to clear VRAM fragmentation."""
    print("\n🔄 [SYSTEM] Forcing Ollama restart to clear VRAM fragmentation...")
    try:
        subprocess.run(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", "scripts/restart_ollama.ps1"], check=True)
        return True
    except Exception as e:
        print(f"❌ [SYSTEM] Failed to restart Ollama: {e}")
    return False

def unload_models():
    """Explicitly unload all models from VRAM by setting keep_alive to 0."""
    print("🧹 Unloading all models from VRAM...")
    try:
        # Get list of running models
        tags_res = requests.get("http://localhost:11434/api/tags")
        if tags_res.status_code == 200:
            models = [m['name'] for m in tags_res.json().get('models', [])]
            for model in models:
                # Sending a request with keep_alive: 0 unloads the model
                requests.post("http://localhost:11434/api/generate", 
                             json={"model": model, "keep_alive": 0})
        print("✅ VRAM Cleared.")
    except Exception as e:
        print(f"⚠️ Unload failed: {e}")

def run_benchmark(model_name, task_path, payload_path, run_id=None, plan_path=None):
    task_id = os.path.basename(task_path).replace(".txt", "")
    
    if not run_id:
        timestamp = datetime.datetime.now().strftime("%y%m%d")
        model_short = model_name.split(":")[0][:5]
        run_id = f"RUN-{timestamp}-{model_short}-{os.urandom(2).hex()}"

    # EABS-01 Path: benchmark-run/<model-name>/<runid>/
    model_dir_name = model_name.replace(":", "-").replace("/", "-")
    run_dir = os.path.join(BASE_RUN_DIR, model_dir_name, run_id)
    
    # EABS-01 Skeleton (Section 1)
    artifacts_dir = os.path.join(run_dir, "artifacts")
    documents_dir = os.path.join(run_dir, "documents")
    traces_dir = os.path.join(run_dir, "traces")
    
    for d in [artifacts_dir, documents_dir, traces_dir]:
        os.makedirs(d, exist_ok=True)

    # Copy Plan if provided (Section 1.3)
    if plan_path and os.path.exists(plan_path):
        target_plan = os.path.join(documents_dir, f"{run_id}-PLAN-{task_id.upper()}.md")
        shutil.copy(plan_path, target_plan)
        print(f"📄 Plan archived to: {target_plan}")

    # Pre-flight: If payload is large (>4k), trigger restart
    if os.path.exists(payload_path) and os.path.getsize(payload_path) > 4000:
        force_restart_ollama()
    
    # Read Task and Payload
    with open(task_path, "r", encoding="utf-8") as f:
        task_content = f.read()
    with open(payload_path, "r", encoding="utf-8") as f:
        payload_content = f.read()
    full_prompt = f"{task_content}\n\n[CONTEXT AMMUNITION]\n{payload_content}"
    
    with open(os.path.join(artifacts_dir, "prompt.txt"), "w", encoding="utf-8") as f:
        f.write(full_prompt)

    print(f"🚀 [EABS-01] Starting Run: {run_id} | Model: {model_name}")
    
    # Start Telemetry (auto_logger_v2.py)
    tele_path = os.path.join(run_dir, "samples.jsonl")
    tele_proc = subprocess.Popen(["python", "scripts/auto_logger_v2.py", tele_path], shell=True)
    time.sleep(2) # Stabilization

    start_time = datetime.datetime.now(datetime.timezone.utc)
    events = [{"ts": start_time.isoformat(), "event": "benchmark_started"}]

    try:
        # SOP 3.1: Loop Guard
        payload = {
            "model": model_name,
            "prompt": full_prompt,
            "stream": False,
            "options": {"num_predict": 2500, "temperature": 0.2, "stop": ["<|im_end|>", "### END"]}
        }
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=300)
        response.raise_for_status()
        res_json = response.json()
        end_time = datetime.datetime.now(datetime.timezone.utc)
        
        raw_response = res_json.get("response", "")
        with open(os.path.join(artifacts_dir, "response.txt"), "w", encoding="utf-8") as f:
            f.write(raw_response)
            
        purified = strip_reasoning(raw_response)
        with open(os.path.join(artifacts_dir, "purified_response.txt"), "w", encoding="utf-8") as f:
            f.write(purified)
            
        events.append({"ts": end_time.isoformat(), "event": "benchmark_completed"})
        
        # Metadata & Metrics generation (matching Genesis schema)
        import platform
        metadata = {
            "benchmark_id": f"bench_{start_time.strftime('%Y%m%d_%H%M')}",
            "run_id": run_id,
            "session_id": os.environ.get("COVIBE_SESSION", "sess_manual_001"),
            "model": {"name": model_name},
            "runtime": {"runtime": "ollama"},
            "environment": {"os": platform.system()}
        }
        with open(os.path.join(run_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
            
        duration = (end_time - start_time).total_seconds()
        tokens_out = res_json.get("eval_count", 0)
        tps = tokens_out / duration if duration > 0 else 0
        
        metrics = {
            "status": "completed",
            "tokens": {"input": res_json.get("prompt_eval_count", 0), "output": tokens_out, "total": res_json.get("prompt_eval_count", 0) + tokens_out},
            "throughput": {"avg_tps": round(tps, 2)},
            "latency": {"ttft_ms": int(res_json.get("prompt_eval_duration", 0) / 1000000)},
            "gpu": {"max_temp_c": 0, "max_power_w": 0},
            "quality": {"passed": True if tps > 5 else False, "rank": "verified"}
        }
        
        # Post-process telemetry if available
        time.sleep(1) # Final flush
        tele_proc.terminate()
        
        if os.path.exists(tele_path):
            try:
                with open(tele_path, 'r', encoding='utf-8') as f:
                    samples = [json.loads(line) for line in f if line.strip()]
                    if samples:
                        metrics["gpu"]["max_temp_c"] = max([s.get("gpu_temp", 0) for s in samples])
                        metrics["gpu"]["max_power_w"] = max([s.get("gpu_power", 0) or s.get("gpu_power_w", 0) for s in samples])
            except: pass

        with open(os.path.join(run_dir, "metrics.json"), "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        # Traces
        with open(os.path.join(traces_dir, "events.jsonl"), "w", encoding="utf-8") as f:
            for e in events: f.write(json.dumps(e) + "\n")
        
        with open(os.path.join(traces_dir, "token_trace.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps({"token_index": 1, "latency_ms": metrics["latency"]["ttft_ms"]}) + "\n")
            
        open(os.path.join(traces_dir, "failures.jsonl"), 'w').close()

        print(f"✅ Run {run_id} Completed: {tps:.2f} TPS | Max Temp: {metrics['gpu']['max_temp_c']}C")
        return run_dir

    except Exception as e:
        print(f"❌ Error in Run {run_id}: {str(e)}")
        tele_proc.terminate()
        with open(os.path.join(traces_dir, "failures.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps({"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(), "error": str(e)}) + "\n")
        return None

if __name__ == "__main__":
    if len(sys.argv) >= 4:
        model = sys.argv[1]
        task = sys.argv[2]
        payload = sys.argv[3]
        run_benchmark(model, task, payload)

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        model = sys.argv[1]
        task = sys.argv[2]
        payload = sys.argv[3]
        run_benchmark(model, task, payload)
    else:
        # Example test run (Llama 3.2 1B for safety)
        # In production, this would be driven by the Battle Arena Runbook
        run_benchmark("llama3.2:1b", "tasks/L1_BASE/async_retry_ts.txt", "ammunition/STRESS_TEST/payload_8k.txt")
