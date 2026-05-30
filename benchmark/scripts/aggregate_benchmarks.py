import os
import json
import glob

def aggregate_benchmarks():
    base_dir = "benchmark-run"
    output_path = "ui/data/benchmarks.json"
    
    results = {}
    
    # 2. Process Stress Test specifically if it exists
    stress_log = "telemetry_logs/stress_vram.jsonl"
    if os.path.exists(stress_log):
        traces = []
        with open(stress_log, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            step = max(1, len(lines) // 100) # More points for stress
            for i in range(0, len(lines), step):
                try:
                    traces.append(json.loads(lines[i]))
                except: pass
        
        results["vram-stress-test"] = {
            "id": "vram-stress-test",
            "name": "EABS-01 VRAM Fragmentation Stress",
            "speed": 0,
            "quality": "STRESS TEST",
            "verdict": "Monitoring VRAM fragmentation across 5 cycles of model switching.",
            "impact": "Critical",
            "tempMax": max([t.get('gpu_temp', 0) for t in traces]) if traces else 0,
            "vram": "Stress Run",
            "rank": "Diagnostic",
            "color": "from-rose-500 to-red-800",
            "textColor": "text-rose-500",
            "badgeColor": "bg-rose-500/10 text-rose-500 border-rose-500/30",
            "architectureNote": "Sequence: Llama 1B -> Gemma 4B -> Qwen 4B (Repeated)",
            "waveform": "sawtooth",
            "sampleCode": "// Fragmentation Analysis Trace Active",
            "traces": traces
        }

    # Get all result directories
    dirs = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    
    for d in dirs:
        dir_path = os.path.join(base_dir, d)
        metadata_path = os.path.join(dir_path, "metadata.json")
        metrics_path = os.path.join(dir_path, "metrics.json")
        samples_path = os.path.join(dir_path, "samples.jsonl")
        response_path = os.path.join(dir_path, "artifacts", "purified_response.txt")
        
        if not (os.path.exists(metadata_path) and os.path.exists(metrics_path)):
            continue
            
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        with open(metrics_path, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
            
        # Get sample telemetry (decimated for UI performance)
        traces = []
        if os.path.exists(samples_path):
            with open(samples_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                # Decimate: take ~50 points max for better charts
                step = max(1, len(lines) // 50)
                for i in range(0, len(lines), step):
                    try:
                        traces.append(json.loads(lines[i]))
                    except:
                        pass
        
        # Get sample code
        sample_code = "// No response captured"
        if os.path.exists(response_path):
            with open(response_path, 'r', encoding='utf-8') as f:
                sample_code = f.read()

        model_name = metadata.get("model", "unknown")
        task_id = metrics.get("task_id", d)
        result_id = f"{model_name}-{task_id}"
        
        # Map to UI structure
        results[result_id] = {
            "id": result_id,
            "name": f"{model_name} ({task_id})",
            "speed": metrics.get("throughput", {}).get("avg_tps", 0),
            "quality": f"{metrics.get('quality', {}).get('score', 0)} ({'PASSED' if metrics.get('quality', {}).get('passed') else 'FAILED'})",
            "verdict": f"Status: {metrics.get('status')}. Verified by {metrics.get('quality', {}).get('verified_by')}.",
            "impact": "High" if metrics.get("gpu", {}).get("max_temp_c", 0) > 70 else "Normal",
            "tempMax": metrics.get("gpu", {}).get("max_temp_c", 0),
            "vram": f"{metrics.get('gpu', {}).get('max_vram_mb', 0) / 1024:.1f} GB",
            "rank": "Passed" if metrics.get('quality',{}).get('passed') else "Review Required",
            "color": "from-blue-400 to-indigo-600" if "llama" in model_name else "from-orange-400 to-red-600",
            "textColor": "text-blue-400" if "llama" in model_name else "text-orange-400",
            "badgeColor": "bg-blue-400/10 text-blue-400 border-blue-400/30" if "llama" in model_name else "bg-orange-400/10 text-orange-400 border-orange-400/30",
            "architectureNote": f"Model: {model_name} | Task: {task_id} | Total Tokens: {metrics.get('tokens', {}).get('total', 0)}",
            "waveform": "sine",
            "sampleCode": sample_code,
            "traces": traces
        }
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"Successfully aggregated {len(results)} results to {output_path}")

if __name__ == "__main__":
    aggregate_benchmarks()
