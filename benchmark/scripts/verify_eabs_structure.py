import os
import json
import sys

def check_eabs_compliance(run_dir):
    print(f"🧐 Validating EABS-01 Compliance for: {run_dir}")
    
    issues = []
    
    # 1. Directory Structure Validation (Section 1)
    mandatory_dirs = [
        "artifacts",
        "documents",
        "traces"
    ]
    
    for d in mandatory_dirs:
        path = os.path.join(run_dir, d)
        if not os.path.isdir(path):
            issues.append(f"❌ Missing mandatory directory: {d}")
        else:
            print(f"✅ Directory found: {d}")

    # 2. Mandatory Files Validation (Section 1)
    mandatory_files = [
        "metadata.json",
        "metrics.json",
        "samples.jsonl",
        os.path.join("traces", "events.jsonl"),
        os.path.join("traces", "token_trace.jsonl"),
        os.path.join("traces", "failures.jsonl"),
        os.path.join("artifacts", "prompt.txt"),
        os.path.join("artifacts", "response.txt"),
        os.path.join("artifacts", "purified_response.txt")
    ]

    for f in mandatory_files:
        path = os.path.join(run_dir, f)
        if not os.path.exists(path):
            issues.append(f"❌ Missing mandatory file: {f}")
        else:
            print(f"✅ File found: {f}")

    # 3. Metadata Schema Validation (Section 2.1)
    metadata_path = os.path.join(run_dir, "metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                required_fields = ["benchmark_id", "run_id", "model", "runtime", "environment"]
                for field in required_fields:
                    if field not in data:
                        issues.append(f"❌ Metadata error: Missing field '{field}'")
                print("✅ Metadata schema basic check passed.")
        except Exception as e:
            issues.append(f"❌ Metadata error: Failed to parse JSON ({e})")

    # 4. Metrics Schema Validation (Section 2.2)
    metrics_path = os.path.join(run_dir, "metrics.json")
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                required_fields = ["status", "tokens", "throughput", "latency", "gpu", "quality"]
                for field in required_fields:
                    if field not in data:
                        issues.append(f"❌ Metrics error: Missing field '{field}'")
                print("✅ Metrics schema basic check passed.")
        except Exception as e:
            issues.append(f"❌ Metrics error: Failed to parse JSON ({e})")

    # Final Report
    print("\n" + "="*30)
    if not issues:
        print("🎉 COMPLIANCE RESULT: 100% EABS-01 COMPLIANT")
        return True
    else:
        print(f"🚨 COMPLIANCE RESULT: FAILED ({len(issues)} issues)")
        for issue in issues:
            print(issue)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_eabs_structure.py <run_directory>")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    check_eabs_compliance(target_dir)
