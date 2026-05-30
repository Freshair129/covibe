import requests
import json

def print_sensors(node, indent=0):
    text = node.get("Text", "Unknown")
    sensor_type = node.get("SensorType", "Node")
    value = node.get("Value", "")
    print("  " * indent + f"- {text} [{sensor_type}] : {value}")
    
    for child in node.get("Children", []):
        print_sensors(child, indent + 1)

try:
    r = requests.get("http://localhost:8085/data.json", timeout=2)
    if r.status_code == 200:
        print_sensors(r.json())
    else:
        print(f"Error: Status code {r.status_code}")
except Exception as e:
    print(f"Connection failed: {e}")
