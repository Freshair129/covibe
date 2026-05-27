import { WebSocket } from 'ws';

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8989';
const NUM_CLIENTS = 100; // จำลอง 100 clients (50 ห้อง)
const TEST_DURATION_MS = 10000; // ทดสอบ 10 วินาที

console.log(`🚀 Starting stress test on ${SERVER_URL} with ${NUM_CLIENTS} clients...`);

const clients = [];
let messagesReceived = 0;
let errors = 0;

for (let i = 0; i < NUM_CLIENTS; i++) {
  const ws = new WebSocket(SERVER_URL);
  
  ws.on('open', () => {
    // สร้างห้องหรือเข้าร่วมห้อง
    const roomId = `STRESS-${Math.floor(i / 2)}`;
    const type = i % 2 === 0 ? 'create_room' : 'join_room';
    
    ws.send(JSON.stringify({
      type,
      roomId,
      participantId: `client-${i}`,
      displayName: `Bot-${i}`
    }));

    // ส่ง sync_report ทุก 2 วินาที
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sync_report',
          positionMs: 1000 + i,
          clientSentAt: Date.now()
        }));
      }
    }, 2000);

    ws.on('close', () => clearInterval(interval));
  });

  ws.on('message', () => {
    messagesReceived++;
  });

  ws.on('error', (err) => {
    errors++;
    // console.error(`Client ${i} error:`, err.message);
  });

  clients.push(ws);
}

setTimeout(() => {
  console.log('\n--- Stress Test Results ---');
  console.log(`Total Clients: ${NUM_CLIENTS}`);
  console.log(`Messages Received: ${messagesReceived}`);
  console.log(`Errors Encountered: ${errors}`);
  console.log('---------------------------');
  
  clients.forEach(ws => ws.close());
  process.exit(errors > 0 ? 1 : 0);
}, TEST_DURATION_MS);
