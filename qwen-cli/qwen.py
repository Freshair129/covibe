#!/usr/bin/env python3
"""
qwen - Local LLM CLI for Claude delegation via Ollama
Usage:
  qwen "your prompt here"
  echo file content | qwen
  qwen --model llama3.2:1b "write a unit test"
  qwen --code "generate prisma query"
"""

import sys
import argparse
import json
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen3:14b"

SYSTEM_PROMPTS = {
    "code": "You are an expert software engineer. Output code only, no explanation unless asked. Be concise and precise.",
    "review": "You are a senior code reviewer. Be direct, identify issues, suggest improvements. Format as bullet points.",
    "test": "You are a testing expert. Write comprehensive tests. Use the same framework as the existing code.",
    "doc": "You are a technical writer. Write clear, concise documentation in markdown.",
    "default": "You are a helpful coding assistant. Be concise and direct."
}

def query_ollama(prompt, model, system, temperature, stream, num_ctx, show_stats):
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "options": {
            "temperature": temperature,
            "num_ctx": num_ctx
        },
        "stream": stream
    }
    try:
        final_stats = {}
        if stream:
            with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=120) as r:
                r.raise_for_status()
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line)
                        print(chunk.get("response", ""), end="", flush=True)
                        if chunk.get("done"):
                            final_stats = chunk
                            print()
                            break
        else:
            r = requests.post(OLLAMA_URL, json=payload, timeout=120)
            r.raise_for_status()
            final_stats = r.json()
            print(final_stats["response"], flush=True)

        if show_stats and final_stats.get("done"):
            # Durations are in nanoseconds
            total_duration = final_stats.get("total_duration", 0) / 1e9
            load_duration = final_stats.get("load_duration", 0) / 1e9
            prompt_eval_count = final_stats.get("prompt_eval_count", 0)
            prompt_eval_duration = final_stats.get("prompt_eval_duration", 0) / 1e9
            eval_count = final_stats.get("eval_count", 0)
            eval_duration = final_stats.get("eval_duration", 0) / 1e9

            tps = eval_count / eval_duration if eval_duration > 0 else 0
            prompt_tps = prompt_eval_count / prompt_eval_duration if prompt_eval_duration > 0 else 0

            print("\n" + "="*40, file=sys.stderr)
            print("📊 PERFORMANCE METRICS", file=sys.stderr)
            print("="*40, file=sys.stderr)
            print(f"Context Window:  {num_ctx} tokens", file=sys.stderr)
            print(f"Input Tokens:    {prompt_eval_count} t", file=sys.stderr)
            print(f"Output Tokens:   {eval_count} t", file=sys.stderr)
            print(f"Input Speed:     {prompt_tps:.2f} t/s", file=sys.stderr)
            print(f"Output Speed:    {tps:.2f} t/s", file=sys.stderr)
            print(f"Total Time:      {total_duration:.2f}s (Load: {load_duration:.2f}s)", file=sys.stderr)
            print("="*40, file=sys.stderr)

    except requests.exceptions.ConnectionError:
        print("ERROR: Ollama not running. Start with: ollama serve", file=sys.stderr, flush=True)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr, flush=True)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Local LLM CLI - delegates to Ollama")
    parser.add_argument("prompt", nargs="*", help="Prompt text")
    parser.add_argument("--model", "-m", default=DEFAULT_MODEL)
    parser.add_argument("--temp", "-t", type=float, default=0.1)
    parser.add_argument("--code", "-c", action="store_true")
    parser.add_argument("--review", "-r", action="store_true")
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--doc", "-d", action="store_true")
    parser.add_argument("--no-stream", action="store_true")
    parser.add_argument("--system", "-s")
    parser.add_argument("--list", "-l", action="store_true")
    parser.add_argument("--context", "-ctx", type=int, default=8192, help="Context window size (default: 8192)")
    parser.add_argument("--stats", action="store_true", default=True, help="Show performance metrics (default: True)")
    parser.add_argument("--no-stats", action="store_false", dest="stats", help="Hide performance metrics")
    args = parser.parse_args()

    if args.list:
        try:
            r = requests.get("http://localhost:11434/api/tags", timeout=5)
            for m in r.json().get("models", []):
                print(f"  {m['name']:<40} {m.get('size',0)/1e9:.1f} GB")
        except Exception:
            print("ERROR: Cannot connect to Ollama", file=sys.stderr)
        return

    prompt_parts = []

    if args.prompt:
        prompt_parts.append(" ".join(args.prompt))
    else:
        # Check if something is being piped
        if not sys.stdin.isatty():
            stdin_content = sys.stdin.read().strip()
            if stdin_content:
                prompt_parts.append(stdin_content)

    if not prompt_parts:
        parser.print_help()
        sys.exit(1)

    prompt = "\n\n".join(prompt_parts)

    if args.system:
        system = args.system
    elif args.code:
        system = SYSTEM_PROMPTS["code"]
    elif args.review:
        system = SYSTEM_PROMPTS["review"]
    elif args.test:
        system = SYSTEM_PROMPTS["test"]
    elif args.doc:
        system = SYSTEM_PROMPTS["doc"]
    else:
        system = SYSTEM_PROMPTS["default"]

    query_ollama(prompt=prompt, model=args.model, system=system,
                 temperature=args.temp, stream=not args.no_stream,
                 num_ctx=args.context, show_stats=args.stats)

if __name__ == "__main__":
    main()
