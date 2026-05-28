# Benchmark Specification: Coding Standard Baselines

**Reference ID:** BENCH-CSB-01
**Version:** 1.0
**Target Models:** All Coding Models (Roster)
**Standard:** EABS-01

---

## 🎯 Test Objective
ประเมินความสามารถในการเขียนโปรแกรมแบบครอบคลุม (End-to-End Coding) ตั้งแต่ Utility พื้นฐาน, Algorithm, Domain Logic ไปจนถึงการแก้ปัญหาเชิงสถาปัตยกรรมและ Incident Debugging

## 📦 Test Assembly (Testkit)

### 1. Task Assignment
- **L1 (Base):** `tasks/L1_BASE/utility_deep_merge.txt`
- **L2 (Logic):** `tasks/L2_LOGIC/algorithm_priority_queue.txt`
- **L3 (Domain):** `tasks/L3_DOMAIN/covibe_yt_sync_logic.txt`
- **L4 (Stress):** `tasks/L4_STRESS/refactor_large_component.txt`
- **L5 (Incidents):** `tasks/L5_INCIDENTS/debug_async_race_condition.txt`

### 2. Context Ammunition (Payloads)
- **Standard Run (L1-L3):** 8,192 Tokens (`payloads/payload_8k.txt`)
- **Stress Run (L4):** 32,768 Tokens (`payloads/payload_32k.txt`)
- **Debug Run (L5):** 16,384 Tokens (`payloads/payload_16k.txt`)

---

## 🛠️ Execution Instruction
1. ใช้ `scripts/great_orchestrator.py` ในการรันชุดทดสอบนี้
2. ตั้งค่า `num_predict: 2500` และ `stop: ["### END", "```\n\n"]` ตามมาตรฐานความปลอดภัย
3. บันทึกผลลัพธ์ลงในโครงสร้าง `benchmark/<model_id>/CSB-01/<level>/`

---

## ✅ Expected Result
- **Syntax:** Code ต้องผ่าน Lint และไม่มี Syntax Error
- **Logic:**
  - L2: ต้องใช้ Min-Heap (ไม่ใช้ .sort() ทุกครั้งที่ enqueue)
  - L3: ต้องมีช่วง 250ms และ 800ms ตามที่กำหนดใน GEMINI.md
  - L5: ต้องระบุ Root Cause ของ Race Condition ได้ชัดเจน
- **Performance:** 9B models ควรมียอด TPS เฉลี่ยไม่ต่ำกว่า 35 t/s บน RTX 3060

**SPEC END.**
