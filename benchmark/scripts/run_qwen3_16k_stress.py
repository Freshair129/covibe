import os
import json
import time
import requests
import subprocess
from datetime import datetime

# EABS-01 Configuration
MODEL = "qwen3:latest"
BENCHMARK_ID = f"bench_qwen3_16k_{datetime.now().strftime('%Y%m%d_%H%M')}"
OLLAMA_HOST = "http://localhost:11434"

def force_restart_ollama():
    """Forcibly restarts Ollama to clear VRAM fragmentation."""
    print("\n🔄 [SYSTEM] Pre-flight: Clearing VRAM for 16K Stress Test...")
    try:
        subprocess.run(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", "scripts/restart_ollama.ps1"], check=True)
        return True
    except Exception as e:
        print(f"❌ [SYSTEM] Failed to restart Ollama: {e}")
    return False

def run_stress_test():
    # 0. Pre-flight Restart
    force_restart_ollama()
    
    run_dir = f"benchmark-run/{MODEL.replace(':', '-')}-16k-stress"
    os.makedirs(os.path.join(run_dir, "artifacts"), exist_ok=True)
    os.makedirs(os.path.join(run_dir, "traces"), exist_ok=True)
    
    # 1. Start Telemetry
    tele_path = os.path.join(run_dir, "samples.jsonl")
    tele_proc = subprocess.Popen(["python", "scripts/auto_logger_v2.py", tele_path], shell=True)
    time.sleep(2)
    
    # 2. Prepare Prompt (16K Payload)
    task_path = "benchmark-kits/tasks/L4_STRESS/refactor_large_component.txt"
    payload_path = "benchmark-kits/ammunition/STRESS_TEST/payload_16k.txt"
    
    with open(task_path, 'r', encoding='utf-8') as f:
        task_content = f.read()
    with open(payload_path, 'r', encoding='utf-8') as f:
        payload_content = f.read()
        
    full_prompt = f"{task_content}\n\n[CONTEXT AMMUNITION]\n{payload_content}"
    
    print(f"🚀 [STRESS] Starting 16K Context Test for {MODEL}...")
    print(f"📏 Prompt size: {len(full_prompt)} characters (~{len(full_prompt)//4} tokens)")
    
    # 3. Execute
    start_time = time.time()
    try:
        response = requests.post(f"{OLLAMA_HOST}/api/generate", json={
            "model": MODEL,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "num_ctx": 16384, 
                "temperature": 0.1, 
                "num_predict": 1000
            }
        }, timeout=1200) # Increased to 20 minutes for 16K prefill
        
        duration = time.time() - start_time
        result = response.json()
        
        # 4. Save Artifacts
        with open(os.path.join(run_dir, "artifacts", "response.txt"), 'w', encoding='utf-8') as f:
            f.write(result.get("response", ""))
            
        # 5. Generate Metrics
        tokens_in = result.get("prompt_eval_count", 0)
        tokens_out = result.get("eval_count", 0)
        tps = tokens_out / (result.get("eval_duration", 1) / 1e9)
        prefill_tps = tokens_in / (result.get("prompt_eval_duration", 1) / 1e9)
        
        metrics = {
            "benchmark_id": BENCHMARK_ID,
            "status": "completed",
            "task_id": "16k_stress_refactor",
            "duration_sec": duration,
            "tokens": {"input": tokens_in, "output": tokens_out, "total": tokens_in + tokens_out},
            "throughput": {"avg_tps": tps, "prefill_tps": prefill_tps},
            "gpu": {"max_temp_c": 0, "max_vram_mb": 0}
        }
        
        # Post-process telemetry
        if os.path.exists(tele_path):
            with open(tele_path, 'r', encoding='utf-8') as f:
                samples = [json.loads(line) for line in f if line.strip()]
                if samples:
                    metrics["gpu"]["max_temp_c"] = max([s.get("gpu_temp", 0) for s in samples])
                    metrics["gpu"]["max_vram_mb"] = max([s.get("gpu_vram_mb", 0) for s in samples])

        with open(os.path.join(run_dir, "metrics.json"), 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2)

        print(f"✅ STRESS COMPLETED")
        print(f"📊 Tokens: {tokens_in} in / {tokens_out} out")
        print(f"⚡ Prefill: {prefill_tps:.2f} t/s | Generation: {tps:.2f} t/s")
        print(f"🔥 Max Temp: {metrics['gpu']['max_temp_c']}°C | Max VRAM: {metrics['gpu']['max_vram_mb']} MB")
        
    except Exception as e:
        print(f"❌ Stress test failed: {e}")
    finally:
        tele_proc.terminate()
        requests.post(f"{OLLAMA_HOST}/api/generate", json={"model": MODEL, "keep_alive": 0})

if __name__ == "__main__":
    run_stress_test()
