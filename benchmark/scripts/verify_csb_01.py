import os
import json
import re
import subprocess
import sys
import codecs

# Force UTF-8
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

def extract_code(file_path):
    """Extracts the first TypeScript/JavaScript code block from purified_response.txt."""
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Matches ```typescript ... ``` or ```javascript ... ``` or ``` ... ```
    match = re.search(r"```(?:typescript|javascript|ts|js)?\n(.*?)```", content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return content.strip() # Fallback to full content if no blocks found

def run_verification(model_name):
    model_safe_name = model_name.replace(":", "-").replace("/", "-")
    csb_dir = os.path.join("benchmark-run", model_safe_name, "CSB-01")
    
    if not os.path.exists(csb_dir):
        print(f"❌ CSB-01 directory not found: {csb_dir}")
        return

    levels = ["L1_BASE", "L2_LOGIC", "L3_DOMAIN"] # Verifiable levels via Vitest
    
    print(f"\n{'='*60}")
    print(f"🧪 VERIFYING CSB-01 QUALITY: {model_name}")
    print(f"{'='*60}\n")

    for level in levels:
        level_dir = os.path.join(csb_dir, level)
        purified_path = os.path.join(level_dir, "artifacts", "purified_response.txt")
        # Actual file names: verify_l1.ts, verify_l2.ts, verify_l3.ts
        suffix = level.split("_")[0].lower() # "l1", "l2", "l3"
        verify_script = os.path.join("benchmark-kits", "tasks", level, f"verify_{suffix}.ts")
        
        if not os.path.exists(purified_path):
            print(f"⏭️ Skipping {level}: No purified_response found.")
            continue
            
        if not os.path.exists(verify_script):
            print(f"⚠️ No verify script found for {level}: {verify_script}")
            continue

        print(f"--- [ {level} ] ---")
        
        # 1. Extract Code
        code = extract_code(purified_path)
        if not code:
            print("❌ No code extracted.")
            continue
            
        # 2. Prepare Temp Solution File
        solution_file = "temp_solution.ts"
        with open(solution_file, "w", encoding="utf-8") as f:
            f.write(code)
            
        # 3. Run Vitest
        # We expect the verify script to import from '../temp_solution.ts' or similar, 
        # but usually, we can just pass both to vitest or mock the import.
        # Strategy: The verify scripts likely expect 'solution.ts' in the same dir or a specific path.
        # Let's check verify_l1.ts content if possible, but standard is to run the test file.
        
        cmd = ["npx", "vitest", "run", verify_script, "--reporter=json"]
        process = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", shell=True)
        
        # 4. Parse Results
        quality_score = 0.0
        passed = False
        try:
            # Vitest JSON reporter output might be mixed with other logs
            json_start = process.stdout.find('{')
            if json_start != -1:
                test_results = json.loads(process.stdout[json_start:])
                total = test_results.get("numTotalTests", 0)
                pass_count = test_results.get("numPassedTests", 0)
                if total > 0:
                    quality_score = pass_count / total
                passed = (quality_score == 1.0)
                print(f"📊 Quality: {quality_score*100:.1f}% ({pass_count}/{total})")
            else:
                print("❌ Failed to parse Vitest JSON output.")
                print(process.stderr)
        except Exception as e:
            print(f"❌ Error parsing results: {e}")

        # 5. Update metrics.json
        metrics_path = os.path.join(level_dir, "metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r", encoding="utf-8") as f:
                metrics = json.load(f)
            
            metrics["quality"] = {
                "passed": passed,
                "score": round(quality_score, 4),
                "verified_by": "vitest"
            }
            
            with open(metrics_path, "w", encoding="utf-8") as f:
                json.dump(metrics, f, indent=2)
            print(f"✅ metrics.json updated for {level}")

    # Cleanup
    if os.path.exists("temp_solution.ts"):
        os.remove("temp_solution.ts")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/verify_csb_01.py <model_name>")
        sys.exit(1)
    run_verification(sys.argv[1])
