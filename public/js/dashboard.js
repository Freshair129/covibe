/**
 * CoDev Dashboard Core Logic
 * Ported and Modularized from codev_dashboard.html
 */

// --- Global State ---
let currentDomain = 'overview';
let activeModule = 'roadmap';
let sidebarExpanded = true;
let models = {};
let selectedModel = '';
let isPlaying = false;
let telemetryChart = null;
let reactorAngle = 0;
let activeTaskId = null;
let socket = null;
let reconnectTimer = null;
let volume = 0.4;
let synthNote = 'A2';
let audioCtx = null;
let analyser = null;
let synthInterval = null;
let animationFrameId = null;

const domainRegistry = {
  overview: {
    title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
    items: [
      { id: 'roadmap', label: 'Manager Board', icon: 'ti ti-layout-kanban', action: () => switchModule('roadmap') },
      { id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchModule('dashboard') },
      { id: 'agents', label: 'Agent Roster', icon: 'ti ti-users', action: () => switchModule('training') }
    ]
  },
  gks: {
    title: 'Genesis Knowledge', subtitle: 'Code Intelligence', icon: 'ti ti-brain',
    items: [
      { id: 'canvas', label: 'Workflow Canvas', icon: 'ti ti-hierarchy-2', action: () => switchModule('canvas') },
      { id: 'callgraph', label: 'Call Graph', icon: 'ti ti-chart-dots', action: () => switchModule('callgraph') },
      { id: 'logic', label: 'Business Logic', icon: 'ti ti-script', action: () => {} }
    ]
  },
  gdb: {
    title: 'Block DB', subtitle: 'Atomic Memory', icon: 'ti ti-database',
    items: [
      { id: 'database', label: 'Schema Visualizer', icon: 'ti ti-table', action: () => switchModule('database') },
      { id: 'vector', label: 'Vector Store', icon: 'ti ti-binary-tree', action: () => switchModule('vector') }
    ]
  },
  benchmark: {
    title: 'Benchmark', subtitle: 'Performance', icon: 'ti ti-trending-up',
    items: [
      { id: 'dashboard', label: 'Simulator', icon: 'ti ti-player-play', action: () => switchModule('dashboard') },
      { id: 'gap-analysis', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchModule('gap-analysis') },
      { id: 'campaign', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchModule('campaign') }
    ]
  }
};

// --- WebSocket Connection ---
function connectWebSocket() {
  const wsUrl = `ws://${window.location.hostname || 'localhost'}:8787`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    logTerminal('sys', 'Connected to CoDev Agent Server.');
    if (reconnectTimer) { clearInterval(reconnectTimer); reconnectTimer = null; }
    // Request initial telemetry
    sendWs({ type: 'get_telemetry' });
  };

  socket.onclose = () => {
    logTerminal('sys', 'WebSocket connection closed. Retrying in 5s...');
    if (!reconnectTimer) reconnectTimer = setInterval(connectWebSocket, 5000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleSocketMessage(data);
    } catch (err) {
      console.error('Error parsing WS message:', err);
    }
  };
}

function sendWs(msg) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

function handleSocketMessage(data) {
  switch (data.type) {
    case 'telemetry_update':
      updateDashboardStats(data.telemetry);
      break;
    case 'agent_log':
      logTerminal(data.stream === 'stderr' ? 'warn' : 'eva', data.text);
      break;
    case 'agent_status':
      if (activeTaskId === data.taskId) {
        const taskItem = document.querySelector(`.task-item[data-task-id="${activeTaskId}"]`);
        if (taskItem) {
          setTaskItemState(taskItem, data.status === 'success' ? 'done' : 'todo');
          saveStateToStorage();
          calculateRoadmapProgress();
        }
        activeTaskId = null;
      }
      break;
    case 'live_hardware_sample':
      updateHardwareOverlay(data.sample);
      break;
    default:
      // Other messages
  }
}

