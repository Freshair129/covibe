/**
 * CoVibe Parallel Subagent Orchestrator
 * 
 * Script for automating the dispatch of tasks to subagents via the local CoVibe WebSocket server.
 * This runs tasks in parallel by distributing them to specific specialized agents (Qwen, Gemini, EVA).
 */

const WebSocket = require('ws');

// Connect to the local CoVibe Realtime Server (default port: 8989 based on roadmap specs)
const WS_URL = 'ws://localhost:8989';
const socket = new WebSocket(WS_URL);

// Tasks derived from the "todo" backlog in covibe_roadmap.html
const parallelTasks = [
  // Stream A: Core & Bug Fixing (Qwen Coder)
  { agent: "qwen", taskId: "p1-s1b-2", taskText: "Fix User Status Display Bug" },
  { agent: "qwen", taskId: "p2-s2a-4", taskText: "Implement Master/Follower toggle for queue" },
  { agent: "qwen", taskId: "p2-s2a-5", taskText: "Setup UI for manual resync button" },
  { agent: "qwen", taskId: "p2-s2b-3", taskText: "Implement Rate Limiter on WebSockets" },
  
  // Stream B: Testing & Telemetry (Gemini CLI)
  { agent: "gemini", taskId: "p3-s3a-1", taskText: "Create automated tests for websocket stability" },
  { agent: "gemini", taskId: "p3-s3a-2", taskText: "Implement Telemetry Dashboard components" },
  { agent: "gemini", taskId: "p3-s3b-1", taskText: "Analyze top 5 bugs from test runs" },
  
  // Stream C: Research & System Setup (EVA Agent)
  { agent: "eva", taskId: "p4-task-1", taskText: "Research Hotspot/Local WebSocket mode feasibility" },
  { agent: "eva", taskId: "p4-task-2", taskText: "Architect Intercom voice chat integration" },
  { agent: "eva", taskId: "p4-task-7", taskText: "Assess Native App wrapping (React Native/Capacitor)" }
];

socket.on('open', () => {
  console.log(`[ORCHESTRATOR] Connected to CoVibe server at ${WS_URL}`);
  console.log(`[ORCHESTRATOR] Dispatching ${parallelTasks.length} tasks in parallel...`);
  
  // Dispatch all tasks in parallel
  parallelTasks.forEach(task => {
    console.log(` -> Sending Task [${task.taskId}] to [${task.agent}] agent...`);
    socket.send(JSON.stringify({
      type: 'run_agent_task',
      agent: task.agent,
      taskId: task.taskId,
      taskText: task.taskText
    }));
  });

  console.log(`[ORCHESTRATOR] All parallel tasks dispatched!`);
});

socket.on('message', (data) => {
  try {
    const msg = JSON.parse(data);
    if (msg.type === 'agent_status') {
      console.log(`\n[AGENT STATUS] Task ${msg.taskId} ended with status: ${msg.status.toUpperCase()}`);
    } else if (msg.type === 'agent_log') {
      console.log(`[LOG - Task ${msg.taskId}]: ${msg.text.trim()}`);
    }
  } catch (err) {
    console.error('[ORCHESTRATOR ERROR] Could not parse message:', data.toString());
  }
});

socket.on('close', () => {
  console.log(`[ORCHESTRATOR] Connection closed.`);
});

socket.on('error', (err) => {
  console.error(`[ORCHESTRATOR ERROR] WebSocket error:`, err.message);
  console.error(`Are you sure the server is running on ${WS_URL}?`);
});
