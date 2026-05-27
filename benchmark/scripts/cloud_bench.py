import sys
import json
import time
import requests
import google.generativeai as genai

# KEYS
THAILLM_KEY = "NI4QDeGTnMWbK9GfjzT1fQTOXtCckLpo"
GEMINI_KEY = "AIzaSyCXBX2L92GYzoenIdssJ5PfM9Pek9GwGjA"

def run_thaillm(model_id, prompt):
    url = "http://thaillm.or.th/api/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {THAILLM_KEY}"
    }
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048,
        "temperature": 0.1
    }
    
    start_time = time.time()
    response = requests.post(url, headers=headers, json=payload)
    end_time = time.time()
    
    if response.status_code == 200:
        result = response.json()
        content = result['choices'][0]['message']['content']
        # ThaiLLM usually provides token usage in response
        usage = result.get('usage', {})
        out_tokens = usage.get('completion_tokens', 0)
        in_tokens = usage.get('prompt_tokens', 0)
        
        duration = end_time - start_time
        tps = out_tokens / duration if duration > 0 else 0
        
        return {
            "content": content,
            "tps": round(tps, 2),
            "time": round(duration, 2),
            "in": in_tokens,
            "out": out_tokens
        }
    else:
        return {"error": response.text}

def run_gemini(model_id, prompt):
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel(model_id)
    
    start_time = time.time()
    response = model.generate_content(prompt)
    end_time = time.time()
    
    # Gemini token counting
    tokens = model.count_tokens(prompt)
    in_tokens = tokens.total_tokens
    
    # Estimate out tokens (character based heuristic if usage not available)
    content = response.text
    out_tokens = len(content.split()) * 1.3 # Rough estimation
    
    duration = end_time - start_time
    tps = out_tokens / duration if duration > 0 else 0
    
    return {
        "content": content,
        "tps": round(tps, 2),
        "time": round(duration, 2),
        "in": in_tokens,
        "out": int(out_tokens)
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python cloud_bench.py <provider: thaillm|gemini> <model_id> <prompt>")
        sys.exit(1)
        
    provider = sys.argv[1]
    model_id = sys.argv[2]
    prompt = sys.argv[3]
    
    if provider == "thaillm":
        res = run_thaillm(model_id, prompt)
    elif provider == "gemini":
        res = run_gemini(model_id, prompt)
    else:
        print("Invalid provider")
        sys.exit(1)
        
    print(json.dumps(res, indent=2, ensure_ascii=False))
