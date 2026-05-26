import sys
import json
import requests
import time
import os

OLLAMA_URL = "http://localhost:11434/api/generate"

# รายชื่อโจทย์ทดสอบระดับมาตรฐาน (Academic-style Coding Tasks)
TEST_SUITE = [
    {
        "id": "algorithm_t1",
        "category": "Algorithm",
        "prompt": "Implement a highly optimized 'useDebounce' and 'useThrottle' hook in TypeScript for a React 19 application. Ensure it handles leading/trailing edges and proper cleanup. Output code only."
    },
    {
        "id": "logic_t2",
        "category": "Complex Logic",
        "prompt": "Design a State Machine for a real-time collaborative audio player. States: IDLE, BUFFERING, PLAYING, SYNCING, ERROR. Actions: PLAY, PAUSE, SEEK, DRIFT_DETECTED. Provide the Reducer and Type definitions in TypeScript. Output code only."
    },
    {
        "id": "debugging_t3",
        "category": "RCA / Debugging",
        "prompt": "Context: A WebRTC voice chat signaling logic has a race condition where an ICE candidate arrives before the SetRemoteDescription is complete. Task: Explain the RCA and provide a robust fix using a queue mechanism. Output code only."
    }
]

def run_task(model, task, num_ctx=8192):
    # สำหรับรุ่นใหญ่ เราจะแถม num_gpu เพื่อป้องกันจอดำ
    options = {
        "temperature": 0.1,
        "num_ctx": num_ctx,
        "repeat_penalty": 1.1
    }
    
    # ถ้าเป็นรุ่น 12B-14B ให้จำกัด GPU Layers
    if "14b" in model or "12b" in model or "qwen3" in model or "heretic" in model:
        options["num_gpu"] = 40

    payload = {
        "model": model,
        "prompt": task["prompt"],
        "options": options,
        "stream": False # ใช้ False เพื่อให้ได้ Stats ที่แน่นอนทีเดียว
    }
    
    start_time = time.time()
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=300)
        r.raise_for_status()
        res = r.json()
        end_time = time.time()
        
        eval_sec = res.get("eval_duration", 1) / 1e9
        eval_count = res.get("eval_count", 0)
        tps = eval_count / eval_sec if eval_sec > 0 else 0
        
        return {
            "task_id": task["id"],
            "category": task["category"],
            "tps": round(tps, 2),
            "input_tokens": res.get("prompt_eval_count", 0),
            "output_tokens": eval_count,
            "total_duration": round(res.get("total_duration", 0) / 1e9, 2),
            "status": "Success",
            "code_sample": res.get("response", "")[:200] + "..."
        }
    except Exception as e:
        return {
            "task_id": task["id"],
            "category": task["category"],
            "status": f"Failed: {str(e)}",
            "tps": 0
        }

def main():
    models = ["qwen3", "sushirl", "heretic", "qwen3.5:4b", "llama3.2:1b"]
    results = {}

    print(f"🚀 Starting Global Benchmark for {len(models)} models...")

    for model in models:
        print(f"--- Testing Model: {model} ---")
        model_results = []
        for task in TEST_SUITE:
            print(f"  Running Task: {task['category']}...", end="", flush=True)
            res = run_task(model, task)
            model_results.append(res)
            print(f" Done ({res['tps']} t/s)")
            # พักหายใจ 2 วินาทีกันกระชากไฟ
            time.sleep(2)
        results[model] = model_results

    # บันทึกเป็น JSON สำหรับทำ Dashboard
    with open("benchmark_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Benchmark Complete! Files generated: benchmark_results.json")

if __name__ == "__main__":
    main()
