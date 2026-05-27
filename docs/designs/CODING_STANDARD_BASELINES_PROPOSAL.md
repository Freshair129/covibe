# Proposal: Coding Standard Baselines (CSB-01)

## [ROOT CAUSE / RATIONALE]
ในการทดสอบโมเดลสาย Coding จำเป็นต้องมีชุดโจทย์มาตรฐาน (Baselines) ที่ครอบคลุมตั้งแต่พื้นฐานไปจนถึงการแก้ปัญหาในระดับระบบ (System-level) เพื่อให้สามารถวัดผลประสิทธิภาพ (TPS), ความถูกต้องของ Logic และความสามารถในการเข้าใจบริบท (Context Awareness) ได้อย่างแม่นยำ ตามมาตรฐาน EABS-01

## 🎯 Test Objective
สร้างชุดโจทย์ที่ครอบคลุม 5 ระดับความยาก (L1-L5) เพื่อใช้เป็นเกณฑ์มาตรฐานในการประเมินโมเดล Coding ทุกตัวใน Roster

---

## 📦 Test Assembly (Testkit: Coding-Standard-Baselines)

### 1. Task Assignment (Proposed Tasks)

| Level | Task Name | Description | Target File |
| :--- | :--- | :--- | :--- |
| **L1 (Base)** | `utility_deep_merge.txt` | เขียนฟังก์ชัน Deep Merge สำหรับ Object ใน TypeScript | `tasks/L1_BASE/utility_deep_merge.txt` |
| **L2 (Logic)** | `algorithm_priority_queue.txt` | สร้าง Priority Queue data structure พร้อม Unit Tests | `tasks/L2_LOGIC/algorithm_priority_queue.txt` |
| **L3 (Domain)** | `covibe_yt_sync_logic.txt` | เขียน Logic การคำนวณ Drift Correction สำหรับ YouTube IFrame ตามเกณฑ์ CoVibe (250ms-800ms) | `tasks/L3_DOMAIN/covibe_yt_sync_logic.txt` |
| **L4 (Stress)** | `refactor_large_component.txt` | ปรับปรุง (Refactor) คอมโพเนนต์ React ขนาดใหญ่ที่มีปัญหาเรื่อง Performance ให้ใช้ Memoization และ Custom Hooks | `tasks/L4_STRESS/refactor_large_component.txt` |
| **L5 (Incident)** | `debug_async_race_condition.txt` | ค้นหาและแก้ไข Race Condition ในฟังก์ชัน async ที่จัดการ WebSocket events | `tasks/L5_INCIDENTS/debug_async_race_condition.txt` |

### 2. Context Ammunition (Payloads)
- **Primary:** 4K/8K (`payloads/payload_4k.txt`, `payload_8k.txt`)
- **Stress:** 32K/64K (`payloads/payload_32k.txt`, `payload_64k.txt`) สำหรับ L4

---

## 🛠️ Implementation Plan
1. สร้างไฟล์ Task ใหม่ในโฟลเดอร์ `benchmark/tasks/` ตามตารางข้างต้น
2. สร้างไฟล์ Specification `benchmark/benchmark-kits/Coding-Standard-Baselines/BENCHMARK--Coding-Standard-Baselines.md`
3. เตรียม Payloads สำหรับการทดสอบ (ถ้ายังไม่มี)

## ✅ Success Criteria
- โมเดลต้อง generate code ที่รันได้จริง (Syntactically correct)
- ในระดับ L3 ต้องอ้างอิงเกณฑ์ใน `GEMINI.md` ของโปรเจกต์ได้ถูกต้อง
- ผลลัพธ์ต้องถูกจัดเก็บตามโครงสร้าง "v2.0 Hierarchy"

---
Please review and approve this documentation. I will generate the tasks and specification files once approved.
