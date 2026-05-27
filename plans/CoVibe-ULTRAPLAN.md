# CoVibe Ultraplan

## 1. Product North Star

**CoVibe** คือเว็บแอป/PWA ที่ทำให้คนขับและคนซ้อนมอเตอร์ไซค์ฟังเพลงเดียวกันแบบเรียลไทม์ โดยใช้มือถือและหูฟัง Bluetooth ที่มีอยู่แล้ว ไม่ต้องซื้อ intercom เพิ่ม

North Star Metric:

> จำนวนทริปที่มีผู้ใช้อย่างน้อย 2 คนฟังเพลงซิงค์กันต่อเนื่องเกิน 15 นาที

Primary Promise:

> ฟังเพลงด้วยกันบนมอไซค์ ไม่ต้องซื้ออะไรเพิ่ม

## 2. Strategic Thesis

ตลาดปัจจุบันมีช่องว่างระหว่าง 2 ทางเลือก:

1. ซื้อ intercom ราคาหลักพันถึงหลักหมื่น แต่ติดข้อจำกัดแบรนด์ เสียงเพลงไม่ดี และแชร์คิวเพลงยาก
2. ใช้หูฟัง Bluetooth/TWS ส่วนตัว แต่ฟังคนละเพลง ไม่มี shared experience

CoVibe เข้าไปเติมช่องว่างนี้ด้วย software-first experience:

- ใช้ได้กับหูฟัง Bluetooth ทุกยี่ห้อ
- ใช้ YouTube เป็น music source ในช่วง MVP เพราะผู้ใช้ไทยคุ้นเคย
- ให้คนซ้อนช่วยค้นหาและจัดคิวเพลง ลดการกดมือถือของคนขับ
- เริ่มจาก Cloud Sync เพื่อพิสูจน์ product ก่อน แล้วค่อยขยายไป Hotspot/Native ในเฟสหลัง

## 3. Scope Decision

### MVP ต้องทำ

- สร้างห้องทริปโดย Rider
- Join ด้วย QR/link โดย Passenger
- ค้นหาเพลงหรือวาง YouTube link
- คิวเพลงกลาง
- Play/Pause/Skip/Seek ซิงค์กัน
- Drift correction ระหว่างเครื่อง
- ปรับเสียงแยกแต่ละเครื่อง
- Rider dashboard ปุ่มใหญ่
- Passenger remote สำหรับเพิ่มเพลง
- OLED saver / black screen mode
- Reconnect หลังเน็ตหลุดสั้นๆ

### MVP ยังไม่ทำ

- Offline YouTube download
- Native local WebSocket server บนมือถือ
- Full local hotspot mode แบบไม่พึ่ง server
- Intercom voice chat
- OS-level audio ducking
- Convoy GPS tracking
- Voice command
- Payment/subscription

เหตุผล: ฟีเจอร์เหล่านี้มีความเสี่ยงด้าน browser/platform สูง ควรทำหลังพิสูจน์ว่า core use case มี demand จริง

## 4. Technical Reality Check

### Browser Constraint

เว็บเบราว์เซอร์มือถือไม่สามารถรัน WebSocket server เพื่อฟังพอร์ตบนเครื่องตัวเองได้โดยตรง ดังนั้น Hotspot Mode แบบ `ws://172.20.10.1:8080` ต้องใช้ native app, companion service, หรือ WebRTC signaling pattern

### YouTube Constraint

YouTube IFrame API เหมาะกับการควบคุม playback แต่ไม่ควรออกแบบให้ดาวน์โหลดไฟล์ YouTube มาเล่น offline เอง เพราะเสี่ยงผิดเงื่อนไขการใช้งาน

### Mobile Constraint

iOS และ Android จำกัด autoplay, background playback, wake lock, audio focus และการทำงานเมื่อหน้าจอล็อก จึงต้องทดสอบกับมือถือจริงตั้งแต่สัปดาห์แรก

## 5. Recommended Architecture

### Phase 1 Architecture: Cloud Sync PWA

```
Rider Phone
  PWA + YouTube IFrame Player
  WebSocket Client
  QR Room Creator

Cloud Backend
  Room State
  Queue State
  WebSocket Gateway
  Sync Clock
  Event Log

Passenger Phone
  PWA + YouTube IFrame Player
  WebSocket Client
  Queue Remote
```

### Frontend

- React + Vite หรือ Next.js
- PWA manifest
- Service worker สำหรับ shell caching
- YouTube IFrame API
- Web Audio API เฉพาะเท่าที่จำเป็น
- QR generator
- Mobile-first responsive UI

### Backend

- Node.js + TypeScript
- Socket.IO หรือ native WebSocket
- Redis สำหรับ room state ชั่วคราว
- PostgreSQL/Supabase สำหรับ user, trip history, playlist history ในเฟส beta
- YouTube Data API สำหรับ search หรือ fallback เป็น pasted URL ในเวอร์ชันแรก

