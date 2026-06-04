const ROADMAP_DATA = [
  {
    id: 'p0',
    badge: 'Phase 0',
    title: 'Feasibility Spike — พิสูจน์ความเสถียร',
    desc: 'ก่อนเริ่ม Sprint จริง ต้องพิสูจน์ให้ได้ว่าระบบ YouTube IFrame API ทำงานร่วมกับ WebSocket sync ในการดึงพิกัดเวลาของเพลงได้เสถียรบนมือถือ 2 เครื่อง และหาข้อจำกัดระบบ',
    sprints: [
      {
        id: 'p0-s0',
        tag: 's0',
        tagName: 'Sprint 0',
        name: 'Technical Spike',
        duration: '3–5 วัน',
        tasks: [
          { id: 'p0-s0-1', text: 'Prototype YouTube IFrame Player บน 2 clients พร้อมกัน', state: 'done', assist: 'local' },
          { id: 'p0-s0-2', text: 'WebSocket room ขั้นต่ำ: สร้างห้อง / join / broadcast event', state: 'done', assist: 'qwen' },
          { id: 'p0-s0-3', text: 'Play / Pause / Seek sync เบื้องต้น', state: 'done', assist: 'eva' },
          { id: 'p0-s0-4', text: 'วัด drift จริงระหว่าง 2 เครื่อง', state: 'done', assist: 'local' },
          { id: 'p0-s0-5', text: 'ทดสอบบน iOS Safari + Android Chrome', state: 'done', assist: 'local' },
          { id: 'p0-s0-6', text: 'ระบุข้อจำกัด autoplay / background playback / wake lock', state: 'done', assist: 'local' }
        ],
        exitCriteria: [
          'มือถือ 2 เครื่องเล่นเพลงเดียวกัน drift เฉลี่ย < 500ms',
          'Join ด้วย room link ได้',
          'มี document สรุปข้อจำกัดของแต่ละแพลตฟอร์ม'
        ]
      }
    ]
  },
  {
    id: 'p1',
    badge: 'Phase 1',
    title: 'MVP Core — ฟังก์ชันห้องและการแชร์เพลง',
    desc: 'วางรากฐานโครงสร้างระบบ Client และ Server ให้ Rider สามารถเปิดห้องและส่งต่อลิงก์ห้องให้ Passenger ร่วมใช้งานได้จริงบนระบบ Production',
    sprints: [
      {
        id: 'p1-s1a',
        tag: 's1',
        tagName: 'Sprint 1A',
        name: 'Setup + Room Creation',
        duration: '1 สัปดาห์',
        tasks: [
          { id: 'p1-s1a-1', text: 'ตั้งโปรเจกต์ React + Vite (PWA manifest, service worker shell)', state: 'done', assist: 'local' },
          { id: 'p1-s1a-2', text: 'Backend Node.js + TypeScript + WebSocket room state ในเมมโมรี่', state: 'done', assist: 'qwen' },
          { id: 'p1-s1a-3', text: 'Rider: สร้างห้อง → รับ roomId → แสดง QR code', state: 'done', assist: 'eva' },
          { id: 'p1-s1a-4', text: 'QR generator + share link', state: 'done', assist: 'local' },
          { id: 'p1-s1a-5', text: 'Passenger: สแกน QR → ใส่ชื่อ → join ห้อง', state: 'done', assist: 'local' },
          { id: 'p1-s1a-6', text: 'Participant presence (connected / disconnected)', state: 'done', assist: 'qwen' },
          { id: 'p1-s1a-7', text: 'Thai UI ขั้นพื้นฐาน, dark mode, mobile-first layout', state: 'done', assist: 'eva' }
        ],
        exitCriteria: [
          'Rider เปิดห้องและ Passenger join ได้บน production URL จริง'
        ]
      },
      {
        id: 'p1-s1b',
        tag: 's1',
        tagName: 'Sprint 1B',
        name: 'Queue + Playback Sync',
        duration: '1 สัปดาห์',
        tasks: [
          { id: 'p1-s1b-1', text: 'YouTube link parser + YouTube IFrame API integration', state: 'done', assist: 'local' },
          { id: 'p1-s1b-2', text: 'Queue เพลง: add / remove / reorder', state: 'done', assist: 'local' },
          { id: 'p1-s1b-3', text: 'Current track state บน server (trackId, positionMs, serverStartedAt)', state: 'done', assist: 'qwen' },
          { id: 'p1-s1b-4', text: 'Play / Pause / Skip / Seek ซิงค์ผ่าน WebSocket', state: 'done', assist: 'eva' },
          { id: 'p1-s1b-5', text: 'Auto-next เมื่อเพลงจบ', state: 'done', assist: 'local' },
          { id: 'p1-s1b-6', text: 'Volume control แยกแต่ละ device', state: 'done', assist: 'local' }
        ],
        exitCriteria: [
          'เล่นเพลงต่อคิว 5 เพลงขึ้นไปโดยไม่ต้อง refresh หน้าเว็บ'
        ]
      }
    ]
  },
  {
    id: 'p2',
    badge: 'Phase 2',
    title: 'Hardening + Rider UX — ความเสถียร & ขับขี่จริง',
    desc: 'ปรับปรุง Algorithm การซิงค์นาฬิกา และสร้าง UI สำหรับผู้ขับขี่ (Rider) เพื่อความสะดวกปลอดภัยเวลาใช้งานจริงขณะขี่มอเตอร์ไซค์',
    sprints: [
      {
        id: 'p2-s2a',
        tag: 's2',
        tagName: 'Sprint 2A',
        name: 'Sync Hardening',
        duration: '1 สัปดาห์',
        tasks: [
          { id: 'p2-s2a-1', text: 'Drift correction algorithm (<250ms ปล่อย / 250-800ms ปรับ rate / >800ms seek)', state: 'done', assist: 'qwen' },
          { id: 'p2-s2a-2', text: 'Latency ping ทุก 3 วินาที + clock sync กับ server', state: 'done', assist: 'eva' },
          { id: 'p2-s2a-3', text: 'Reconnect อัตโนมัติหลังเน็ตหลุด + resync position', state: 'done', assist: 'local' },
          { id: 'p2-s2a-4', text: 'Buffer state handling + แจ้งเตือนผู้ใช้เมื่อเน็ตช้า', state: 'done', assist: 'local' },
          { id: 'p2-s2a-5', text: 'Host handoff fallback เมื่อผู้เปิดห้องตัดการเชื่อมต่อ', state: 'done', assist: 'local' },
          { id: 'p2-s2a-6', text: 'Drift metric logging เพื่อใช้ในการ debug พฤติกรรมการซิงค์', state: 'done', assist: 'local' }
        ],
        exitCriteria: [
          'เน็ตหลุดกลับมาแล้วซิงค์ดนตรี drift < 500ms ภายใน 5 วินาที'
        ]
      },
      {
        id: 'p2-s2b',
        tag: 's2',
        tagName: 'Sprint 2B',
        name: 'Rider Mode + Beta Polish',
        duration: '1 สัปดาห์',
        tasks: [
          { id: 'p2-s2b-1', text: 'Rider dashboard ปุ่มใหญ่ (Play/Pause/Skip) แตะง่าย', state: 'done', assist: 'local' },
          { id: 'p2-s2b-2', text: 'OLED Saver / Black Screen mode ประหยัดพลังงาน', state: 'done', assist: 'local' },
          { id: 'p2-s2b-3', text: 'Passenger remote: ค้นหา YouTube + เพิ่มเพลง', state: 'done', assist: 'local' },
          { id: 'p2-s2b-4', text: 'Trip summary หน้าสรุปรายละเอียดการเดินทาง', state: 'done', assist: 'local' },
          { id: 'p2-s2b-5', text: 'Analytics events (กิจกรรมห้อง, อัตราดริฟต์เฉลี่ย)', state: 'done', assist: 'local' },
          { id: 'p2-s2b-6', text: 'Error tracking integration (รายงาน crash)', state: 'done', assist: 'local' },
          { id: 'p2-s2b-7', text: 'CoDev Command Center architecture refactor (Full Modularization)', state: 'done', assist: 'local' }
        ],
        exitCriteria: [
          'กลุ่มทดสอบ Beta สามารถใช้งานระบบเองได้โดยไม่มี Developer คอยช่วย'
        ]
      }
    ]
  },
  {
    id: 'p3',
    badge: 'Phase 3',
    title: 'Private Beta — เริ่มการทดสอบกลุ่มย่อย',
    desc: 'เริ่มเชิญกลุ่มผู้ใช้รถมอเตอร์ไซค์จำนวน 20–50 คู่ ทำการทดสอบเดินทางในชีวิตประจำวันเพื่อรวบรวมข้อเสนอแนะและบั๊กที่แฝงอยู่',
    sprints: [
      {
        id: 'p3-s3a',
        tag: 's3',
        tagName: 'Sprint 3A',
        name: 'Beta Onboarding + Distribution',
        duration: '1 สัปดาห์',
        tasks: [
          { id: 'p3-s3a-1', text: 'Beta onboarding flow อธิบาย autoplay + วิธีเชื่อมต่อ', state: 'done', assist: 'local' },
          { id: 'p3-s3a-2', text: 'In-app feedback form + rating ประเมินหลังเดินทาง', state: 'done', assist: 'local' },
          { id: 'p3-s3a-3', text: 'รับสมัครกลุ่มผู้ขี่มอเตอร์ไซค์ 20-50 คู่มาร่วมทดสอบ', state: 'todo', assist: 'none' },
          { id: 'p3-s3a-4', text: 'ทำสื่อคลิปสั้นอธิบายระบบลง Reels/TikTok', state: 'todo', assist: 'none' },
          { id: 'p3-s3a-5', text: 'ผลิตสื่อ QR Code ประชาสัมพันธ์ติดร้านบิ๊กไบค์', state: 'todo', assist: 'none' }
        ],
        exitCriteria: []
      },
      {
        id: 'p3-s3b',
        tag: 's3',
        tagName: 'Sprint 3B',
        name: 'Monitoring + Learning',
        duration: '1–2 สัปดาห์',
        tasks: [
          { id: 'p3-s3b-1', text: 'Usage Dashboard: ตรวจสอบความถี่และชั่วโมงการเปิดซิงค์เพลง', state: 'todo', assist: 'none' },
          { id: 'p3-s3b-2', text: 'Retention tracking: อัตราการกลับมาเปิดเล่นซ้ำใน 7 วัน', state: 'todo', assist: 'none' },
          { id: 'p3-s3b-3', text: 'รวบรวม Bugs ยอดฮิต 5 อันดับแรกเพื่อจัดคิวแก้ไข', state: 'todo', assist: 'none' },
          { id: 'p3-s3b-4', text: 'สรุป Persona ผู้ใช้ที่ชอบฟีเจอร์นี้มากที่สุด', state: 'todo', assist: 'none' },
          { id: 'p3-s3b-5', text: 'เปิดอัปเดต Quick-fix แก้ปัญหาเร่งด่วนตามเสียงตอบรับ', state: 'todo', assist: 'none' }
        ],
        exitCriteria: [
          'สะสมทริปเดินทางที่มีการใช้งานเกิน 15 นาที ได้อย่างน้อย 20 ทริป',
          'ค้นหาจุดบกพร่องยอดนิยม 5 อันดับแรกเพื่อวางคิวพัฒนาเฟสถัดไป'
        ]
      }
    ]
  },
  {
    id: 'p4',
    badge: 'Future',
    isFuture: true,
    title: 'Post-Beta Expansion — แผนขยายฟีเจอร์หลัง MVP',
    desc: 'แนวคิดฟีเจอร์ในอนาคตที่อยู่นอกขอบเขตของระบบ MVP โดยมีข้อจำกัดและต้องการความพร้อมด้านเทคนิคเพิ่มเติม',
    sprints: [
      {
        id: 'p4-backlog',
        tag: 'nsm',
        tagName: 'Backlog',
        name: 'รอการประเมิน Demand และความเป็นไปได้',
        duration: 'TBD',
        tasks: [
          { id: 'p4-task-1', text: 'Hotspot / Local WebSocket (ซิงค์ตรงโดยไม่พึ่งอินเทอร์เน็ต)', state: 'todo', assist: 'none' },
          { id: 'p4-task-2', text: 'Intercom voice chat สนทนาเสียงแบบสายตรงในแอป', state: 'todo', assist: 'none' },
          { id: 'p4-task-3', text: 'Convoy GPS tracking ติดตามแผนที่ของเพื่อนร่วมคาราวาน', state: 'todo', assist: 'none' },
          { id: 'p4-task-4', text: 'Voice command สั่งงานระบบคิวเพลงด้วยเสียง', state: 'todo', assist: 'none' }
        ],
        exitCriteria: []
      }
    ]
  }
];