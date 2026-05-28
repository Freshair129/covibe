# Proposal: CSB-01 Automated Code Verification Suite

## [ROOT CAUSE / RATIONALE]
การวัดผลโมเดลสาย Coding ด้วยค่า TPS (Tokens Per Second) เพียงอย่างเดียวไม่เพียงพอ การมี Unit Test เพื่อตรวจสอบความถูกต้องของ Logic ที่โมเดลสร้างขึ้น (Functional Correctness) เป็นสิ่งจำเป็นเพื่อให้คะแนนในระดับ Enterprise (EABS-01) มีความน่าเชื่อถือ

## 🎯 Test Objective
สร้างระบบตรวจสอบอัตโนมัติที่สามารถดึงโค้ดจากไฟล์ผลลัพธ์ (`response.txt`) มาทดสอบกับ Unit Test มาตรฐานที่เตรียมไว้ (Vitest) และบันทึกคะแนนลงใน `metrics.json`

---

## 🛠️ Verification Workflow

1.  **Extraction:** ใช้ Regex ดึงโค้ดชุดแรกที่อยู่ใน Markdown Code Block (```typescript / ```javascript)
2.  **Sandbox Execution:** 
    *   บันทึกโค้ดลงในไฟล์ชั่วคราว `benchmark/tmp/solution.ts`
    *   สร้างไฟล์ Runner `benchmark/tmp/runner.test.ts` ที่ Import ทั้ง Solution และ Verify Suite เข้าด้วยกัน
3.  **Testing:** รันคำสั่ง `npx vitest run benchmark/tmp/runner.test.ts --reporter=json`
4.  **Reporting:** 
    *   อ่านผลลัพธ์จาก Vitest JSON output
    *   อัปเดตฟิลด์ `quality.passed` และ `quality.score` (จำนวนที่ผ่าน / จำนวนเทสต์ทั้งหมด) ใน `metrics.json` ของโมเดลนั้นๆ

---

## ✅ Implementation Plan
1. สร้างสคริปต์ `scripts/verify_csb_01.py` ตาม Logic ด้านบน
2. รองรับการรันแบบทีละโมเดล หรือรันยกชุด (Batch)
3. เก็บผลลัพธ์แยกตาม `level` (L1, L2, L3 เป็นลำดับแรก)

---
Please review and approve this verification plan. I will implement the script once approved.
