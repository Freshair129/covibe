# CoVibe

CoVibe คือ PWA สำหรับฟังเพลงเดียวกันแบบเรียลไทม์ระหว่างคนขับและคนซ้อนมอเตอร์ไซค์ โดยเริ่มจาก MVP แบบ Cloud Sync ผ่าน WebSocket และ YouTube IFrame Player

## Run Locally

```bash
npm install
npm run dev
```

เปิดแอปที่:

```text
http://localhost:5173
```

Realtime server:

```text
http://localhost:8787/health
```

## MVP ที่มีในรอบแรก

- สร้างห้องทริป
- Join ผ่านรหัสห้องหรือ QR/link
- เพิ่มเพลงจาก YouTube URL หรือ video id
- Queue เพลงกลาง
- Play / Pause / Skip sync
- Drift report และ correction ฝั่ง client
- Music / Video mode สำหรับลดภาระหน้าจอเมื่อไม่ต้องดูวิดีโอ
- Independent volume ต่อเครื่อง
- Realtime chat box
- Voice chat ผ่าน WebRTC signaling
- OLED saver mode

## หมายเหตุทางเทคนิค

เว็บเวอร์ชันนี้ยังเป็น Cloud Sync PWA ก่อน ยังไม่ใช่ Local Hotspot Mode แบบเต็ม เพราะ browser มือถือไม่สามารถรัน local WebSocket server ได้โดยตรง

Music mode ใน MVP นี้ลดงานเรนเดอร์บนหน้าจอและซ่อนวิดีโอด้วย UI แบบ audio-first แต่ YouTube IFrame ยังเป็นแหล่งเล่นเดิม จึงไม่รับประกันว่าจะลด data เท่ากับ audio-only จริงของ YouTube Music

Voice chat ใช้ WebRTC และต้องให้ browser อนุญาต microphone ก่อนใช้งาน
