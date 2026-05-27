# CoVibe AI Developer Agent Guide (GEMINI.md)

ยินดีต้อนรับสู่คู่มือสถาปัตยกรรมและการพัฒนา CoVibe สำหรับ AI Developer Agent คู่มือนี้จัดทำขึ้นโดยทีมวิศวกรอาวุโสเพื่อให้ Agent เข้าใจภาพรวมระบบ โครงสร้างไฟล์ และขั้นตอนการพัฒนาอย่างถูกต้อง แม่นยำ และปลอดภัย

---

## 1. ภาพรวมระบบ (System Overview)

**CoVibe** คือ PWA (Progressive Web Application) สำหรับฟังเพลงพร้อมกันแบบเรียลไทม์ระหว่างคนขับมอเตอร์ไซค์ (Rider) และคนซ้อนท้าย (Passenger) โดยมีสถาปัตยกรรมแบบ **Cloud Sync** ผ่าน WebSocket Server และการควบคุมเครื่องเล่น YouTube IFrame API

### Key Components

1. **Client (React + Vite PWA)**: ส่วนติดต่อผู้ใช้แบบ Mobile-First ที่ออกแบบมาสำหรับการใช้งานขณะสวมหมวกกันน็อก มี Rider Mode ปุ่มขนาดใหญ่ OLED Saver และระบบจัดการคิวเพลง
2. **Server (Node.js + WebSockets)**: เซิร์ฟเวอร์ขนาดเล็กสำหรับเก็บ Trip Room State ในหน่วยความจำ, ทำหน้าที่ Broadcast คำสั่งเครื่องเล่น (Play / Pause / Seek / Queue) และส่งผ่านสัญญาณเสียง (WebRTC Signaling)
3. **MSP Telemetry**: ระบบความร่วมมือในการวัดผลประสิทธิภาพและต้นทุน LLM Agent (Memory & Soul Passport) โดยจะดึงข้อมูล Daily Usage Buckets มาคำนวณและแสดงผลบน Telemetry Dashboard ในหน้ารูทแมป

---

## 2. โครงสร้างไฟล์สำคัญ (Key Repository Structure)

```text
g:/covibe/
├── src/
│   ├── main.tsx             # จุดเริ่มต้นแอปพลิเคชัน React
│   ├── App.tsx              # Logic การทำงานหลักของ Client (WebSocket, YT IFrame, UI)
│   └── styles.css           # ดีไซน์ระบบ (CSS variables, animations, responsive)
├── server/
│   └── index.js             # WebSocket Server (Room State, Spawning Agents, Telemetry endpoint)
├── docs/
│   └── compatibility_report.md  # รายงานสรุปผลทดสอบ Browser Compatibility บน iOS/Android
├── covibe_roadmap.html      # หน้าแสดงแผนการพัฒนา & Telemetry Dashboard ของ CoVibe
├── package.json             # รายการ Dependencies และ Scripts ของโปรเจกต์
├── GEMINI.md                # คู่มือฉบับนี้ (Project Guide)
└── README.md                # แนะนำการใช้งานทั่วไปเบื้องต้น
```

---

## 3. สภาพแวดล้อมและการรันระบบ (Environments & Dev Commands)

- **รันฝั่ง Client + Server แบบ Live Development**:

  ```bash
  npm run dev
  ```

  *(จะรันทั้ง Vite client บนพอร์ต `5173` และ WebSocket server บนพอร์ต `8787` ไปพร้อมกัน)*

- **ตรวจสอบการทำงานของ Backend Telemetry**:

  ```bash
  curl http://localhost:8787/health
  ```

---

## 4. ข้อจำกัดและประเด็นทางเทคนิคที่ควรระวัง (Critical Guidelines)

1. **YouTube Autoplay บนอุปกรณ์เคลื่อนที่**:
   - iOS Safari และ Android Chrome ห้ามการเล่นวิดีโอแบบออโตเพลย์ (Autoplay) ที่มีเสียงเด็ดขาด
   - ผู้เล่นต้องกดคลิกปุ่มแอปพลิเคชันในปฏิสัมพันธ์แรก (First Interaction) ก่อนเสมอ เพื่อปลดล็อก YouTube IFrame SDK ให้สามารถรับคำสั่งซิงค์ผ่าน WebSocket ต่อไปได้
2. **Background Playback**:
   - เมื่อปิดหน้าจอหรือสลับแอปไปทำอย่างอื่น YouTube IFrame มักจะหยุดทำงานชั่วคราว
   - มีการแก้ไขด้วยการใช้ **OLED Saver Mode** (ซ่อนทุกเลเยอร์เพื่อประหยัดแบตเตอรี่ แต่เปิดหน้าเว็บไว้ตลอดเวลา) แทนการปิดหน้าจอมือถือจริง
3. **การซิงค์ระดับสูง (Drift Correction)**:
   - ต่ำกว่า `250ms`: ปล่อยผ่านเพื่อให้ได้ความไหลลื่น
   - ระหว่าง `250ms - 800ms`: ปรับลด/เพิ่มความเร็วการเล่น (Playback Rate) 0.95x หรือ 1.05x เพื่อปรับความตึงแบบไร้รอยต่อ

---

## 5. มาตรฐานความปลอดภัย AI Infrastructure (AI Safety Standards)

**MANDATORY READING:** ก่อนดำเนินการใดๆ ที่เกี่ยวข้องกับ Benchmark คุณต้องอ่านและปฏิบัติตามเอกสาร [CoVibe Enterprise AI Benchmark Standard (EABS-01)](./benchmark/CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md) อย่างเคร่งครัด

1.  **TDR Guard (Thermal & Power Management):**
    - **RTX 3060 Standard:** ต้อง Underclock -104MHz และ Power Limit 90% เสมอ
    - **Thermal Rule:** หาก GPU Temp แตะ 71°C หรือ Power Draw เกิน 150W ต้องหยุดพักเครื่อง 2 นาที
    - **Log Source:** อ้างอิงข้อมูลจาก `D:\hw_log\HardwareMonitoring.hml` (MSI Afterburner)
2.  **Software Pipeline Hardening:**
    - **UTF-8 Force:** สคริปต์ต้องบังคับ encoding="utf-8" เพื่อป้องกัน Emoji Crash บน Windows (CP1252 fix)
    - **Loop Guard:** ตั้งค่า `num_predict` (2000-2500) และ Stop Tokens (`### END`) เสมอ
    - **Reasoning Strip:** สำหรับโมเดล RL ต้องตัดแท็ก `<think>...</think>` ออกก่อนแสดงผลใน Dashboard

---

## 6. ระบบปฏิทินความร้อนกิจกรรม (Activity Heatmap Indicators)

ระบบปฏิทินแสดงความถี่การใช้งาน LLM หรือกิจกรรมการพัฒนาโค้ดย้อนหลัง 63 วัน (9 สัปดาห์) โดยคำนวณสเกลความหนาแน่น (Color Intensity Scale) จากค่าสูงสุดของช่วงเวลาจริง:
- **ตัวเลือกวัดผล (Metrics)**: สลับการแสดงผลผ่าน Toggle ระหว่าง Cost (USD), LLM Calls และ Coding Activity
- **ระดับความเข้มของช่อง (Color Levels)**:
  - ⬜ **Level 0**: ไม่มีการใช้งาน
  - 🟪 **Level 4**: มีการใช้งานสูงมาก (สูงกว่า 75% ของวันสูงสุด)
- **การจัดประเภทกิจกรรม Coding Activity**: สแกน Git Commit เพื่อจำแนกประเภท Create, Fix, Update, Delete, Move อัตโนมัติ
