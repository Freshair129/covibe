# **CoVibe Enterprise AI Benchmark Standard (EABS-01)**

## **Complete Document Lifecycle Suite: Pre-Test to Post-Test**

เอกสารชุดนี้เป็นโครงสร้างมาตรฐาน (Blueprint) สำหรับการทดสอบประสิทธิภาพระบบ AI/LLM ภายในโครงการ CoVibe AI Infrastructure โดยแบ่งออกเป็น 3 ระยะสำคัญ:

1. **PRE-TEST (ระยะเตรียมการ):** เอกสารแผนการทดสอบและสเปกขั้นต้น  
2. **ACTIVE-TEST (ระยะรันการทดสอบ):** บันทึกขั้นตอนหน้างานและผลการตรวจสอบสถิติแบบ Real-time  
3. **POST-TEST (ระยะสรุปผล):** รายงานทางเทคนิคเชิงลึก (RCA) และใบประเมินความพร้อมสู่ระบบ Production

## **\[DOCUMENT 1: PRE-TEST\]**

### **AI Benchmark Design & Test Plan (BD-TP)**

**ID:** EABS-01-PLAN-\[PROJECT\_NAME\]-\[DATE\]

**Version:** 1.0

**Status:** \[Draft / Approved\]

#### **1\. Purpose & Scope (วัตถุประสงค์และขอบเขต)**

* **Objective:** \[ระบุวัตถุประสงค์ เช่น เพื่อทดสอบประสิทธิภาพของโมเดล Qwen 3 (9B) ในการรองรับภาระงานประมวลผลโค้ดระดับสถาปัตยกรรม\]  
* **Target Model:** \[ระบุชื่อโมเดลและชนิด เช่น Qwen-3-9B-Instruct (GGUF Q4\_K\_M)\]  
* **Success Criteria:** \[ระบุเกณฑ์การทดสอบที่ถือว่าสอบผ่าน เช่น Decode TPS \> 12 t/s, TTFT \< 200 ms และไม่มี OOM Error ระหว่างรอบการรัน\]

#### **2\. Hardware & Environment Baselines (ข้อมูลระบบและสภาพแวดล้อมตั้งต้น)**

* **Host OS:** \[เช่น Windows 11 Pro 23H2 / Linux Ubuntu 22.04 LTS\]  
* **GPU:** \[เช่น NVIDIA RTX 3060 12GB GDDR6\]  
* **Driver & CUDA Version:** \[เช่น NVIDIA Driver 596.49 / CUDA 12.4\]  
* **Inference Engine:** \[เช่น Ollama v0.24.0 / vLLM v0.4.2\]  
* **Hardware Tuning Spec:**  
  * Core Clock Lock: \[เช่น \-104MHz\]  
  * Power Limit: \[เช่น 90% (153W)\]  
  * Target Temperature Limit: \[เช่น 80°C\]

#### **3\. Test Workload & Scenarios (สถานการณ์และภาระงานที่ใช้ทดสอบ)**

กำหนดระดับภาระงาน (Task Levels) เพื่อทดสอบขีดจำกัดของระบบ:
```
| Level | Task ID | Description / Use Case | Est. Input (Tokens) | Est. Output (Tokens) |
| :---- | :---- | :---- | :---- | :---- |
| **L1 (Base)** | \[e.g., L1\_BASE\] | Simple logical reasoning or entity extraction | \[เช่น 300\] | \[เช่น 512\] |
| **L2 (Logic)** | \[e.g., L2\_LOGIC\] | Algorithm design, priority queue operations | \[เช่น 500\] | \[เช่น 1,000\] |
| **L3 (Domain)** | \[e.g., L3\_DOMAIN\] | Multi-file contextual analysis | \[เช่น 1,500\] | \[เช่น 1,000\] |
| **L4 (Stress)** | \[e.g., L4\_STRESS\] | Giant code refactoring (8K+ tokens) | \[เช่น 6,500\] | \[เช่น 2,000\] |
| **L5 (Cycles)** | \[e.g., L5\_STRESS\] | Rapid Load/Unload and model switching | N/A | N/A |
```

#### **4\. Telemetry & Log Configuration (การบันทึกข้อมูลและเซนเซอร์)**

* **Telemetry Tools:** \[เช่น NVML API, LibreHardwareMonitor (JSONL)\]  
* **Sampling Interval:** \[เช่น 1 วินาทีต่อ 1 Record โดยจะนำไป Decimate เหลือ 1/30 สำหรับ UI\]  
* **Metric of Interest:**  
  * Primary: TTFT (ms), Prefill TPS, Decode TPS, VRAM Utilization (MB)  
  * Secondary: GPU Temp (°C), GPU Power Draw (W), Residual VRAM Post-Unload

## **\[DOCUMENT 2: ACTIVE-TEST\]**

### **Benchmark Execution Runbook & Verification Sheet (ER-VFS)**

**ID:** EABS-01-RUN-\[RUN\_NUMBER\]-\[DATE\]

