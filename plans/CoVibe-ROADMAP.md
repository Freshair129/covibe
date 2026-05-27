# CoVibe Roadmap

## Roadmap Principle

CoVibe จะโตจาก product ที่พิสูจน์ shared listening ได้จริงก่อน แล้วค่อยขยายเป็น ride audio platform

ลำดับความสำคัญ:

1. ทำให้คน 2 คนฟังเพลงเดียวกันได้ง่ายและเสถียร
2. ทำให้คนซ้อนช่วยควบคุมคิวเพลงได้สนุก
3. ลดภาระคนขับและเพิ่มความปลอดภัย
4. ขยายไป Hotspot, offline, intercom, convoy หลัง core ใช้จริงแล้ว

## Version Roadmap

### v0.0 - Feasibility Prototype

เป้าหมาย: พิสูจน์ว่า YouTube sync ข้ามมือถือ 2 เครื่องทำได้จริง

Features:

- YouTube IFrame prototype
- WebSocket room prototype
- Play/pause/seek sync
- Drift measurement
- Manual room link

Success Criteria:

- มือถือ 2 เครื่องเล่นเพลงเดียวกันได้
- Drift เฉลี่ยต่ำกว่า 500ms ใน network ปกติ
- ระบุข้อจำกัด iOS/Android ได้ชัดเจน

Estimated Time: 3-5 วัน

### v0.1 - Private MVP

เป้าหมาย: ให้ทีมและเพื่อนกลุ่มเล็กใช้จบทริปสั้นๆ ได้

Features:

- Rider สร้างห้อง
- Passenger join ผ่าน QR/link
- YouTube link parser
- Queue พื้นฐาน
- Play/pause/skip sync
- Current track display
- Participant presence
- Basic mobile UI ภาษาไทย

Success Criteria:

- ใช้กับมือถือ 2 เครื่องได้โดยไม่ต้องเปิด dev tools
- เล่นเพลงต่อคิวได้อย่างน้อย 5 เพลง
- Join flow ใช้เวลาไม่เกิน 30 วินาที

Estimated Time: 2 สัปดาห์

### v0.2 - Sync Hardening

เป้าหมาย: ทำให้ประสบการณ์ฟังเพลงเสถียรพอสำหรับ beta จริง

Features:

- Drift correction
- Latency ping
- Reconnect handling
- Buffer state
- YouTube unavailable handling
- Auto next track
- Independent volume control
- OLED saver / black screen mode

Success Criteria:

- Drift p95 ต่ำกว่า 800ms
- หลุดเน็ตสั้นๆ แล้วกลับมาต่อได้
- Rider เปิด OLED saver แล้วเพลงยังทำงานต่อ

Estimated Time: 2 สัปดาห์

### v0.3 - Passenger Experience

เป้าหมาย: ทำให้คนซ้อนรู้สึกเป็น co-DJ ไม่ใช่แค่ผู้ฟัง

Features:

- Search เพลงผ่าน YouTube API หรือ search provider
- Queue reorder
- Remove own track
- Vote/like เพลงในคิว
- Recently played
- Share trip playlist
- Passenger display name/avatar แบบง่าย

Success Criteria:

- Passenger เพิ่มเพลงเฉลี่ยมากกว่า 2 เพลงต่อทริป
- มากกว่า 60% ของทริปมีเพลงที่ Passenger เพิ่ม

Estimated Time: 2 สัปดาห์

### v0.4 - Closed Beta

เป้าหมาย: เปิดให้ beta users 20-50 คู่ใช้งานจริง

Features:

- Beta onboarding
- Feedback form
- Error tracking
- Analytics dashboard
- Trip summary
- Report issue จากในแอป
- Basic moderation สำหรับชื่อห้อง/ชื่อผู้ใช้

Success Criteria:

- 20+ ทริปที่ฟังต่อเนื่องเกิน 15 นาที
- Passenger join success rate มากกว่า 75%
- Crash/blocking bug ต่ำกว่า 5% ของ sessions

Estimated Time: 3 สัปดาห์

### v0.5 - Public Beta

เป้าหมาย: เปิดใช้งานวงกว้างแบบควบคุมความเสี่ยง

Features:

- Landing/app entry แบบเน้นใช้งานทันที
- Share invite ที่สวยขึ้น
- Persistent playlist history
- Account optional
- Rate limit
- Room expiration
- Thai copy polish
- Basic support page

Success Criteria:

- 500 rooms created
- 150 activated rooms
- Repeat usage ภายใน 7 วันมากกว่า 15%

Estimated Time: 4 สัปดาห์

### v1.0 - CoVibe Launch

เป้าหมาย: Product พร้อมใช้งาน public สำหรับ use case หลัก

Features:

- Stable cloud sync
- QR join
- Queue collaboration
- OLED saver
- Analytics
- Production monitoring
- Mobile browser compatibility
- SEO/OG share pages
- Privacy policy / terms

Success Criteria:

- Activation rate มากกว่า 35%
- Average activated trip length มากกว่า 15 นาที
- Drift p95 ต่ำกว่า 1 วินาที
- NPS/feedback positive จาก beta cohort

Estimated Time: 8-12 สัปดาห์จากเริ่ม build

## Post-Launch Roadmap

### v1.1 - Better Ride Mode

Focus:

- ปลอดภัยขึ้นสำหรับคนขับ
- ใช้กลางแดดและระหว่างขับง่ายขึ้น

Features:

- Bigger rider controls
- Emergency pause
- Auto OLED saver after inactivity
- Wake lock support
- Low bandwidth mode
- Speed-aware UI lock ถ้าเปิด GPS permission

### v1.2 - Local / Hotspot Experiments

Focus:

- ลด latency และพึ่ง cloud น้อยลง

Features:

- WebRTC data channel sync
- Cloud signaling + peer-to-peer sync
- LAN/hotspot connection guide
- QR/manual WebRTC fallback experiment
- Network quality indicator

Note:

เว็บล้วนยังมีข้อจำกัดเรื่องการรัน local server บนมือถือ ถ้าต้องการ Hotspot Mode เต็มรูปแบบควรเข้าสู่ native phase

### v1.3 - Voice / Intercom Experiment

Focus:

- ทดลอง push-to-talk ระหว่างคนขับและคนซ้อน

Features:

- WebRTC voice channel
- Push-to-talk
- Noise gate
- Echo cancellation settings
- Auto-duck music when speaking

Success Criteria:

- Latency ต่ำพอสำหรับบทสนทนาสั้นๆ
- ไม่ทำให้เพลง sync แย่ลง

### v1.4 - Native Companion

Focus:

- ข้ามข้อจำกัดของ browser สำหรับ audio/background/hotspot

Options:

- Capacitor app
- React Native app
- Android-first native prototype

Features:

- Better background playback behavior
- Audio focus integration
- Local network service
- Offline local audio files
- Better Bluetooth/media control support

### v1.5 - Offline Personal Library

Focus:

- ใช้ได้ในพื้นที่ไม่มีสัญญาณโดยไม่ละเมิด YouTube

Features:

- Local files ที่ผู้ใช้มีสิทธิ์ใช้งาน
- Playlist import
- File matching/hash
- Local sync over LAN/native
- Pre-trip checklist

### v2.0 - Convoy Mode

Focus:

- จาก rider + passenger เป็นกลุ่มขับขี่

Features:

- Multi-room convoy
- Group playlist
- Member presence
- Optional GPS location sharing
- Trip playlist archive
- Community trip playlist sharing

## Business Roadmap

### Stage 1: Free Beta

Goal:

- Validate demand
- Learn technical constraints
- Build community trust

Pricing:

- Free

Key Message:

> หูฟังที่มีอยู่ก็พอ แค่เปิด CoVibe แล้วฟังด้วยกัน

### Stage 2: Freemium

Free:

- 2-person room
- Basic queue
- Cloud sync

Premium Candidate:

- Longer trip history
- Advanced playlist tools
- Trip playlist export
- Convoy mode
- Advanced audio settings

### Stage 3: Partner Distribution

Channels:

- ร้านหมวกกันน็อค
- ร้านติดตั้ง Bluetooth/intercom
- ร้านอุปกรณ์มอเตอร์ไซค์
- Micro-influencers
- Community groups

Partner Hook:

> ลูกค้าซื้อหูฟังหรือหมวกแล้วสแกน QR เพื่อลองฟังเพลงคู่กันได้ทันที

## KPI Roadmap

### MVP KPI

- 20 activated trips
- Average trip length > 10 minutes
- Passenger join success > 70%
- Drift p95 < 1 second

### Beta KPI

- 150 activated trips
- Average trip length > 15 minutes
- Passenger-added tracks in > 50% of trips
- 7-day repeat usage > 15%

### Launch KPI

- 1,000 rooms created
- 350 activated rooms
- 100 repeat users
- 25 organic shares/posts

## Team Roadmap

### Minimum Team

- 1 full-stack engineer
- 1 product/design owner
- 1 tester/community operator

### Nice-to-Have

- Mobile engineer for native phase
- Audio/WebRTC specialist
- Growth/content operator

## Decision Gates

### Gate A: After Feasibility Prototype

Proceed if:

- YouTube sync works on real phones
- Browser limitations are manageable
- Join flow is simple enough

Kill or pivot if:

- Playback cannot remain stable even with screen on
- Drift cannot be corrected under normal network

### Gate B: After Private MVP

Proceed if:

- Users understand the product without long explanation
- Rider/Passenger can complete first session
- Passenger enjoys controlling queue

### Gate C: After Closed Beta

Proceed if:

- Users repeat usage
- Main complaints are fixable UX/bugs
- No platform limitation blocks the core promise

### Gate D: Before Native Phase

Proceed if:

- Cloud PWA has real demand
- Users ask for background/offline/hotspot reliability
- Retention justifies native investment