// --- Domain & Module Switching ---
function switchDomain(domainId) {
  currentDomain = domainId;
  const config = domainRegistry[domainId];
  if (!config) return;

  // Update domain tab buttons
  document.querySelectorAll('.domain-tab-btn').forEach(btn => {
    const isActive = btn.id === `domain-btn-${domainId}`;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('bg-bg-tertiary', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-text-tertiary', !isActive);
  });

  // Update Sidebar Context
  const titleEl = document.getElementById('sidebar-context-title');
  const subEl = document.getElementById('sidebar-context-subtitle');
  const iconEl = document.getElementById('sidebar-context-icon');
  
  if (titleEl) titleEl.textContent = config.title;
  if (subEl) subEl.textContent = config.subtitle;
  if (iconEl) iconEl.innerHTML = `<i class="${config.icon}"></i>`;
  
  // Update Sub-Navigation
  const navContainer = document.getElementById('glass-subnav');
  if (navContainer) {
    navContainer.innerHTML = config.items.map(item => `
      <li class="sb-item" data-tooltip="${item.label}">
        <button onclick="handleSubNavClick('${item.id}', this)" data-sub-id="${item.id}" class="sb-link sub-nav-item">
          <i class="${item.icon}"></i><span>${item.label}</span>
        </button>
      </li>`).join('');
    
    // Default to first item
    if (config.items.length > 0) {
        handleSubNavClick(config.items[0].id, navContainer.querySelector('.sb-link'));
    }
  }
}

function handleSubNavClick(itemId, element) {
  document.querySelectorAll('.sb-link').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
  const item = domainRegistry[currentDomain].items.find(i => i.id === itemId);
  if (item && item.action) item.action();
}

function switchModule(module) {
    activeModule = module;
    const views = ['roadmap-view', 'workflow-canvas', 'callgraph-view', 'database-view', 'vector-view', 'benchmark-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
        }
    });

    const targetId = (module === 'dashboard' || module === 'gap-analysis' || module === 'training' || module === 'campaign') 
        ? 'benchmark-view' 
        : (module === 'canvas' ? 'workflow-canvas' : module + '-view');
    
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.classList.remove('hidden');
        if (targetId !== 'roadmap-view') targetEl.classList.add('flex');
    }

    // Domain-specific inits
    if (module === 'roadmap') renderRoadmap();
    if (module === 'canvas') setTimeout(updateEdges, 100);
    if (module === 'callgraph') initCallGraph();
    if (module === 'database') setTimeout(updateErdEdges, 100);
    if (module === 'vector') initHnswVisualizer();
    
    // Benchmark sub-tabs
    if (targetId === 'benchmark-view') {
        switchTab(module === 'benchmark-view' ? 'dashboard' : module);
    }
}

function switchTab(tabName) {
    const tabs = ['simulator', 'overview', 'gap-analysis', 'training', 'campaign'];
    tabs.forEach(t => { const el = document.getElementById(`tab-content-${t}`); if(el) el.classList.add('hidden'); });
    
    let target = tabName === 'dashboard' ? 'simulator' : tabName;
    const active = document.getElementById(`tab-content-${target}`);
    if (active) active.classList.remove('hidden');
    
    if (target === 'simulator') requestAnimationFrame(resizeCanvas);
    if (target === 'gap-analysis') updateTelemetryChart();
    if (target === 'campaign') loadCampaignSummary();
}

// --- Roadmap Rendering & Logic ---
function renderRoadmap() {
  const container = document.querySelector('.roadmap-container');
  if (!container) return;

  const savedStates = loadState();

  container.innerHTML = ROADMAP_DATA.map(phase => `
    <div class="phase" id="${phase.id}">
      <div class="phase-header" onclick="togglePhase('${phase.id}')">
        <span class="phase-badge ${phase.isFuture ? 'nsm' : phase.id + '-badge'}">${phase.badge}</span>
        <h3 class="phase-title">${phase.title}</h3>
        <div class="phase-header-progress">
          <span class="phase-progress-val" id="${phase.id}-progress-lbl">0%</span>
          <div class="phase-mini-bar">
            <div class="phase-mini-fill" id="${phase.id}-mini-fill" style="width: 0%"></div>
          </div>
        </div>
        <i class="ti ti-chevron-down phase-chevron" id="chevron-${phase.id}"></i>
      </div>
      <div class="phase-body" id="body-${phase.id}">
        <p class="phase-desc">${phase.desc}</p>
        <div class="sprint-grid">
          ${phase.sprints.map(sprint => renderSprint(sprint, savedStates)).join('')}
        </div>
      </div>
    </div>
  `).join('');

  calculateRoadmapProgress();
}