**Executor:** \[ชื่อผู้ทดสอบ/Agent\]

**Run Timestamp Start:** \[YYYY-MM-DD HH:MM:SS\]

#### **1\. Pre-Run Pre-flight Checks (ขั้นตอนตรวจสอบก่อนเริ่มรันจริง)**

* \[ \] ตรวจสอบอุณหภูมิ GPU ตอน Idle (ไม่ควรเกิน 45°C)  
* \[ \] บันทึกค่า Baseline VRAM ก่อนเปิด Service: \[ค่าที่วัดได้\] MB  
* \[ \] ตรวจสอบการจำกัด Clock และ Power Limit ของ GPU ผ่าน command line หรือ MSI Afterburner  
* \[ \] ทดสอบสคริปต์ Telemetry Logging: python scripts/check\_telemetry\_v2.py  
* \[ \] ล้างหน่วยความจำและปิดโปรแกรมส่วนเกินเพื่อไม่ให้กวนผลการรัน

#### **2\. Run Logs & Dynamic Telemetry Records (บันทึกระหว่างดำเนินการทดสอบ)**

##### **A. Warm-up Phase (ขั้นทดสอบรอบอุ่นเครื่อง)**

* Model Loaded: \[โมเดลที่ใช้\]  
* Warm-up Inference Status: \[Success / Failed\]  
* Warm-up Latency: \[ค่าที่วัดได้\] ms

##### **B. Actual Run Tracker (ตารางการรันจริง)**

*ผู้รันต้องกรอกข้อมูลจริงทันทีที่แต่ละรอบเสร็จสิ้น*

| Test ID | Loop \# | Run Status (Pass/OOM) | Observed Max Temp (°C) | Peek VRAM (MB) | Response Time (s) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| L1\_BASE | 1 | \[ \] |  |  |  |
| L2\_LOGIC | 1 | \[ \] |  |  |  |
| L3\_DOMAIN | 1 | \[ \] |  |  |  |
| L4\_STRESS | 1 | \[ \] |  |  |  |

##### **C. L5 Rapid Cycle Test Log (กรณีทดสอบขีดจำกัดหน่วยความจำ)**

บันทึกสภาพ VRAM หลังทำกระบวนการโหลด/ถอนโมเดลอย่างรวดเร็ว (Rapid Load/Unload)

| Cycle \# | Loaded Model | Post-Load VRAM (MB) | Unloaded Model | Residual VRAM (MB) |
| :---- | :---- | :---- | :---- | :---- |
| 1 | \[Model A\] |  | \[Model A\] |  |
| 2 | \[Model B\] |  | \[Model B\] |  |
| 3 | \[Model C\] |  | \[Model C\] |  |
| 4 | \[Model A\] |  | \[Model A\] |  |
| 5 | \[Model B\] |  | \[Model B\] |  |

* **มีเหตุการณ์ OOM เกิดขึ้นหรือไม่:** \[Yes / No\] (ระบุรอบและจุดที่เกิดหากเกิดปัญหา)  
* **ความผิดปกติที่ตรวจพบหน้างาน:** \[เช่น หลังจบรอบที่ 3 พบว่า Residual VRAM ไม่ยอมลดลงต่ำกว่า 7GB ส่งผลให้รอบที่ 4 มีความล่าช้าในการเริ่มต้นทำงาน\]

## **\[DOCUMENT 3: POST-TEST\]**

### **Technical Benchmark Report & RCA (TBR-RCA)**

*(หมายเหตุ: สามารถใช้โครงสร้างเดียวกับรายงาน SESSION\_20260530\_TECHNICAL\_REPORT.md ได้เลย)*

**ID:** EABS-01-REPORT-\[PROJECT\_NAME\]-\[DATE\]

**Author:** \[ชื่อผู้เขียนรายงาน/Senior Architect Agent\]

#### **1\. Executive Summary**

\[สรุปสาระสำคัญของผลการทดสอบเชิงบริหาร เช่น โมเดลผ่านการทดสอบหรือไม่ พบปัญหาคอขวดตรงจุดใด และผลกระทบต่อระบบโดยรวม\]

#### **2\. System Architecture & Methodology**

\[อธิบายสถาปัตยกรรมข้อมูล วิธีการคำนวณ Decimation ของสถิติ telemetry และเงื่อนไขการทดสอบ\]

#### **3\. Complete Empirical Results (ผลการทดสอบอย่างละเอียด)**

\[ตารางเปรียบเทียบผลลัพธ์ประสิทธิภาพจริง รวมถึง Token Distribution จากการวิเคราะห์ Log ย้อนหลัง\]

#### **4\. Root Cause Analysis (RCA) \- สำหรับเคสที่ระบบล้มเหลวหรือหน่วงผิดปกติ**

