import os
import json
import re
import subprocess
import sys
import codecs

# Force UTF-8
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

CSB_01_MATRIX = [
    {"level": "L1_BASE", "task": "utility_deep_merge.txt", "symbol": "deepMerge", "test_fn": "runL1Test"},
    {"level": "L2_LOGIC", "task": "algorithm_priority_queue.txt", "symbol": "PriorityQueue", "test_fn": "runL2Test"},
    {"level": "L3_DOMAIN", "task": "covibe_yt_sync_logic.txt", "symbol": "calculateCorrection", "test_fn": "runL3Test"},
]

def extract_code(file_path):
    """Extracts the first TypeScript/JavaScript code block from purified_response.txt."""
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Matches ```typescript ... ``` or ```javascript ... ``` or ``` ... ```
    match = re.search(r"```(?:typescript|javascript|ts|js)?\n(.*?)```", content, re.DOTALL)
    if match:
        code = match.group(1).strip()
        # Ensure the symbol is exported if it's defined but not exported
        # This is a bit risky but helps with models that don't use 'export'
        return code
    return content.strip()

def run_verification(model_name):
    model_safe_name = model_name.replace(":", "-").replace("/", "-")
    
    print(f"\n{'='*60}")
    print(f"🧪 VERIFYING CSB-01 QUALITY: {model_name}")
    print(f"{'='*60}\n")

    for entry in CSB_01_MATRIX:
        level = entry["level"]
        task_id = entry["task"].replace(".txt", "")
        symbol = entry["symbol"]
        test_fn_name = entry["test_fn"]
        
        # Flat Structure: benchmark-run/<model>-<task>
        run_dir = os.path.join("benchmark-run", f"{model_safe_name}-{task_id}")
        purified_path = os.path.join(run_dir, "artifacts", "purified_response.txt")
        
        suffix = level.split("_")[0].lower() # "l1", "l2", "l3"
        verify_script = os.path.abspath(os.path.join("benchmark-kits", "tasks", level, f"verify_{suffix}.ts"))
        
        if not os.path.exists(purified_path):
            print(f"⏭️ Skipping {level} ({task_id}): No purified_response found at {purified_path}")
            continue
            
        print(f"--- [ {level} ] Task: {task_id} ---")
        
        # 1. Extract Code
        code = extract_code(purified_path)
        if not code:
            print("❌ No code extracted.")
            continue
            
        # 2. Prepare Temp Solution File
        # We add 'export' to common patterns if missing to ensure importability
        if f"function {symbol}" in code and f"export function {symbol}" not in code:
            code = code.replace(f"function {symbol}", f"export function {symbol}")
        if f"class {symbol}" in code and f"export class {symbol}" not in code:
            code = code.replace(f"class {symbol}", f"export class {symbol}")
        if f"const {symbol}" in code and f"export const {symbol}" not in code:
            code = code.replace(f"const {symbol}", f"export const {symbol}")

        solution_file = "temp_solution.ts"
        with open(solution_file, "w", encoding="utf-8") as f:
            f.write(code)
            
        # 3. Create Runner File
        runner_file = "temp_runner.test.ts"
        with open(runner_file, "w", encoding="utf-8") as f:
            f.write(f"""
import * as solution from './temp_solution';
import {{ {test_fn_name} }} from '{verify_script.replace('\\', '/')}';

const target = solution['{symbol}'] || (solution as any).default?.['{symbol}'] || (solution as any).default;

if (target) {{
    {test_fn_name}(target);
}} else {{
    import('vitest').then(({{ describe, it, expect }}) => {{
        describe('{level} Injection', () => {{
            it('should find symbol {symbol} in solution', () => {{
                expect(target, 'Symbol {symbol} not found in solution exports').toBeDefined();
            }});
        }});
    }});
}}
""")

        # 4. Run Vitest
        cmd = ["npx", "vitest", "run", runner_file, "--reporter=json"]
        process = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", shell=True)
        
        # 5. Parse Results
        quality_score = 0.0
        passed = False
        try:
            # Vitest JSON reporter output might be mixed with other logs
            json_start = process.stdout.find('{')
            if json_start != -1:
                test_results = json.loads(process.stdout[json_start:])
                # Vitest JSON format: "numTotalTests", "numPassedTests"
                total = test_results.get("numTotalTests", 0)
                pass_count = test_results.get("numPassedTests", 0)
                if total > 0:
                    quality_score = pass_count / total
                passed = (quality_score == 1.0 and total > 0)
                print(f"📊 Quality: {quality_score*100:.1f}% ({pass_count}/{total})")
            else:
                print("❌ Failed to parse Vitest JSON output.")
                # print(process.stdout)
        except Exception as e:
            print(f"❌ Error parsing results: {e}")

        # 6. Update metrics.json
        metrics_path = os.path.join(run_dir, "metrics.json")
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
    for f in ["temp_solution.ts", "temp_runner.test.ts"]:
        if os.path.exists(f):
            os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/verify_csb_01.py <model_name>")
        sys.exit(1)
    run_verification(sys.argv[1])