function renderSprint(sprint, savedStates) {
  return `
    <div class="sprint">
      <div class="sprint-header">
        <div class="sprint-identity">
          <span class="sprint-tag ${sprint.tag}">${sprint.tagName}</span>
          <h4 class="sprint-name">${sprint.name}</h4>
        </div>
        <div class="sprint-meta">
          <span class="sprint-percent">0%</span>
          <span class="sprint-dur"><i class="ti ti-calendar"></i> ${sprint.duration}</span>
        </div>
      </div>
      <div class="tasks" data-sprint="${sprint.id}">
        ${sprint.tasks.map(task => renderTask(task, savedStates[task.id])).join('')}
      </div>
      ${sprint.exitCriteria && sprint.exitCriteria.length > 0 ? `
        <div class="exit">
          <div class="exit-label"><i class="ti ti-flag"></i> Exit Criteria</div>
          <div class="exit-items">
            ${sprint.exitCriteria.map(item => `
              <div class="exit-item"><i class="ti ti-circle-check"></i> <span>${item}</span></div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderTask(task, savedTask) {
  const doc = savedTask ? !!savedTask.doc : (task.state === 'done');
  const code = savedTask ? !!savedTask.code : (task.state === 'done');
  const test = savedTask ? !!savedTask.test : (task.state === 'done');
  const assignee = savedTask ? savedTask.assignee : 'none';
  const state = (doc && code && test) ? 'done' : (doc ? 'pending' : 'todo');

  return `
    <div class="task-item" data-task-id="${task.id}" data-state="${state}" 
         data-doc="${doc}" data-code="${code}" data-test="${test}" onclick="handleTaskClick(this)">
      <span class="task-status-indicator shrink-0">
        <i class="ti ${state === 'done' ? 'ti-circle-check-filled text-accent' : (state === 'pending' ? 'ti-circle-half-2 text-yellow-500' : 'ti-circle text-text-tertiary')} text-sm"></i>
      </span>
      <span class="task-text truncate flex-1 min-w-0 flex items-center gap-2">
        <i class="ti ${getTaskIcon(task.text)} text-text-secondary text-sm"></i>
        <span>${task.text}</span>
      </span>
      <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
        <span class="text-[9px] text-text-tertiary">Assist:</span>
        <select class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent" onchange="saveStateToStorage()">
          <option value="none" ${assignee === 'none' ? 'selected' : ''}>Unassigned</option>
          <option value="eva" ${assignee === 'eva' ? 'selected' : ''}>EVA Agent</option>
          <option value="qwen" ${assignee === 'qwen' ? 'selected' : ''}>Qwen Coder</option>
          <option value="local" ${assignee === 'local' ? 'selected' : ''}>Local Dev</option>
        </select>
      </div>
      <div class="verif-icons flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
        <button onclick="toggleDoc(this.closest('.task-item'))" class="verif-icon-btn doc-btn ${doc ? 'active' : ''}" title="Doc Verification">
          <i class="ti ti-file-description"></i>
        </button>
        <button onclick="toggleCode(this.closest('.task-item'))" class="verif-icon-btn code-btn ${code ? 'active' : (!doc ? 'disabled' : '')}" title="Code Verification">
          <i class="ti ti-code"></i>
        </button>
        <button onclick="toggleTest(this.closest('.task-item'))" class="verif-icon-btn test-btn ${test ? 'active' : (!code ? 'disabled' : '')}" title="Test Verification">
          <i class="ti ti-flask"></i>
        </button>
      </div>
      <span class="status-badge status-pending shrink-0"><span class="pulse-dot"></span>Waiting...</span>
      <span class="status-badge status-done shrink-0">Done</span>
    </div>
  `;
}

function getTaskIcon(text) {
  const lower = text.toLowerCase();
  if (lower.includes('react') || lower.includes('vite')) return 'ti-brand-react';
  if (lower.includes('websocket') || lower.includes('sync')) return 'ti-arrows-exchange';
  if (lower.includes('backend') || lower.includes('node')) return 'ti-server';
  if (lower.includes('database') || lower.includes('db')) return 'ti-database';
  if (lower.includes('qr')) return 'ti-qrcode';
  if (lower.includes('ios') || lower.includes('android') || lower.includes('safari') || lower.includes('chrome') || lower.includes('mobile')) return 'ti-device-mobile';
  if (lower.includes('test') || lower.includes('วัด')) return 'ti-flask';
  if (lower.includes('ui') || lower.includes('ux') || lower.includes('css')) return 'ti-palette';
  if (lower.includes('audio') || lower.includes('เพลง') || lower.includes('player') || lower.includes('youtube')) return 'ti-music';
  return 'ti-settings';
}

function handleTaskClick(taskItem) {
    const state = taskItem.getAttribute('data-state');
    const taskId = taskItem.getAttribute('data-task-id');
    const taskText = taskItem.querySelector('.task-text').textContent.trim();
    const assistSelect = taskItem.querySelector('.assist-to-select');
    const agent = assistSelect ? assistSelect.value : 'none';

    if (state === 'done') return;
    if (state === 'pending') {
        logTerminal('sys', `Task "${taskText}" is currently running...`);
        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        logTerminal('warn', 'Local CoDev Server is offline. Please start the server first.');
        return;
    }

    activeTaskId = taskId;
    setTaskItemState(taskItem, 'pending');
    saveStateToStorage();
    calculateRoadmapProgress();

    logTerminal('sys', `Queuing task: "${taskText}" using agent: ${agent}`);
    sendWs({
        type: 'run_agent_task',
        taskId,
        agent,
        taskText
    });
}

function setTaskItemState(taskItem, stateData) {
    let doc = false, code = false, test = false;
    if (stateData === 'done') { doc = true; code = true; test = true; }
    else if (stateData === 'pending') { doc = true; code = false; test = false; }
    else if (typeof stateData === 'object') {
        doc = !!stateData.doc;
        code = !!stateData.code;
        test = !!stateData.test;
    }

    let state = (doc && code && test) ? 'done' : (doc ? 'pending' : 'todo');
    taskItem.setAttribute('data-state', state);
    taskItem.dataset.doc = doc;
    taskItem.dataset.code = code;
    taskItem.dataset.test = test;

    // Update buttons
    const docBtn = taskItem.querySelector('.doc-btn');
    const codeBtn = taskItem.querySelector('.code-btn');
    const testBtn = taskItem.querySelector('.test-btn');
    if (docBtn) docBtn.classList.toggle('active', doc);
    if (codeBtn) { codeBtn.classList.toggle('active', code); codeBtn.classList.toggle('disabled', !doc); }
    if (testBtn) { testBtn.classList.toggle('active', test); testBtn.classList.toggle('disabled', !code); }

    // Update indicator
    const indicator = taskItem.querySelector('.task-status-indicator i');
    if (indicator) {
        indicator.className = `ti ${state === 'done' ? 'ti-circle-check-filled text-accent' : (state === 'pending' ? 'ti-circle-half-2 text-yellow-500' : 'ti-circle text-text-tertiary')} text-sm`;
    }
}

function toggleDoc(taskItem) {
    const doc = !(taskItem.dataset.doc === 'true');
    setTaskItemState(taskItem, { doc, code: false, test: false });
    saveStateToStorage();
    calculateRoadmapProgress();
}

function toggleCode(taskItem) {
    if (taskItem.dataset.doc !== 'true') return;
    const code = !(taskItem.dataset.code === 'true');
    setTaskItemState(taskItem, { doc: true, code, test: false });
    saveStateToStorage();
    calculateRoadmapProgress();
}

function toggleTest(taskItem) {
    if (taskItem.dataset.code !== 'true') return;
    const test = !(taskItem.dataset.test === 'true');
    setTaskItemState(taskItem, { doc: true, code: true, test });
    saveStateToStorage();
    calculateRoadmapProgress();
}

function saveStateToStorage() {
    const currentState = {};
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const taskId = taskItem.getAttribute('data-task-id');
        if (!taskId) return;
        currentState[taskId] = {
            doc: taskItem.dataset.doc === 'true',
            code: taskItem.dataset.code === 'true',
            test: taskItem.dataset.test === 'true',
            assignee: taskItem.querySelector('.assist-to-select').value
        };
    });
    localStorage.setItem('covibe_roadmap_states_v3', JSON.stringify(currentState));
}

function loadState() {
    const saved = localStorage.getItem('covibe_roadmap_states_v3');
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
}

function calculateRoadmapProgress() {
    const phases = ROADMAP_DATA.map(p => p.id);
    phases.forEach(phaseId => {
        const phaseEl = document.getElementById(phaseId);
        if (!phaseEl) return;
        const tasks = phaseEl.querySelectorAll('.task-item');
        const done = Array.from(tasks).filter(t => t.getAttribute('data-state') === 'done').length;
        const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
        
        const miniFill = document.getElementById(`${phaseId}-mini-fill`);
        const lbl = document.getElementById(`${phaseId}-progress-lbl`);
        if (miniFill) miniFill.style.width = `${pct}%`;
        if (lbl) lbl.textContent = `${pct}%`;

        // Sprint progress
        phaseEl.querySelectorAll('.sprint').forEach(sprint => {
            const sTasks = sprint.querySelectorAll('.task-item');
            const sDone = Array.from(sTasks).filter(t => t.getAttribute('data-state') === 'done').length;
            const sPct = sTasks.length > 0 ? Math.round((sDone / sTasks.length) * 100) : 0;
            const sLbl = sprint.querySelector('.sprint-percent');
            if (sLbl) sLbl.textContent = `${sDone}/${sTasks.length} - ${sPct}%`;
        });
    });
}

function togglePhase(phaseId) {
    const body = document.getElementById(`body-${phaseId}`);
    const chevron = document.getElementById(`chevron-${phaseId}`);
    if (body) body.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
}

// --- Visualizer Engines ---

function initCallGraph() {
    const container = document.getElementById('cy-container');
    if (!container || (window.cy && window.cy.elements().length > 0)) return;
    
    window.cy = cytoscape({
        container: container,
        elements: [
            { data: { id: 'App', label: 'App.tsx' } },
            { data: { id: 'Server', label: 'index.js' } },
            { data: { source: 'App', target: 'Server' } }
        ],
        style: [
            { selector: 'node', style: { 'label': 'data(label)', 'background-color': '#475569', 'color': '#fff', 'font-size': '10px', 'text-valign': 'center' } },
            { selector: 'edge', style: { 'width': 2, 'line-color': '#1e293b', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#1e293b', 'curve-style': 'bezier' } }
        ],
        layout: { name: 'cose' }
    });
}

let vectorDocs = [
  { id: "FEAT--IDENTITY", label: 0, text: "Identity Engine managing soul profiles.", layer2: true, layer1: true, layer0: true, x: 20 },
  { id: "SPEC--GENESIS-BLOCK", label: 1, text: "Specification detailing block storage.", layer2: false, layer1: false, layer0: true, x: 25 },
  { id: "CONCEPT--TAXONOMY", label: 2, text: "Taxonomy of atomic knowledge.", layer2: false, layer1: true, layer0: true, x: 35 },
  { id: "ADR--MONOREPO", label: 3, text: "Decision record migrating GKS engine.", layer2: false, layer1: false, layer0: true, x: 45 },
  { id: "CORE--MEMORY", label: 4, text: "Memory orchestrator via vector layers.", layer2: true, layer1: true, layer0: true, x: 75 }
];

function initHnswVisualizer() {
    renderHnswGraph();
    setTimeout(drawHnswEdges, 100);
}

function renderHnswGraph() {
    const l0 = document.getElementById('hnsw-nodes-layer-0');
    if (!l0) return;
    l0.innerHTML = '';
    vectorDocs.forEach(doc => {
        const div = document.createElement('div');
        div.className = "hnsw-visual-node absolute w-6 h-6 rounded-lg bg-emerald-600 border border-emerald-400/50 flex items-center justify-center text-[9px] font-bold text-white shadow-lg cursor-pointer hover:scale-110 transition-transform";
        div.style.left = `${doc.x}%`;
        div.style.top = `${20 + (doc.label % 3) * 20}%`;
        div.innerHTML = doc.label;
        div.title = doc.id;
        l0.appendChild(div);
    });
}

function drawHnswEdges() {
    const svg = document.getElementById('hnsw-svg-canvas');
    if (!svg) return;
    svg.innerHTML = '';
    // Draw simple proximity lines for demonstration
    for (let i = 0; i < vectorDocs.length - 1; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${vectorDocs[i].x}%`);
        line.setAttribute('y1', `${30 + (vectorDocs[i].label % 3) * 20}%`);
        line.setAttribute('x2', `${vectorDocs[i+1].x}%`);
        line.setAttribute('y2', `${30 + (vectorDocs[i+1].label % 3) * 20}%`);
        line.setAttribute('stroke', 'rgba(120, 244, 191, 0.2)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
}

function runVectorSearch() {
    const input = document.getElementById('vector-query-input');
    const query = input.value.trim();
    if (!query) return;
    logTerminal('sys', `Starting HNSW Vector Search for: "${query}"`);
    setTimeout(() => {
        logTerminal('eva', "Greedy search complete. Nearest neighbor found: CORE--MEMORY (Similarity: 0.982)");
    }, 1000);
}

// --- Terminal & Utilities ---
function logTerminal(type, text) {
    const term = document.getElementById('terminal-output');
    if (!term) return;
    const line = document.createElement('div');
    line.className = 'terminal-line mb-1 flex gap-2';
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    let tag = `<span class="text-text-tertiary">[${time}]</span> `;
    if (type === 'sys') tag += `<span class="text-[#5fb1ad] font-bold">[SYS]</span> `;
    else if (type === 'eva') tag += `<span class="text-accent font-bold">[EVA]</span> `;
    else if (type === 'warn') tag += `<span class="text-yellow-500 font-bold">[WRN]</span> `;
    
    line.innerHTML = `${tag} <span class="text-gray-300 flex-1">${text}</span>`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}

function handleTerminalInput(e) {
    if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) {
            logTerminal('user', val);
            e.target.value = '';
            sendWs({ type: 'run_agent_task', agent: 'eva', taskText: val, taskId: 'manual-' + Date.now() });
        }
    }
}

