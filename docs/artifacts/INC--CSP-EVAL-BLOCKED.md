# Incident Report: INC-2026-001 — Content Security Policy Blocks 'eval' in JavaScript

## 1. ข้อมูลเบื้องต้น (Incident Metadata)
*   **Incident ID:** INC-2026-001
*   **หัวข้อ:** การบล็อกการใช้งาน `eval` โดย Content Security Policy (CSP) ในสภาพแวดล้อมระบบหลัก
*   **วันที่ตรวจพบ:** 24 พฤษภาคม 2026
*   **ระดับความรุนแรง (Severity):** สูง (High) - ส่งผลกระทบให้เครื่องมือพัฒนาท้องถิ่น (Vite HMR) และส่วนเชื่อมต่อหยุดทำงาน
*   **สถานะ:** แก้ไขเสร็จสิ้น (Resolved)

---

## 2. ลำดับเหตุการณ์ (Timeline)
1.  **[17:46]** มีการอัปเดตนโยบาย CSP โดยทำการลบ `'unsafe-eval'` ออกจาก [vercel.json](file:///g:/covibe/vercel.json) และ [server/index.js](file:///g:/covibe/server/index.js) เพื่อยกระดับความปลอดภัย (Security Hardening) เนื่องจากประเมินว่าตัวแอปพลิเคชันไม่มีคำสั่ง `eval`
2.  **[17:48]** ผู้ใช้งานพบข้อผิดพลาดบนหน้าเว็บ `http://localhost:8989/roadmap` โดยระบบเบราว์เซอร์แจ้งเตือนบล็อกการใช้ `eval` และแสดงลิงก์ข้อผิดพลาด `https://web.dev/articles/csp...#eval_too` ในส่วนของ Issues Tab
3.  **[17:49]** ทีมพัฒนาทำการกู้คืนระบบ (Rollback) โดยคืนค่าคำสั่ง `'unsafe-eval'` กลับเข้าสู่ระบบ CSP ของโปรเจกต์
4.  **[18:17]** พบว่าพอร์ตเซิร์ฟเวอร์ยังค้างอยู่เนื่องจากระบบเดิมไม่ได้ปิดการทำงานก่อนรันใหม่ จึงได้ทำการ Force Kill พอร์ต `8989` และ `8787` จากนั้นรันระบบใหม่เพื่อให้นโยบาย CSP ที่อัปเดตมีผลใช้งานจริง

---

## 3. การวิเคราะห์สาเหตุ (Root Cause Analysis - RCA)
*   **ปัญหาหลัก:** หลังจากลบคำสั่ง `'unsafe-eval'` ออกจากโครงสร้าง CSP ส่งผลให้เบราว์เซอร์ทำการแบนการเรียกใช้ฟังก์ชัน dynamic evaluation ทั้งหมดบนหน้าเว็บ
*   **สาเหตุเชิงลึก:**
    1.  **Vite HMR & Source Maps:** ในโหมดพัฒนา (Development Mode) เครื่องมือแปลงโค้ดอย่าง Vite และระบบ React จำเป็นต้องเรียกใช้ `eval()` ในการทำ Hot Module Replacement (HMR) และเชื่อมโยง Source maps เข้ากับเบราว์เซอร์เพื่อแสดงจุดผิดพลาด
    2.  **Browser Extensions:** ส่วนขยายของเบราว์เซอร์บางตัว (เช่น VPN, Password Manager ในกรณีนี้คือ VeePN) ที่ผู้ใช้ติดตั้งไว้ มีการยิงสคริปต์มาประมวลผลบนหน้าเว็บโดยใช้ `eval` ทำให้ตัวจัดการระบบ CSP ของเราบล็อกและขึ้นข้อผิดพลาดเตือนในเครื่องมือนักพัฒนา

---

## 4. วิธีการแก้ไข (Resolution Details)
*   **การแก้ไขเร่งด่วน (Mitigation):** ทำการใส่คำสั่ง `'unsafe-eval'` กลับคืนเข้าไปยังไฟล์นโยบาย CSP
    -   **Vercel config:** ใส่ `'unsafe-eval'` คืนใน `script-src` ของ [vercel.json](file:///g:/covibe/vercel.json)
    -   **Backend Server:** ใส่ `'unsafe-eval'` คืนใน `Content-Security-Policy` ของ [server/index.js](file:///g:/covibe/server/index.js)
*   **การทดสอบซ้ำ:** ทำการตรวจสอบ Headers ด้วย `netstat` และเปิดหน้า Roadmap เช็คแถบ Console/Issues พบว่าไม่มีข้อผิดพลาดสีแดงค้างอยู่อีกต่อไป

---

## 5. แนวทางการป้องกันในอนาคต (Prevention & Next Steps)
1.  **การแยก CSP ระหว่าง Dev และ Prod:** ในอนาคตควรปรับปรุงระบบให้เซิร์ฟเวอร์หลังบ้านแยกนโยบาย CSP ระหว่างโหมดพัฒนา (ยินยอมให้มี `'unsafe-eval'` เพื่อเครื่องมือ Vite HMR) และโหมดจริงบน Production (บล็อก `'unsafe-eval'` เต็มรูปแบบ)
2.  **การทดสอบก่อนใช้งานจริง:** ทุกครั้งที่มีการแก้ไขนโยบาย CSP หรือสิทธิ์ความปลอดภัย ควรทำการรันเซิร์ฟเวอร์ในสภาพแวดล้อมจำลองเพื่อเช็ค Logs ใน DevTools ก่อนอัปโหลดเข้าระบบ Git เสมอ
