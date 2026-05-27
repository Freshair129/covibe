# CoVibe Project Memory (MEMORY.md)

## 📌 Status: AI Infrastructure Optimized
This file tracks the low-level system state, hardware configurations, and storage optimizations for the CoVibe project.

---

## 💾 Storage & Model Linkage (Ollama Blobs)
- **Big Three (SSD - C:):** โมเดลหลักที่เน้น Performance เก็บไว้บน SSD โดยตรง
  - `sushirl:latest` (9B)
  - `qwen3:latest` (14B)
  - `hf.co/Jackrong/Qwopus3.5-9B-Coder-GGUF` (9B)
- **Long-term Storage (HDD - G:):** โมเดลรอง/คลังสำรอง เชื่อมต่อผ่าน Symbolic Links
  - **G:\.ollama_blobs_root:** เก็บ Chinda, Gemma4, Llama Config/Manifest layers
  - **G:\.ollama_blobs:** เก็บ Llama 3.2 (1B), Qwen 3.5 (4B), Nomic Embed
- **Enterprise Standard (EABS-01):** `G:\covibe\benchmark\CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md`
- **Linking Script:** อยู่ที่ `G:\covibe\fix_ollama_links.ps1.md` สำหรับกู้คืน Link กรณีข้อมูลหาย

---

## 🛡️ Hardened Pipeline Architecture
- **Great Orchestrator:** (`scripts/great_orchestrator.py`) 
  - รองรับการรัน Parallel (Local Sequential vs Cloud Async)
  - ระบบ **Streaming + Think-Tag Stripping** อัตโนมัติ
  - บังคับ **UTF-8** ทั่วระบบเพื่อกัน Emoji Crash
- **System Monitor v2.0:** (`scripts/system_monitor.ps1`)
  - บันทึก 18+ Metrics (Per-core CPU, Clock speed, Disk I/O)
  - ผูกข้อมูลเข้ากับ Dashboard v16.0 โดยตรง

---

## 📊 Hardware Logs (Source of Truth)
- **MSI Afterburner Logs:** `D:\hw_log\HardwareMonitoring.hml` (ไฟล์ดิบขนาดยักษ์)
- **Local Telemetry Cache:** `G:\covibe\full_system_telemetry.csv` (สกัดโดย System Monitor)
- **Parser Script:** `G:\covibe\parse_hml.py` (ใช้แปลงข้อมูลจาก HML เป็น JSON สำหรับ Dashboard)

---

## 🌡️ Hardware Profile (RTX 3060 12GB)
- **Core Clock:** -104 MHz
- **Power Limit:** 90% (Crucial for TDR Prevention)
- **Safe Zone:** < 65°C | **Danger Zone:** > 71°C
- **Average Load:** 152W Peak during L3 Reasoning.

---

## ☁️ External APIs
- **ThaiLLM:** `http://thaillm.or.th/api/v1/` (Models: Typhoon, Pathumma, Thalle, OpenThaiGPT)
- **Gemini:** Google AI SDK (Model: gemini-2.0-flash)
- **Keys:** stored in `G:\eva-cli\.env` (Referenced via Orchestrator)
