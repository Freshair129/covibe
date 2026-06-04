import re
import os

source_path = r'G:\covibe\codev_dashboard.html'
dest_path = r'G:\covibe\codev_dashboard.html'
dest_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(source_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Identify the last script block which contains the main logic
script_blocks = list(re.finditer(r'<script>(.*?)</script>', content, flags=re.DOTALL))

if script_blocks:
    main_script_match = script_blocks[-1]
    
    new_logic = r"""
    let currentDomain = 'overview';
    let sidebarExpanded = true;
    let models = {}, selectedModel = '', isPlaying = false;
    let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0;

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

      const titleEl = document.getElementById('sidebar-context-title');
      const subEl = document.getElementById('sidebar-context-subtitle');
      const iconEl = document.getElementById('sidebar-context-icon');
      
      if (titleEl) titleEl.textContent = config.title;
      if (subEl) subEl.textContent = config.subtitle;
      if (iconEl) iconEl.innerHTML = `<i class="${config.icon}"></i>`;

      const navContainer = document.getElementById('glass-subnav');
      if (navContainer) {
          navContainer.innerHTML = config.items.map(item => `
            <li class="sb-item" data-tooltip="${item.label}">
              <button onclick="handleSubNavClick('${item.id}', this)" data-sub-id="${item.id}" class="sb-link sub-nav-item">
                <i class="${item.icon}"></i><span>${item.label}</span>
              </button>
            </li>`).join('');
          
          if (config.items.length > 0) {
            const firstBtn = navContainer.querySelector('.sb-link');
            if (firstBtn) handleSubNavClick(config.items[0].id, firstBtn);
          }
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
      ids.forEach(id => { 
          const el = document.getElementById(id); 
          if(el) { el.classList.add('hidden'); el.classList.remove('flex'); } 
      });
      
      const target = document.getElementById(view + '-view') || document.getElementById(view) || document.getElementById(view + '-container');
      if (target) { 
          target.classList.remove('hidden'); 
          if(view !== 'roadmap') target.classList.add('flex'); 
      }
    }

    function switchTab(tabName) {
      const tabs = ['simulator', 'overview', 'gap-analysis', 'training', 'campaign'];
      tabs.forEach(t => { const el = document.getElementById(`tab-content-${t}`); if(el) el.classList.add('hidden'); });
      let target = tabName === 'dashboard' ? 'simulator' : (tabName === 'roadmap' ? 'overview' : tabName);
      const active = document.getElementById(`tab-content-${target}`);
      if (active) active.classList.remove('hidden');
      if (target === 'campaign') loadCampaignSummary();
      if (target === 'gap-analysis') updateTelemetryChart();
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('glass-sidebar');
      if (sidebar) sidebar.classList.toggle('collapsed');
    }

    function setGdbModel(name) { 
        const el = document.getElementById('gdb-active-model');
        if (el) el.textContent = name; 
    }
    
    function runSrsSimulation(q) { 
        console.log(`Querying SRS for: ${q}`); 
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
            const res = await fetch('data/benchmarks.json');
            if (res.ok) models = await res.json();
        } catch(e) {}
    }

    async function loadCampaignSummary() {
      try {
        const res = await fetch('/benchmark/ui/data/sushirl_summary.json');
        if (!res.ok) return;
        const summary = await res.json();
        const modelNameEl = document.getElementById('summary-model-name');
        if (modelNameEl) modelNameEl.innerText = summary.model_name;
        const pctEl = document.getElementById('summary-completion-pct');
        if (pctEl) pctEl.innerText = `${summary.completion_pct}%`;
        const badge = document.getElementById('summary-overall-badge');
        if (badge) badge.innerText = summary.overall_status;
      } catch (err) {}
    }

    function updateTelemetryChart() {
        console.log("Telemetry Chart Update Triggered");
    }

    window.onload = () => { 
        switchDomain('overview'); 
        animateReactor(); 
        loadBenchmarkData(); 
    };
"""
    content = content[:main_script_match.start(1)] + new_logic + content[main_script_match.end(1):]

with open(dest_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(dest_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Comprehensive JS Recovery Complete.")
