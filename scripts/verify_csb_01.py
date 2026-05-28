import os
import re
import json
import subprocess
import sys
import shutil

# --- CONFIGURATION ---
BASE_RESULTS_DIR = "G:/covibe/benchmark"
BASE_TASKS_DIR = "G:/covibe/benchmark/tasks"
TMP_DIR = "G:/covibe/benchmark/tmp_verify"

# Model folders to process (those created by run_csb_01.py)
TARGET_MODELS = [
    "llama3.2_1b",
    "hf.co_iapp_chinda-qwen3-4b-gguf_Q4_K_M",
    "qwen3.5_4b",
    "gemma4-rust-coder_latest",
    "sushirl_latest",
    "qwen3_latest"
]

# Map Level to Verification Config
VERIFY_CONFIG = {
    "L1": {
        "suite": "L1_BASE/verify_l1.ts",
        "entry_point": "deepMerge",
        "runner_func": "runL1Test"
    },
    "L2": {
        "suite": "L2_LOGIC/verify_l2.ts",
        "entry_point": "PriorityQueue",
        "runner_func": "runL2Test"
    },
    "L3": {
        "suite": "L3_DOMAIN/verify_l3.ts",
        "entry_point": "calculateCorrection",
        "runner_func": "runL3Test"
    }
}

def extract_code(text):
    # Strip <think> blocks first
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    # Match markdown code blocks (prefer typescript/javascript, handle truncated blocks)
    matches = re.findall(r"```(?:typescript|javascript|js|ts)?\s*(.*?)(?:```|\Z)", text, re.DOTALL)
    if matches:
        return matches[0].strip()
    return None

def run_vitest(test_file):
    try:
        # Run vitest in the project root where node_modules/vitest exists
        result = subprocess.run(
            ["npx", "vitest", "run", test_file, "--reporter=verbose"],
            capture_output=True,
            text=True,
            shell=True # Required for npx on Windows
        )
        if result.stdout:
            # Look for passing/total tests in verbose output if JSON fails
            pass_match = re.search(r"Tests\s+(\d+) passed", result.stdout)
            total_match = re.search(r"Tests\s+(\d+) total", result.stdout)
            
            if pass_match and total_match:
                return {
                    "numPassedTests": int(pass_match.group(1)),
                    "numTotalTests": int(total_match.group(1))
                }
            
            print(f"      ❌ Verbose Parse Error. Stdout summary: {result.stdout[:500]}")
        else:
            print(f"      ❌ No stdout. Stderr: {result.stderr[:500]}")
    except Exception as e:
        print(f"      ❌ Error running Vitest: {e}")
    return None

def verify_task(model_name, level, response_path, metrics_path):
    config = VERIFY_CONFIG.get(level)
    if not config: return

    print(f"  🔍 Verifying {level}...", end="", flush=True)

    if not os.path.exists(response_path):
        print(" SKIPPED (No response)")
        return

    with open(response_path, "r", encoding="utf-8") as f:
        content = f.read()

    code = extract_code(content)
    if code is None:
        print(f" FAILED (No markdown block found in {len(content)} chars)")
        return
    if not code.strip():
        print(" FAILED (Empty code block)")
        return

    # Create Sandbox
    os.makedirs(TMP_DIR, exist_ok=True)
    solution_file = os.path.join(TMP_DIR, "solution.ts")
    runner_file = os.path.join(TMP_DIR, "runner.test.ts")

    # Write solution
    with open(solution_file, "w", encoding="utf-8") as f:
        f.write(code)

    # Create Runner
    suite_path = f"../../tasks/{config['suite']}".replace("\\", "/")
    runner_code = f"""
import * as Solution from './solution';
import {{ {config['runner_func']} }} from '{suite_path}';

const entry = Solution['{config['entry_point']}'] || (Solution as any).default?.['{config['entry_point']}'] || (Solution as any).default;

if (entry) {{
    {config['runner_func']}(entry);
}} else {{
    throw new Error('Entry point "{config['entry_point']}" not found in solution');
}}
"""
    with open(runner_file, "w", encoding="utf-8") as f:
        f.write(runner_code)

    # Execute
    report = run_vitest(runner_file)
    
    passed = False
    score = 0.0
    
    if report and report.get("numTotalTests", 0) > 0:
        total = report["numTotalTests"]
        passed_count = report.get("numPassedTests", 0)
        score = round(passed_count / total, 2)
        passed = (score == 1.0)
        print(f" DONE (Score: {score})")
    else:
        print(" FAILED (Test Execution Error or No Tests Run)")

    # Update metrics.json
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)
        
        metrics["quality"] = {
            "passed": passed,
            "rank": "elite" if score == 1.0 else "good" if score >= 0.7 else "poor",
            "score": score,
            "verification_timestamp": datetime.now().isoformat()
        }
        
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

from datetime import datetime

def main():
    print(f"🧪 --- STARTING CSB-01 AUTOMATED VERIFICATION --- 🚀")
    
    if not os.path.exists(BASE_RESULTS_DIR):
        print(f"Error: Results directory {BASE_RESULTS_DIR} not found.")
        return

    for model_folder in TARGET_MODELS[:1]:
        model_path = os.path.join(BASE_RESULTS_DIR, model_folder)
        if not os.path.exists(model_path): continue

        print(f"\n🤖 Model: {model_folder}")
        
        for level in VERIFY_CONFIG.keys():
            level_path = os.path.join(model_path, level)
            if not os.path.exists(level_path): continue
            
            response_path = os.path.join(level_path, "artifacts", "response.txt")
            metrics_path = os.path.join(level_path, "metrics.json")
            
            verify_task(model_folder, level, response_path, metrics_path)

    # Cleanup (Disabled for debugging)
    # if os.path.exists(TMP_DIR):
    #     shutil.rmtree(TMP_DIR)
    
    print(f"\n\n🏁 --- VERIFICATION FINISHED --- 🏁")

if __name__ == "__main__":
    main()
