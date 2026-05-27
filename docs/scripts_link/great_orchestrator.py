import asyncio
import json
import time
import requests
import google.generativeai as genai
import os
import re
import sys

# Force UTF-8 for Windows terminal to prevent Emoji crash (CP1252 fix)
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# --- CONFIGURATION ---
LOCAL_MODELS = [
    "sushirl:latest",
    "hf.co/Jackrong/Qwopus3.5-9B-Coder-GGUF:Q4_K_M",
    "qwen3:latest",
    "qwen3.5:4b",
    "hf.co/iapp/chinda-qwen3-4b-gguf:Q4_K_M",
    "gemma4-rust-coder:latest",
    "llama3.2:1b"
]

CLOUD_MODELS = {
    "thaillm": [
        "pathumma-thaillm-qwen3-8b-think-3.0.0",
        "typhoon-s-thaillm-8b-instruct",
        "thalle-0.2-thaillm-8b-fa",
        "openthaigpt-thaillm-8b-instruct-v7.2"
    ],
    "gemini": [
        "gemini-2.0-flash"
    ]
}

THAILLM_KEY = "NI4QDeGTnMWbK9GfjzT1fQTOXtCckLpo"
GEMINI_KEY = "AIzaSyCXBX2L92GYzoenIdssJ5PfM9Pek9GwGjA"

# --- PROVIDERS ---

async def run_local(model, prompt, num_ctx):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "options": {
            "num_ctx": num_ctx, 
            "num_predict": 2500, 
            "temperature": 0.1,
            "stop": ["<|im_end|>", "### END", "```\n\n", "Explanation:"]
        },
        "stream": True 
    }
    
    start_time = time.time()
    full_response = ""
    eval_count = 0
    eval_duration = 1
    
    # Smart Stream Buffer
    last_print_len = 0
    
    try:
        print(f"\n[{model}] INFERENCE START ({num_ctx} Ctx):")
        with requests.post(url, json=payload, stream=True, timeout=300) as resp:
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    text = chunk.get("response", "")
                    full_response += text
                    
                    # --- HYBRID PRINT LOGIC ---
                    if len(full_response) < 500:
                        print(text, end="", flush=True)
                    elif len(full_response) - last_print_len > 100:
                        print("❤", end="", flush=True)
                        last_print_len = len(full_response)
                        if len(full_response) % 1000 < 50:
                            print(f"\n[SNEAK PEEK]: {text.strip()}\n", end="", flush=True)
                    
                    if chunk.get("done"):
                        eval_count = chunk.get("eval_count", 0)
                        eval_duration = chunk.get("eval_duration", 1)
                        break
        
        end_time = time.time()
        print(" [DONE]")
        
        # Strip <think> tags for RL models
        cleaned_response = re.sub(r"<think>.*?</think>", "", full_response, flags=re.DOTALL).strip()
        
        tps = round(eval_count / (eval_duration / 1e9), 2)
        
        return {
            "model": model,
            "tps": tps,
            "time": round(end_time - start_time, 2),
            "status": "success",
            "content_preview": cleaned_response[:200] + "..."
        }
    except Exception as e:
        print(f"\n[{model}] ERROR: {str(e)}")
        return {"model": model, "status": "failed", "error": str(e)}

async def run_thaillm(model_id, prompt):
    url = "http://thaillm.or.th/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {THAILLM_KEY}"}
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048,
        "temperature": 0.1
    }
    start = time.time()
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        end = time.time()
        if resp.status_code == 200:
            res = resp.json()
            out_tokens = res['usage']['completion_tokens']
            return {
                "model": model_id,
                "tps": round(out_tokens / (end - start), 2),
                "time": round(end - start, 2),
                "status": "success"
            }
    except Exception as e:
        return {"model": model_id, "status": "failed", "error": str(e)}

async def run_gemini(model_id, prompt):
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel(model_id)
    start = time.time()
    try:
        response = model.generate_content(prompt)
        end = time.time()
        out_tokens = len(response.text.split()) * 1.3 # Estimation
        return {
            "model": model_id,
            "tps": round(out_tokens / (end - start), 2),
            "time": round(end - start, 2),
            "status": "success"
        }
    except Exception as e:
        return {"model": model_id, "status": "failed", "error": str(e)}

# --- TASK BANK LOADER ---

def load_task(task_path):
    full_path = os.path.join("G:/covibe/benchmark/tasks", task_path)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "STRICT RULES: Implement the requested logic in TypeScript. Output ONLY the core class/function and one simple usage. End with '### END'."

# --- ORCHESTRATOR ---

async def run_round(task_name, context_size, task_file):
    print(f"\n🚀 --- Starting Round: {task_name} | Ctx: {context_size} ---")
    
    # Load Payload
    payload_file = f"G:/covibe/payloads/payload_{context_size.lower()}.txt"
    if not os.path.exists(payload_file):
        print(f"ERROR: Payload {payload_file} not found. Run generate_payloads.py first.")
        return []

    with open(payload_file, "r", encoding="utf-8") as f:
        context_data = f.read()
    
    # Load Task from Bank
    task_desc = load_task(task_file)
    full_prompt = f"{context_data}\n\nTask: {task_desc}"
    
    results = []

    # Run Local Models Sequentially
    for model in LOCAL_MODELS:
        # Skip 32K for non-sushi models
        if context_size == "32K" and "sushi" not in model: continue
        # Skip 16K/32K for 14B
        if (context_size == "16K" or context_size == "32K") and "qwen3:latest" in model: continue

        print(f"Running Local: {model}...")
        
        # Start Cloud Tasks in Background Parallel to Local
        cloud_tasks = []
        for m_id in CLOUD_MODELS["thaillm"]:
            cloud_tasks.append(run_thaillm(m_id, full_prompt))
        for m_id in CLOUD_MODELS["gemini"]:
            cloud_tasks.append(run_gemini(m_id, full_prompt))
        
        # Execute Local and Cloud concurrently
        local_task = run_local(model, full_prompt, 8192 if "qwen3:latest" in model else 16384)
        
        round_results = await asyncio.gather(local_task, *cloud_tasks)
        results.extend(round_results)
        
        # Thermal Check: Cool down
        print(f"Cooling down 10s to prevent thermal accumulation...")
        time.sleep(10)

    return results

async def main():
    all_benchmarks = {}
    
    # Assembly Testkit via SOP Registry
    all_benchmarks["8K_Base"] = await run_round("L1_Base", "8K", "L1_BASE/async_retry_ts.txt")
    all_benchmarks["16K_Logic"] = await run_round("L2_Logic", "16K", "L2_LOGIC/circuit_breaker_ts.txt")
    all_benchmarks["16K_Vitest"] = await run_round("L3_Domain", "16K", "L3_DOMAIN/vitest_unit_test_gen.txt")
    all_benchmarks["32K_Stress"] = await run_round("L4_Stress", "32K", "L4_STRESS/reasoning_stress_test.txt")

    with open("G:/covibe/benchmark_results_parallel.json", "w", encoding="utf-8") as f:
        json.dump(all_benchmarks, f, indent=4, ensure_ascii=False)
    
    print("\n🏆 --- ALL BENCHMARKS COMPLETED ---")
    print("Results saved to G:/covibe/benchmark_results_parallel.json")

if __name__ == "__main__":
    asyncio.run(main())
