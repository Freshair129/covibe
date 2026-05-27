import json

data = {
    "temp": [],
    "vram": [],
    "fan": [],
    "power": [],
    "cpu": [[] for _ in range(12)],
    "ram": []
}

with open("latest_hw_log.csv", "r", encoding="utf-16") as f:
    for line in f:
        if line.startswith("80,"):
            parts = [p.strip() for p in line.split(",")]
            try:
                data["temp"].append(float(parts[2]))
                data["vram"].append(float(parts[7]) / 1024) # MB to GB
                data["power"].append(float(parts[11]))
                data["fan"].append(float(parts[12]))
                # CPU1-12 usage starts from column 33 (index 32)
                for i in range(12):
                    data["cpu"][i].append(float(parts[32+i]))
                data["ram"].append(float(parts[59]) / 1024) # MB to GB
            except:
                continue

# Take last 20 points
result = {k: v[-20:] if k != "cpu" else [core[-20:] for core in v] for k, v in data.items()}
print(json.dumps(result))