* **Problem Statement:** \[เช่น เกิด OOM เมื่อทำการสลับใช้งานโมเดลสลับกันไปมาในระดับ L5\]  
* **5 Whys Analysis:**  
  1. ทำไมระบบถึงขึ้น OOM? \-\> *เพราะ VRAM บน GPU ไม่เพียงพอในการโหลดโมเดลตัวถัดไป*  
  2. ทำไม VRAM ถึงไม่พอในเมื่อโมเดลก่อนหน้าสั่ง Unload ไปแล้ว? \-\> *เพราะยังมีหน่วยความจำตกค้าง (Residual VRAM) สูงถึง 7.6GB*  
  3. ทำไมถึงมีหน่วยความจำตกค้างสูงขนาดนั้น? \-\> *เพราะ Windows Display Driver Model (WDDM) และ Ollama Service ไม่สั่งคืนหน่วยความจำ (Compact) ในทันที*  
  4. \[เติมคำตอบถัดไปตามบริบทระบบ\]  
* **Proven Mitigation Plan:** \[ระบุแผนการแก้ไขปัญหาในระบบจริง เช่น การเพิ่มคำสั่ง force\_restart\_ollama() หรือการกำหนด VRAM Context Padding ป้องกันไว้ 1GB\]

## **\[DOCUMENT 4: POST-TEST\]**

### **Production Readiness & Sign-Off Sheet (PR-SO)**

**ID:** EABS-01-SIGNOFF-\[PROJECT\_NAME\]-\[DATE\]

**Review Board:** \[รายชื่อวิศวกรผู้ประเมินและสถาปนิกโครงสร้างระบบ\]

#### **1\. Performance Checklist against KPIs (ตารางตรวจสอบเทียบกับเกณฑ์มาตรฐาน)**

| Standard Metrics (EABS-01) | Target Threshold (เกณฑ์ขั้นต่ำ) | Actual Score (ผลสอบเฉลี่ย) | Evaluation (ผ่าน/ไม่ผ่าน) |
| :---- | :---- | :---- | :---- |
| **First Token Latency (TTFT)** | \< 250 ms | \[ใส่ค่าจริง\] | \[ \] Pass \[ \] Fail |
| **Generation Rate (Decode)** | \> 12.0 tokens/sec | \[ใส่ค่าจริง\] | \[ \] Pass \[ \] Fail |
| **VRAM Margin Room** | \> 1,024 MB (During L4) | \[ใส่ค่าจริง\] | \[ \] Pass \[ \] Fail |
| **Error Rate (OOM/Crash)** | 0.00% (Over 20 cycles) | \[ใส่ค่าจริง\] | \[ \] Pass \[ \] Fail |

#### **2\. Risk Assessment & Safe-Guards (การวิเคราะห์ความเสี่ยงและการป้องกัน)**

* **Risk Detected:** \[เช่น ความไม่แน่นอนของ Windows WDDM ในการคืน VRAM (Fragmentation)\]  
* **Production Safeguard Implementation:**  
  * \[ \] ได้ทำการฝังฟังก์ชัน Garbage Collection อัตโนมัติใน Orchestrator หรือยัง?  
  * \[ \] มีการสร้าง Watchdog Service สำหรับคอย Monitor และรีสตาร์ต Inference Engine เมื่อเจอสัญญาณ VRAM รั่วไหลหรือยัง?  
  * \[ \] ระบบหน้าบ้าน (Dashboard) แสดงผลค่าทางกายภาพจริงของ GPU ได้ถูกต้องและลื่นไหลดีแล้วใช่หรือไม่?

#### **3\. Deployment Approval (คำรับรองความพร้อมและอนุญาตให้นำไปใช้งาน)**

จากการประเมินเชิงเทคนิคและเอกสารสรุปผลการทดสอบตามข้อกำหนด **EABS-01** คณะทำงานมีความเห็นชอบร่วมกันดังนี้:

* \[ \] **APPROVED (อนุมัติ):** ระบบมีความพร้อมในการผลักดันขึ้นสู่ระบบ Production เพื่อทำงานจริงร่วมกับ CoVibe Agent Framework  
* \[ \] **CONDITIONAL APPROVED (อนุมัติแบบมีเงื่อนไข):** นำไปใช้ได้ แต่ต้องมีการจำกัด Task L4 และห้ามใช้โมเดลสลับกันไปมาหากไม่มีการสั่ง Force Clear Cache ทุกๆ 2 ชั่วโมง  
* \[ \] **REJECTED (ปฏิเสธ):** ต้องส่งโมเดลหรือระบบกลับไปปรับแต่งฮาร์ดแวร์/ซอฟต์แวร์ใหม่ เนื่องจากไม่ผ่านเกณฑ์สำคัญด้าน \[ระบุหัวข้อที่ไม่ผ่าน\]

**ลงชื่อวิศวกรผู้อนุมัติโครงการ:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

(\[ชื่อ-นามสกุล\])

ตำแหน่ง: Senior AI Infrastructure Engineer / Lead Solution Architect

วันที่: YYYY-MM-DD