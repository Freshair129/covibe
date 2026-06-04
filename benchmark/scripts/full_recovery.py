import re
import os

source_path = r'G:\covibe\benchmark\ui\codev_dashboard_temp.html'
dest_path = r'G:\covibe\codev_dashboard.html'
dest_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(source_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Update Body Tag
content = re.sub(r'<body.*?>', 
                 '<body class="h-screen w-screen flex antialiased selection:bg-accent selection:text-bg-primary bg-bg-primary overflow-hidden">', 
                 content)

# 2. Re-apply Domain-based Top Nav Header
top_domain_bar_html = r"""
    <!-- TOP DOMAIN NAVIGATION -->
    <header class="h-14 border-b border-border bg-bg-secondary flex items-center px-4 gap-4 shrink-0 z-50 shadow-md">
      <div class="flex items-center gap-2 pr-4 border-r border-border h-8">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
          <i class="ti ti-brand-codesandbox text-lg"></i>
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-xs font-black text-white uppercase tracking-tighter">CoDev Workspace</span>
          <span class="text-[9px] text-accent font-bold">CoVibe Project</span>
        </div>
      </div>
      
      <nav class="flex items-center gap-1">
        <button id="domain-btn-overview" onclick="switchDomain('overview')" class="domain-tab-btn active px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-white bg-white/5 border border-white/10">
          <i class="ti ti-layout-dashboard"></i> <span>Overview</span>
        </button>
        <button id="domain-btn-gks" onclick="switchDomain('gks')" class="domain-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-text-tertiary hover:text-white">
          <i class="ti ti-brain"></i> <span>Genesis Knowledge</span>
        </button>
        <button id="domain-btn-gdb" onclick="switchDomain('gdb')" class="domain-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-text-tertiary hover:text-white">
          <i class="ti ti-database"></i> <span>Genesis Block DB</span>
        </button>
        <button id="domain-btn-benchmark" onclick="switchDomain('benchmark')" class="domain-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-text-tertiary hover:text-white">
          <i class="ti ti-trending-up"></i> <span>Benchmark</span>
        </button>
      </nav>
      
      <div class="ml-auto flex items-center gap-3">
        <div id="connection-indicator" class="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span class="text-[10px] font-bold text-emerald-400 font-mono">NODE-01 ONLINE</span>
        </div>
        <button class="w-9 h-9 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-white transition-colors">
          <i class="ti ti-settings text-lg"></i>
        </button>
      </div>
    </header>
"""
content = re.sub(r'<header.*?</header>', top_domain_bar_html, content, flags=re.DOTALL)

# 3. Modern Glass Sidebar and Layout Wrapper
glass_sidebar_html = r"""
    <!-- Main Workspace Area -->
    <main class="flex-1 flex overflow-hidden relative bg-[#0a0d10] h-[calc(100vh-3.5rem)]">
      <!-- MODERN GLASS SIDEBAR -->
      <nav id="glass-sidebar" class="sidebar">
        <div>
          <div class="sb-brand">
            <div id="sidebar-context-icon" class="sb-brand-icon"><i class="ti ti-layout-dashboard"></i></div>
            <div class="sb-brand-text">
              <div id="sidebar-context-title" class="sb-brand-title">Overview</div>
              <div id="sidebar-context-subtitle" class="sb-brand-sub">Project Center</div>
            </div>
          </div>
          <ul id="glass-subnav" class="sb-nav"></ul>
        </div>
        <div class="sb-footer">
          <div class="sb-divider"></div>
          <div id="sidebar-stats-section" class="sb-stats-grid">
            <div class="sb-stat"><span class="sb-stat-val text-accent">$0.049</span><span class="sb-stat-lbl">Cost</span></div>
            <div class="sb-stat"><span class="sb-stat-val" style="color:#818cf8">14</span><span class="sb-stat-lbl">Calls</span></div>
            <div class="sb-stat"><span class="sb-stat-val" style="color:#eab308">28</span><span class="sb-stat-lbl">Tools</span></div>
            <div class="sb-stat"><span class="sb-stat-val" style="color:#60a5fa">37k</span><span class="sb-stat-lbl">In TK</span></div>
            <div class="sb-stat"><span class="sb-stat-val" style="color:#f472b6">4.4k</span><span class="sb-stat-lbl">Out TK</span></div>
            <div class="sb-stat"><span class="sb-stat-val" style="color:#22d3ee">1m 24s</span><span class="sb-stat-lbl">Time</span></div>
          </div>
          <button id="sidebar-toggle-btn" onclick="toggleSidebar()" class="w-full mt-4 flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-all text-text-tertiary">
             <i class="ti ti-chevron-left text-lg" id="sidebar-toggle-icon"></i>
          </button>
        </div>
      </nav>
"""
content = re.sub(r'<main.*?>\s*<aside id="left-sidebar".*?</aside>', glass_sidebar_html, content, flags=re.DOTALL)

# 4. Modular Domain C (GDB) Injection
modular_gdb_html = r"""
      <!-- CENTER VIEW 3: GENESIS BLOCK DB (Domain C) -->
      <div class="hidden flex-1 flex flex-col overflow-hidden relative font-sans" id="gdb-view-container">
        <div class="bg-bg-secondary/60 border-b border-border p-4 flex items-center justify-between backdrop-blur-md">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2"><span class="text-[10px] font-black text-text-tertiary uppercase">Active Model</span><span id="gdb-active-model" class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold">Jina-Code-v5</span></div>
          </div>
        </div>
        <div class="flex-1 overflow-hidden relative">
          <section id="gdb-view-explorer" class="gdb-sub-view h-full flex flex-col p-6 space-y-6">
             <div class="bg-bg-primary/40 border border-border rounded-2xl p-6 shadow-2xl flex-1 overflow-y-auto">
                <h3 class="text-xs font-black text-white uppercase tracking-widest mb-4">Raw Symbol Table</h3>
                <table class="w-full text-left text-[11px] font-mono"><thead class="text-text-tertiary border-b border-white/5 uppercase"><tr><th class="p-3">ID</th><th class="p-3">Type</th><th class="p-3">File</th><th class="p-3">Last Index</th></tr></thead><tbody class="text-text-secondary divide-y divide-white/5"><tr><td class="p-3">calculateDrift</td><td class="p-3 text-accent">Function</td><td class="p-3">gks/algo.ts</td><td class="p-3">2m ago</td></tr></tbody></table>
             </div>
          </section>
          <section id="gdb-view-processing" class="gdb-sub-view hidden h-full flex flex-col p-6 space-y-6">
             <div class="bg-bg-primary/40 border border-border rounded-2xl p-6">
                <h3 class="text-xs font-black text-white uppercase tracking-widest">Graph Intelligence Zoo</h3>
             </div>
          </section>
          <section id="gdb-view-visualizer" class="gdb-sub-view hidden h-full flex flex-col relative"><div id="hnsw-visualizer-canvas"></div></section>
        </div>
      </div>
"""
# Replace old database/vector views
content = re.sub(r'<!-- CENTER VIEW 3: DATABASE.*?</div>\s+<!-- CENTER VIEW 5: VECTOR.*?</div>', modular_gdb_html, content, flags=re.DOTALL)

# 5. Master JS Injection
js_master_logic = r"""
<script>
    let models = {}, selectedModel = '', isPlaying = false;
    let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0, currentDomain = 'overview';
    let sidebarExpanded = true;

    const domainRegistry = {
      overview: {
        title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchTab('simulator') },
          { id: 'roadmap', label: 'Manager Board', icon: 'ti ti-layout-kanban', action: () => switchMainView('roadmap') },
          { id: 'agents', label: 'Agent Roster', icon: 'ti ti-users', action: () => switchTab('training') }
        ]
      },
      gks: {
        title: 'Genesis Knowledge', subtitle: 'Code Intelligence', icon: 'ti ti-brain',
        items: [
          { id: 'structure', label: 'Code Structure', icon: 'ti ti-hierarchy-2', action: () => switchMainView('callgraph') },
          { id: 'logic', label: 'Business Logic', icon: 'ti ti-script', action: () => {} },
          { id: 'graph', label: 'Codebase Graph', icon: 'ti ti-share', action: () => switchMainView('canvas') }
        ]
      },
      gdb: {
        title: 'Block DB', subtitle: 'Atomic Memory', icon: 'ti ti-database',
        items: [
          { id: 'explorer', label: 'Explorer Hub', icon: 'ti ti-table', action: () => switchDomainSubTab('explorer') },
          { id: 'processing', label: 'Processing Lab', icon: 'ti ti-microscope', action: () => switchDomainSubTab('processing') },
          { id: 'retrieval', label: 'Retrieval Studio', icon: 'ti ti-search', action: () => switchDomainSubTab('retrieval') },
          { id: 'symbol-link', label: 'Symbol Linker', icon: 'ti ti-link', action: () => switchDomainSubTab('symbol-link') },
          { id: 'visualizer', label: 'HNSW Space', icon: 'ti ti-binary-tree', action: () => switchDomainSubTab('visualizer') }
        ]
      },
      benchmark: {
        title: 'Benchmark', subtitle: 'Performance', icon: 'ti ti-trending-up',
        items: [
          { id: 'bench-control', label: 'Execution', icon: 'ti ti-player-play', action: () => switchMainView('benchmark') },
          { id: 'telemetry', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchTab('gap-analysis') },
          { id: 'reports', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchTab('campaign') }
        ]
      }
    };

    function switchDomain(domainId) {
      currentDomain = domainId;
      const config = domainRegistry[domainId];
      if (!config) return;

      document.querySelectorAll('.domain-tab-btn').forEach(btn => {
        const isActive = btn.id === `domain-btn-${domainId}`;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('bg-white/5', isActive);
        btn.classList.toggle('border-white/10', isActive);
        btn.classList.toggle('text-text-tertiary', !isActive);
      });

      document.getElementById('sidebar-context-title').textContent = config.title;
      document.getElementById('sidebar-context-subtitle').textContent = config.subtitle;
      document.getElementById('sidebar-context-icon').innerHTML = `<i class="${config.icon}"></i>`;
      
      const navContainer = document.getElementById('glass-subnav');
      if (navContainer) {
        navContainer.innerHTML = config.items.map(item => `
          <li class="sb-item" data-tooltip="${item.label}">
            <button onclick="handleSubNavClick('${item.id}', this)" data-sub-id="${item.id}" class="sb-link sub-nav-item">
              <i class="${item.icon}"></i><span>${item.label}</span>
            </button>
          </li>`).join('');
        if (config.items.length > 0) handleSubNavClick(config.items[0].id, navContainer.querySelector('.sb-link'));
      }
    }

    function handleSubNavClick(itemId, element) {
      document.querySelectorAll('.sb-link').forEach(btn => btn.classList.remove('active'));
      if (element) element.classList.add('active');
      const item = domainRegistry[currentDomain].items.find(i => i.id === itemId);
      if (item && item.action) item.action();
    }

    function switchDomainSubTab(tabId) {
      document.querySelectorAll('.gdb-sub-view').forEach(view => view.classList.add('hidden'));
      const target = document.getElementById(`gdb-view-${tabId}`);
      if (target) target.classList.remove('hidden');
      if (tabId === 'visualizer') setTimeout(initHnswVisualizer, 100);
    }

    function switchMainView(view) {
      const ids = ['roadmap-view', 'workflow-canvas', 'callgraph-view', 'benchmark-view', 'gdb-view-container'];
      ids.forEach(id => { const el = document.getElementById(id); if(el) { el.classList.add('hidden'); el.classList.remove('flex'); } });
      const target = document.getElementById(view + '-view') || document.getElementById(view) || document.getElementById(view + '-container');
      if (target) { target.classList.remove('hidden'); if(view !== 'roadmap') target.classList.add('flex'); }
    }

    function switchTab(tabName) {
      const tabs = ['simulator', 'overview', 'gap-analysis', 'training', 'campaign'];
      tabs.forEach(t => { const el = document.getElementById(`tab-content-${t}`); if(el) el.classList.add('hidden'); });
      let target = tabName === 'dashboard' ? 'simulator' : (tabName === 'roadmap' ? 'overview' : tabName);
      const active = document.getElementById(`tab-content-${target}`);
      if (active) active.classList.remove('hidden');
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('glass-sidebar');
      const toggleIcon = document.getElementById('sidebar-toggle-icon');
      sidebarExpanded = !sidebarExpanded;
      if (sidebar) sidebar.classList.toggle('collapsed');
      if (toggleIcon) toggleIcon.className = sidebarExpanded ? 'ti ti-chevron-left text-lg' : 'ti ti-chevron-right text-lg';
    }

    function setGdbModel(name) { 
      const el = document.getElementById('gdb-active-model');
      if (el) el.textContent = name; 
    }
    
    function runSrsSimulation(q) { console.log(`Querying SRS for: ${q}`); }

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
            const res = await fetch('/benchmark/ui/data/benchmarks.json');
            if (res.ok) models = await res.json();
        } catch(e) {}
    }

    window.onload = () => { switchDomain('overview'); animateReactor(); loadBenchmarkData(); };
</script>
"""
content = re.sub(r'<script>.*?</script>', js_master_logic, content, flags=re.DOTALL)

# Final Encoding Hardening
content = content.replace('—', '—')

with open(dest_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(dest_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Unified Recovery Complete.")
