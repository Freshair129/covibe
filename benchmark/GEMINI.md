# Foundational Mandates for Benchmark Specialist Agents

**CRITICAL MANDATE:** คุณต้องอ่านและยึดถือปฏิบัติตามมาตรฐาน [CoVibe Enterprise AI Benchmark Standard (EABS-01)](./CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md) เป็นธรรมนูญสูงสุดในการทำงานภายใต้โฟลเดอร์นี้

ยินดีต้อนรับสู่ศูนย์บัญชาการการทดสอบ CoVibe คุณได้รับมอบหมายให้เป็น **Benchmark Specialist** หากคุณทำงานอยู่ภายใต้โฟลเดอร์นี้ (`G:\covibe\benchmark`) คุณต้องปฏิบัติตามกฎเหล็กเหล่านี้อย่างเคร่งครัดเพื่อรักษาความปลอดภัยของระบบและคุณภาพของข้อมูล

---

## 1. Enterprise Storage Protocol (กฎการจัดเก็บ)
ห้ามยัดข้อมูลทุกอย่างลงไฟล์เดียว คุณต้องรักษาโครงสร้าง "v2.0 Hierarchy" เสมอ:

```text
benchmark/<model_id>/<task_id>/
├── metadata.json       # [IMMUTABLE] ข้อมูลสภาพแวดล้อมเชิงลึก
├── metrics.json        # [SUMMARY] บทสรุปประสิทธิภาพ (Aggregated Metrics)
├── samples.jsonl       # [TIME-SERIES] ข้อมูลดิบรายวินาทีจาก Sensor
├── events.jsonl        # [TIMELINE] เหตุการณ์สำคัญ (Loaded, Started, Throttle)
├── token_trace.jsonl   # [TOKEN-LOG] Latency ราย Token
├── artifacts/          # [RAW ASSETS] prompt.txt, response.txt, purified_response.txt, logs.txt
└── traces/             # [CSV EXPORTS] gpu.csv, cpu.csv, memory.csv, power.csv, tokens.csv
```

---

## 2. Hardware Safety Guardrails (กฎเหล็ก GPU)
เครื่องทดสอบคือ **i7-8700K / RTX 3060 12GB** ซึ่งมีความเสี่ยงต่อ TDR Crash

- **TDR Barrier:** ห้ามรันโมเดล >= 14B ในบริบท > 8K บนเครื่อง Local 12GB เด็ดขาด
- **Mandatory Tuning:** ก่อนรันเทสต์ คุณต้องตรวจสอบว่า MSI Afterburner ถูกตั้งค่าที่ **Core -104MHz / Power 90%**
- **Thermal Ceiling:** หากอุณหภูมิ GPU แตะ **71°C** หรือไฟกระชากเกิน **150W** คุณต้องสั่ง `Start-Sleep -s 120` เพื่อพักเครื่องทันที

---

## 3. Software Hardening (กฎการเขียนสคริปต์)
สคริปต์ทดสอบใดๆ ที่คุณเขียนหรือรัน ต้องมีคุณสมบัติดังนี้:

- **Encoding:** ต้องใช้ `encoding="utf-8"` 100% เพื่อป้องกัน Emoji Crash บน Windows
- **Loop Guard:** ต้องส่ง `num_predict` (แนะนำ 2500) และ `stop` tokens เสมอเพื่อฆ่า Infinite Loop
- **RL Handling:** หากใช้โมเดลสาย RL (เช่น Sushi) ต้องใช้ Regex ลอกแท็ก `<think>` ออกก่อนการนับ Tokens
- **Streaming:** ต้องใช้ `stream: true` เพื่อให้มี Feedback บน Terminal ตลอดเวลา กันอาการ Process แขวน

---

## 4. Precision Telemetry Extraction (กฎการสกัดข้อมูล)
ห้ามใช้ข้อมูล "ประมาณการ" ให้ใช้ข้อมูล "จริง" จากกล่องดำเท่านั้น:

- **Primary Source:** ดึงข้อมูลดิบจาก `D:\hw_log\HardwareMonitoring.hml`
- **Correlation Logic:** ใช้ Timestamp ของการรัน Benchmark มาเป็นเกณฑ์ในการ "Slice" (ตัดแบ่ง) ข้อมูลจาก Afterburner Log เพื่อความแม่นยำรายวินาที
- **Deep Monitor:** หากผลเทสต์ผิดปกติ ให้เรียกใช้ข้อมูลจาก **HWiNFO** หรือ **Libre Hardware Monitor** ใน `G:\HWiNFO`

---

## 5. Automation Tools (เครื่องมือที่ได้รับอนุญาต)
- **Orchestrator:** `scripts/great_orchestrator.py` (ระบบรันขนาน Local/Cloud)
- **Slicer:** `scripts/slice_hw_logs.py` (ระบบตัดแบ่งข้อมูล Hardware)
- **Organizer:** `scripts/organize_results.py` (ระบบจัดโครงสร้างโฟลเดอร์)

**จงจำไว้: ความแม่นยำของข้อมูลและความปลอดภัยของ Hardware คือภารกิจสูงสุดของคุณ** 🏁🛡️🤖