### Hosting

- Frontend: Vercel/Cloudflare Pages
- Realtime server: Fly.io/Render/Railway หรือ container บน VPS
- Redis: Upstash/Redis Cloud
- DB: Supabase/Postgres

## 6. Core Domain Model

### Room

- `roomId`
- `hostId`
- `status`: `waiting | playing | paused | ended`
- `createdAt`
- `lastActiveAt`
- `currentTrackId`
- `currentStartedAt`
- `currentPositionMs`
- `playbackRate`

### Participant

- `participantId`
- `roomId`
- `role`: `rider | passenger`
- `displayName`
- `connectionStatus`
- `joinedAt`
- `lastSeenAt`
- `latencyMs`
- `driftMs`

### Track

- `trackId`
- `source`: `youtube`
- `sourceId`
- `title`
- `thumbnailUrl`
- `durationMs`
- `addedBy`
- `addedAt`
- `queueStatus`

### Sync Event

- `eventId`
- `roomId`
- `type`: `play | pause | seek | skip | queue_add | queue_remove | drift_ping | drift_adjust`
- `serverTime`
- `trackId`
- `positionMs`
- `actorId`

## 7. Playback Sync Algorithm

### MVP Sync Rule

Rider หรือ server เป็น source of truth:

1. เมื่อกด play ให้ server บันทึก `trackId`, `positionMs`, `serverStartedAt`
2. ทุก client คำนวณ expected position จากเวลาปัจจุบันของ server
3. ทุก 1-3 วินาที client ส่ง `currentTime` กลับไป
4. ถ้า drift ต่ำกว่า 250ms ให้ปล่อย
5. ถ้า drift 250-800ms ให้ปรับ playback rate ชั่วคราว
6. ถ้า drift เกิน 800ms ให้ seek ตรง
7. ถ้า player buffering ให้แจ้งสถานะและรอ resync เมื่อพร้อม

### Acceptance Target

- Drift ปกติ: ต่ำกว่า 300ms
- Drift หลัง reconnect: กลับมาต่ำกว่า 500ms ภายใน 5 วินาที
- Join room: Passenger เริ่มฟังเพลงเดียวกันภายใน 10 วินาทีหลังสแกน QR

## 8. UX Flows

### Rider Flow

1. เปิด CoVibe
2. กด "เริ่มทริป"
3. ระบบสร้าง QR/link
4. Rider เลือกเพลงแรก หรือให้ Passenger เพิ่มเพลง
5. กด play
6. เปิด OLED saver เมื่อเริ่มขับ
7. ใช้ปุ่มใหญ่สำหรับ pause/skip/emergency stop

### Passenger Flow

1. สแกน QR
2. ใส่ชื่อเล่น
3. เห็นเพลงที่กำลังเล่น
4. ค้นหา/วางลิงก์ YouTube
5. เพิ่มเพลงเข้าคิว
6. ปรับ volume ของเครื่องตัวเอง
7. โหวต/จัดลำดับคิวใน beta phase

## 9. UI Principles

- Mobile-first
- ปุ่มหลักต้องใหญ่และแตะง่าย
- Rider screen ต้องอ่านได้กลางแดด
- Passenger screen ต้องค้นหาเพลงเร็ว
- หลีกเลี่ยง UI ที่ชวนให้คนขับกดเยอะ
- ใช้ dark mode เป็น default
- OLED saver ต้องดำจริงและมี control ขั้นต่ำ
- ไม่ทำ landing page เป็นหน้าแรกของ app; หน้าแรกต้องพาเข้าใช้งานจริงทันที

## 10. Sprint Plan

### Sprint 0: Feasibility Spike

ระยะเวลา: 3-5 วัน

Deliverables:

- Prototype YouTube IFrame 2 clients
- WebSocket room sync
- Basic play/pause/seek
- Drift measurement
- Mobile test บน iOS + Android

Exit Criteria:

- มือถือ 2 เครื่องเล่นเพลงเดียวกันได้
- Drift เฉลี่ยต่ำกว่า 500ms
- Join ด้วย room link ได้
- ระบุข้อจำกัด autoplay/background ได้ชัดเจน

### Sprint 1: MVP Foundation

ระยะเวลา: 1 สัปดาห์

Deliverables:

- Project setup
- Room creation
- QR join
- WebSocket backend
- Participant presence
- Basic Thai UI

Exit Criteria:

- Rider เปิดห้องและ Passenger join ได้ใน production-like environment

### Sprint 2: Queue + Playback

ระยะเวลา: 1 สัปดาห์

Deliverables:

- YouTube link parser
- Queue add/remove
- Current track state
- Play/pause/skip
- Seek sync

Exit Criteria:

