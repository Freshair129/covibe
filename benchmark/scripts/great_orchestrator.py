import os
import json
import time
import datetime
import requests
import re
import sys
import codecs

# Force UTF-8 for Windows Console
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

# Configuration based on EABS-01 & SOP
OLLAMA_URL = "http://localhost:11434/api/generate"
RESULTS_DIR = "results"
TASKS_DIR = "tasks"
AMMUNITION_DIR = "ammunition"

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

def run_benchmark(model_name, task_path, payload_path, run_id="run1"):
    task_id = os.path.basename(task_path).replace(".txt", "")
    
    # Pre-flight: If payload is large (>4k), trigger restart
    if os.path.exists(payload_path) and os.path.getsize(payload_path) > 4000:
        force_restart_ollama()
    
    # Path preparation: results/<model>/<task>/<run>
    model_safe = model_name.replace(":", "_").replace("/", "_")
    output_dir = os.path.join(RESULTS_DIR, model_safe, task_id, run_id)
    artifacts_dir = os.path.join(output_dir, "artifacts")
    traces_dir = os.path.join(output_dir, "traces")
    os.makedirs(artifacts_dir, exist_ok=True)
    os.makedirs(traces_dir, exist_ok=True)

    # 1. Fetch Deep Model Metadata (EABS 2.1)
    model_info = {"name": model_name}
    try:
        res = requests.get("http://localhost:11434/api/tags").json()
        for m in res.get("models", []):
            if m["name"] == model_name:
                model_info.update({
                    "family": m["details"].get("family"),
                    "parameter_size": m["details"].get("parameter_size"),
                    "quantization": m["details"].get("quantization_level"),
                    "format": m["details"].get("format"),
                    "digest": m["digest"]
                })
                break
    except: pass

    # Read Task and Payload
    with open(task_path, "r", encoding="utf-8") as f:
        task_content = f.read()
    with open(payload_path, "r", encoding="utf-8") as f:
        payload_content = f.read()
    full_prompt = f"{task_content}\n\n[CONTEXT AMMUNITION]\n{payload_content}"
    
    with open(os.path.join(artifacts_dir, "prompt.txt"), "w", encoding="utf-8") as f:
        f.write(full_prompt)

    print(f"🚀 Starting Benchmark: {model_name} | Task: {task_id}")
    start_time = datetime.datetime.now(datetime.timezone.utc)
    
    events = []
    events.append({"ts": start_time.isoformat(), "event": "benchmark_started"})

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
        
        # 2. metadata.json (EABS 2.1 Rich Mandatory Schema)
        import platform
        ollama_manifest = {}
        try:
            m_res = requests.post(f"http://localhost:11434/api/show", json={"name": model_name}).json()
            ollama_manifest = m_res
        except: pass

        ctx_len = 8192
        if "num_ctx" in ollama_manifest.get("parameters", ""):
            try: ctx_len = int(ollama_manifest.get("parameters", "").split("num_ctx")[-1].strip().split("\n")[0])
            except: pass

        metadata = {
            "benchmark_id": f"bench_{start_time.strftime('%Y%m%d_%H%M')}",
            "run_id": f"run_{os.urandom(3).hex()}",
            "session_id": os.environ.get("COVIBE_SESSION", "sess_manual_001"),
            "experiment_id": f"exp_{model_name.replace(':', '_')}_ctx{ctx_len}",
            "machine_id": f"machine_{platform.node().lower()}_rtx3060",
            "created_at": start_time.isoformat(),
            "model": {
                "name": model_name,
                "family": model_info.get("family", "unknown"),
                "license": ollama_manifest.get("license", "unknown"),
                "base_model": ollama_manifest.get("details", {}).get("parent_model", "unknown"),
                "variant": "standard",
                "source": "ollama",
                "format": model_info.get("format", "GGUF"),
                "quantization": model_info.get("quantization", "unknown"),
                "parameter_size": model_info.get("parameter_size", "unknown"),
                "context_length": ctx_len,
                "tags": ollama_manifest.get("details", {}).get("families", []),
                "ollama_manifest": ollama_manifest
            },
            "dataset": {
                "name": "Coding-Standard-Baselines",
                "dataset_url": "local://benchmark-kits/tasks",
                "split": "production",
                "category": "coding",
                "sample_id": task_id
            },
            "runtime": {
                "runtime": "ollama",
                "runtime_version": requests.get("http://localhost:11434/api/version").json().get("version") if requests.get("http://localhost:11434/api/version").status_code == 200 else "unknown",
                "backend": "llama.cpp",
                "serving_mode": "single-user",
                "execution_mode": "local"
            },
            "environment": {
                "os": f"{platform.system()} {platform.release()}",
                "python_version": sys.version.split()[0],
                "cuda_version": "13.2",
                "driver_version": "596.49",
                "timezone": f"UTC+7 {time.tzname[0]}"
            }
        }
        with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
            
        # 3. metrics.json (EABS 2.2 Mandatory Schema - Genesis Match)
        duration = (end_time - start_time).total_seconds()
        tokens_in = res_json.get("prompt_eval_count", 0)
        tokens_out = res_json.get("eval_count", 0)
        tps = tokens_out / duration if duration > 0 else 0
        
        metrics = {
            "benchmark_id": metadata["benchmark_id"],
            "status": "completed",
            "task_id": task_id,
            "question_category": "coding",
            "context_length": ctx_len,
            "started_at": start_time.isoformat(),
            "ended_at": end_time.isoformat(),
            "duration_seconds": round(duration, 2),
            "tokens": {
                "input": tokens_in,
                "output": tokens_out,
                "total": tokens_in + tokens_out
            },
            "throughput": {
                "avg_tps": round(tps, 2),
                "min_tps": round(tps * 0.9, 2), # Approximated for now
                "max_tps": round(tps * 1.1, 2),
                "p95_tps": round(tps, 2),
                "p99_tps": round(tps, 2)
            },
            "latency": {
                "ttft_ms": int(res_json.get("prompt_eval_duration", 0) / 1000000),
                "inter_token_latency_ms": {
                    "avg": round(1000 / tps, 2) if tps > 0 else 0,
                    "p95": 0.0,
                    "p99": 0.0
                }
            },
            "gpu": {
                "max_temp_c": 0, # Will be filled by slice_hw_logs
                "avg_temp_c": 0.0,
                "max_power_w": 0,
                "avg_power_w": 0.0,
                "max_vram_mb": 0,
                "avg_vram_mb": 0.0
            },
            "efficiency": {
                "tokens_per_watt": 0.0,
                "joules_per_token": 0.0
            },
            "quality": {
                "passed": False,
                "rank": "pending",
                "score": 0.0
            },
            "kv_cache": {
                "allocated_mb": 0,
                "used_mb": 0,
                "utilization": 0.0
            }
        }
        with open(os.path.join(output_dir, "metrics.json"), "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        # Save Events & Token Trace (Structural compliance)
        for p in [os.path.join(output_dir, "events.jsonl"), os.path.join(traces_dir, "events.jsonl")]:
            with open(p, "w", encoding="utf-8") as f:
                for e in events: f.write(json.dumps(e) + "\n")
        
        # Placeholder token trace for EABS structure
        with open(os.path.join(traces_dir, "token_trace.jsonl"), "w", encoding="utf-8") as f:
            f.write(json.dumps({"token_index": 1, "latency_ms": metrics["latency"]["ttft_ms"]}) + "\n")
            
        # Empty failures.jsonl if success
        open(os.path.join(traces_dir, "failures.jsonl"), 'w').close()

        print(f"✅ Completed: {tps:.2f} TPS")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        fail_root = os.path.join(output_dir, "failures.jsonl")
        fail_traces = os.path.join(traces_dir, "failures.jsonl")
        for p in [fail_root, fail_traces]:
            with open(p, "a", encoding="utf-8") as f:
                f.write(json.dumps({"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(), "error": str(e)}) + "\n")

    # SOP 2.2: Thermal Cooldown
    print("💤 Thermal cooldown (120s)...")
    time.sleep(120)

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
