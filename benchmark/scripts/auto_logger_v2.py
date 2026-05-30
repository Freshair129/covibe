import os
import json
import time
import datetime
import sys
import threading
import requests
from pynvml import *

# SOP 3.2: High-Fidelity Automated Telemetry Logger (JSONL + HTTP API)
# Boundary: Data Collection Only. Responsibility: Fetch & Log.
# Contract: JSONL stream with fixed keys for Dashboard consumer.

class TelemetryLogger:
    def __init__(self, output_file, lhm_url="http://localhost:8085/data.json"):
        self.output_file = output_file
        self.lhm_url = lhm_url
        self.stop_event = threading.Event()
        self.gpu_handle = None
        
        # Initialize NVML
        try:
            nvmlInit()
            self.gpu_handle = nvmlDeviceGetHandleByIndex(0)
            print(f"📡 [NVML] Connected to {nvmlDeviceGetName(self.gpu_handle)}")
        except Exception as e:
            print(f"⚠️ [NVML] Initialization failed: {e}")

    def get_gpu_data(self):
        if not self.gpu_handle: return {}
        try:
            util = nvmlDeviceGetUtilizationRates(self.gpu_handle)
            mem = nvmlDeviceGetMemoryInfo(self.gpu_handle)
            return {
                "gpu_temp": nvmlDeviceGetTemperature(self.gpu_handle, NVML_TEMPERATURE_GPU),
                "gpu_util": util.gpu,
                "gpu_mem_util": util.memory,
                "gpu_vram_mb": int(mem.used / 1024 / 1024),
                "gpu_power_w": round(nvmlDeviceGetPowerUsage(self.gpu_handle) / 1000.0, 2),
                "gpu_clock_mhz": nvmlDeviceGetClockInfo(self.gpu_handle, NVML_CLOCK_GRAPHICS),
                "gpu_throttle": nvmlDeviceGetCurrentClocksThrottleReasons(self.gpu_handle)
            }
        except:
            return {}

    def _parse_lhm_tree(self, node, data):
        """Recursively parses LHM JSON tree for high-fidelity metrics."""
        hw_id = node.get("HardwareId", "")
        text = node.get("Text", "")
        sensor_type = node.get("SensorType", "")
        value_str = node.get("Value", "0").split(" ")[0].replace(",", "")
        
        try:
            val = float(value_str)
        except:
            val = 0.0

        # High-Fidelity Mapping based on actual sensor tree
        if "/intelcpu/0" in hw_id or "Intel Core" in text:
            if sensor_type == "Voltage" and "CPU Core" == text: data["cpu_pkg_v"] = val
            elif sensor_type == "Power" and "CPU Package" == text: data["cpu_pkg_w"] = val
            elif sensor_type == "Temperature":
                if "CPU Package" == text: data["cpu_pkg_temp"] = val
                elif "Core Max" == text: data["cpu_core_max_temp"] = val
            elif sensor_type == "Clock":
                if "Bus Speed" == text: data["cpu_bus_mhz"] = val
                elif "CPU Core #" in text:
                    if "cpu_core_max_mhz" not in data or val > data["cpu_core_max_mhz"]:
                        data["cpu_core_max_mhz"] = val
            elif sensor_type == "Load" and "CPU Total" == text: data["cpu_util"] = val

        elif "/nvidiagpu/0" in hw_id or "NVIDIA GeForce" in text:
            if sensor_type == "Temperature":
                if "GPU Core" == text: data["gpu_temp"] = val
                elif "GPU Hot Spot" == text: data["gpu_hotspot_temp"] = val
            elif sensor_type == "Power" and "GPU Package" == text: data["gpu_power_w"] = val
            elif sensor_type == "Clock" and "GPU Core" == text: data["gpu_clock_mhz"] = val
            elif sensor_type == "Fan" and "GPU Fan 1" == text: data["gpu_fan_rpm"] = val
            elif sensor_type == "Load" and "GPU Core" == text: data["gpu_util"] = val
            elif sensor_type == "Data" and "GPU Memory Used" == text: data["gpu_vram_mb"] = val

        for child in node.get("Children", []):
            self._parse_lhm_tree(child, data)

    def get_cpu_data(self):
        data = {}
        try:
            r = requests.get(self.lhm_url, timeout=0.5)
            if r.status_code == 200:
                self._parse_lhm_tree(r.json(), data)
        except Exception as e:
            # Silent fallback, let consumer handle missing keys
            pass
        return data

    def start(self):
        self.thread = threading.Thread(target=self._loop)
        self.thread.start()

    def _loop(self):
        print(f"🚀 [LOGGER] Streaming JSONL to {self.output_file}")
        with open(self.output_file, 'w', encoding='utf-8') as f:
            while not self.stop_event.is_set():
                sample = {
                    "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    **self.get_gpu_data(),
                    **self.get_cpu_data()
                }
                f.write(json.dumps(sample) + "\n")
                f.flush()
                # Real-time stdout for orchestrator/dashboard
                print(f"DATA_STREAM: {json.dumps(sample)}", flush=True)
                time.sleep(1)

    def stop(self):
        self.stop_event.set()
        if hasattr(self, 'thread'):
            self.thread.join()
        try: nvmlShutdown()
        except: pass
        print("🛑 [LOGGER] Stopped.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_logger_v2.py <output_jsonl>")
        sys.exit(1)
    
    out = sys.argv[1]
    os.makedirs(os.path.dirname(out), exist_ok=True)
    
    logger = TelemetryLogger(out)
    logger.start()
    
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        logger.stop()