- เล่นเพลงต่อคิวได้อย่างน้อย 5 เพลงโดยไม่ต้อง refresh

### Sprint 3: Sync Hardening

ระยะเวลา: 1 สัปดาห์

Deliverables:

- Drift correction
- Latency ping
- Reconnect
- Buffer handling
- Host handoff fallback แบบง่าย

Exit Criteria:

- เน็ตหลุดสั้นๆ แล้วกลับมาฟังต่อได้
- Drift หลัง reconnect กลับมาต่ำกว่า 500ms

### Sprint 4: Rider Mode + Beta Polish

ระยะเวลา: 1 สัปดาห์

Deliverables:

- Rider dashboard ปุ่มใหญ่
- OLED saver
- Passenger remote polish
- Trip summary
- Analytics events

Exit Criteria:

- ใช้ทดสอบกับ beta users ได้โดยไม่ต้องมี developer คอยประกบ

### Sprint 5: Private Beta

ระยะเวลา: 2-3 สัปดาห์

Deliverables:

- Beta onboarding
- Feedback form
- Error tracking
- Usage dashboard
- First 20-50 beta pairs

Exit Criteria:

- มีอย่างน้อย 20 ทริปที่ฟังต่อเนื่องเกิน 15 นาที
- รู้ top 5 bugs จากการใช้งานจริง
- รู้ว่า persona ไหน retain ดีที่สุด

## 11. Analytics Plan

### Product Metrics

- Rooms created
- Passenger join rate
- Time from room created to first passenger joined
- Tracks added per trip
- Average listening session length
- Sync drift average/p95
- Reconnect count
- Drop-off point
- OLED saver usage

### Activation Metric

ผู้ใช้ถือว่า activated เมื่อ:

- สร้างห้อง
- มีอีกคน join
- เล่นเพลงเดียวกันเกิน 3 นาที

### Retention Metric

- Repeat trip within 7 days
- Repeat passenger joining another room

## 12. QA Plan

### Device Matrix

- iPhone Safari
- iPhone Chrome
- Android Chrome
- Android Samsung Internet
- Low-end Android
- Bluetooth earbuds
- Helmet Bluetooth intercom ถ้ามี

### Scenarios

- Join ก่อนเล่นเพลง
- Join ระหว่างเพลงกำลังเล่น
- Passenger เน็ตหลุดแล้วกลับมา
- Rider refresh หน้า
- YouTube unavailable video
- เพลงยาวมาก
- เพลงจบแล้ว auto next
- มือถือ lock screen
- Bluetooth headset connected/disconnected

## 13. Risk Register

| Risk | Impact | Mitigation |
|---|---:|---|
| YouTube autoplay restriction | High | ให้ผู้ใช้ tap เพื่อ unlock playback ใน onboarding |
| Background playback ไม่เสถียร | High | OLED saver + wake lock + native phase หลัง MVP |
| Drift สูงบน network แย่ | Medium | Drift correction + reconnect + status UI |
| YouTube API quota | Medium | เริ่มจาก pasted URL + cache search |
| Hotspot mode ทำบนเว็บล้วนไม่ได้ครบ | High | วางเป็น Phase 2/Native ไม่ใส่ใน MVP |
| คนขับกดมือถือขณะขับ | High | UX ให้คนซ้อนคุมเป็นหลัก + ปุ่ม Rider ใหญ่เท่านั้น |
| Legal/music rights | Medium | ไม่ host เพลงเอง ใช้ embedded YouTube |

## 14. Beta Launch Plan

### Target Beta

- คู่รัก/เพื่อนที่ขี่ scooter
- BigBike touring couple
- กลุ่มผู้ใช้ TWS/helmet Bluetooth ที่ไม่อยากซื้อ intercom ใหม่

### Beta Offer

> ทดลอง CoVibe ฟรี: ให้คนซ้อนเลือกเพลง คนขับไม่ต้องซื้ออุปกรณ์เพิ่ม

### Channels

- Facebook groups มอเตอร์ไซค์/PCX/NMAX/BigBike
- TikTok/Reels demo
- ร้านหมวก/อุปกรณ์มอเตอร์ไซค์ที่ยอมติด QR
- กลุ่มเพื่อน beta 20-50 คู่แรก

## 15. Definition of Done for MVP

MVP ถือว่าเสร็จเมื่อ:

- Rider สร้างห้องได้
- Passenger join ผ่าน QR/link ได้
- เพิ่ม YouTube track ได้
- เล่นเพลงเดียวกันบนมือถือ 2 เครื่องได้
- Play/pause/skip/seek ซิงค์กัน
- Drift correction ทำงาน
- Reconnect ทำงาน
- OLED saver ใช้งานได้
- มี analytics ขั้นพื้นฐาน
- ทดสอบจริงบน iOS และ Android อย่างน้อยอย่างละ 1 เครื่อง