function toggleTerminal() {
    const term = document.getElementById('floating-terminal');
    if (term) term.classList.toggle('expanded');
}

function toggleSidebar() {
    const sb = document.getElementById('glass-sidebar');
    sidebarExpanded = !sidebarExpanded;
    sb.classList.toggle('collapsed', !sidebarExpanded);
}

function animateReactor() {
    const canvas = document.getElementById('reactor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,180,180);
    reactorAngle += 0.04;
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(90, 90, 60, 0, Math.PI*2); ctx.stroke();
    for(let i=0; i<4; i++) {
        let a = reactorAngle + (Math.PI*0.5)*i;
        ctx.fillStyle = '#06b6d4'; ctx.shadowBlur = 10; ctx.shadowColor = '#06b6d4'; ctx.beginPath(); ctx.arc(90 + Math.cos(a)*60, 90 + Math.sin(a)*60, 4, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(animateReactor);
}

async function loadBenchmarkData() {
    try {
        const res = await fetch('/data/benchmarks.json');
        if (res.ok) models = await res.json();
    } catch(e) {}
}

function updateDashboardStats(data) {
    if (!data) return;
    const costEl = document.getElementById('stat-cost');
    const callsEl = document.getElementById('stat-calls');
    const toolsEl = document.getElementById('stat-tools');
    if (costEl) costEl.textContent = `$${(data.total_cost || 0).toFixed(4)}`;
    if (callsEl) callsEl.textContent = data.total_calls || 0;
    if (toolsEl) toolsEl.textContent = data.total_tools || 0;
}

function updateHardwareOverlay(sample) {
    if (!sample) return;
    const tempVal = document.getElementById('gpu-temp-val');
    const tempBar = document.getElementById('gpu-temp-bar');
    if (tempVal) tempVal.textContent = `${sample.temp}°C`;
    if (tempBar) {
        tempBar.style.width = `${Math.min(100, sample.temp)}%`;
        tempBar.style.backgroundColor = sample.temp > 80 ? '#ef4444' : (sample.temp > 65 ? '#f97316' : '#10b981');
    }
}

function startWorkflow() {
    logTerminal('sys', 'Initializing AST Simulation...');
    switchModule('canvas');
    setTimeout(() => {
        logTerminal('eva', 'Traversing node: Program -> FunctionDeclaration (calculateDrift)');
        document.getElementById('node-agent').classList.add('active-node');
        setTimeout(() => {
            const modal = document.getElementById('hitl-modal');
            if (modal) modal.classList.add('opacity-100', 'pointer-events-auto');
        }, 1500);
    }, 1000);
}

function resolveHitl(approved) {
    const modal = document.getElementById('hitl-modal');
    if (modal) modal.classList.remove('opacity-100', 'pointer-events-auto');
    logTerminal('sys', approved ? 'User approved transformation. Resuming...' : 'User denied transformation. Halting.');
    document.getElementById('node-agent').classList.remove('active-node');
}

// --- Initialization ---
window.onload = () => {
  connectWebSocket();
  switchDomain('overview');
  animateReactor();
  loadBenchmarkData();
};