< !DOCTYPE html >
    <html lang="th">

        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>CoDev - Agent Command Center</title>
                    <link rel="icon" href="/icon.svg" type="image/svg+xml">

                        <!-- Fonts -->
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                <link
                                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
                                    rel="stylesheet">

                                    <!-- Icons -->
                                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">

                                        <!-- Cytoscape.js -->
                                        <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.26.0/cytoscape.min.js"></script>

                                        <!-- Tailwind CSS -->

                                        <script>
                                            let models = { }, selectedModel = '', isPlaying = false;
                                            let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0, currentDomain = 'overview';
                                            let sidebarExpanded = true;

                                            const domainRegistry = {
                                                overview: {
                                                title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
                                            items: [
                                            {id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchTab('simulator') },
                                            {id: 'roadmap', label: 'Manager Board', icon: 'ti ti-layout-kanban', action: () => switchMainView('roadmap') },
                                            {id: 'agents', label: 'Agent Roster', icon: 'ti ti-users', action: () => switchTab('training') }
                                            ]
      },
                                            gks: {
                                                title: 'Genesis Knowledge', subtitle: 'Code Intelligence', icon: 'ti ti-brain',
                                            items: [
                                            {id: 'structure', label: 'Code Structure', icon: 'ti ti-hierarchy-2', action: () => switchMainView('callgraph') },
                                            {id: 'logic', label: 'Business Logic', icon: 'ti ti-script', action: () => { } },
                                            {id: 'graph', label: 'Codebase Graph', icon: 'ti ti-share', action: () => switchMainView('canvas') }
                                            ]
      },
                                            gdb: {
                                                title: 'Block DB', subtitle: 'Atomic Memory', icon: 'ti ti-database',
                                            items: [
                                            {id: 'explorer', label: 'Explorer Hub', icon: 'ti ti-table', action: () => switchDomainSubTab('explorer') },
                                            {id: 'processing', label: 'Processing Lab', icon: 'ti ti-microscope', action: () => switchDomainSubTab('processing') },
                                            {id: 'retrieval', label: 'Retrieval Studio', icon: 'ti ti-search', action: () => switchDomainSubTab('retrieval') },
                                            {id: 'symbol-link', label: 'Symbol Linker', icon: 'ti ti-link', action: () => switchDomainSubTab('symbol-link') },
                                            {id: 'visualizer', label: 'HNSW Space', icon: 'ti ti-binary-tree', action: () => switchDomainSubTab('visualizer') }
                                            ]
      },
                                            benchmark: {
                                                title: 'Benchmark', subtitle: 'Performance', icon: 'ti ti-trending-up',
                                            items: [
                                            {id: 'bench-control', label: 'Execution', icon: 'ti ti-player-play', action: () => switchMainView('benchmark') },
                                            {id: 'telemetry', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchTab('gap-analysis') },
                                            {id: 'reports', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchTab('campaign') }
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
      ids.forEach(id => { const el = document.getElementById(id); if(el) {el.classList.add('hidden'); el.classList.remove('flex'); } });
                                            const target = document.getElementById(view + '-view') || document.getElementById(view) || document.getElementById(view + '-container');
                                            if (target) {target.classList.remove('hidden'); if(view !== 'roadmap') target.classList.add('flex'); }
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

                                            function runSrsSimulation(q) {console.log(`Querying SRS for: ${q}`); }

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
        } catch(e) { }
    }

    window.onload = () => {switchDomain('overview'); animateReactor(); loadBenchmarkData(); };
                                        </script>

                                        <script src="https://cdn.tailwindcss.com"></script>

                                        <script>
                                            let models = { }, selectedModel = '', isPlaying = false;
                                            let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0, currentDomain = 'overview';
                                            let sidebarExpanded = true;

                                            const domainRegistry = {
                                                overview: {
                                                title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
                                            items: [
                                            {id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchTab('simulator') },
                                            {id: 'roadmap', label: 'Manager Board', icon: 'ti ti-layout-kanban', action: () => switchMainView('roadmap') },
                                            {id: 'agents', label: 'Agent Roster', icon: 'ti ti-users', action: () => switchTab('training') }
                                            ]
      },
                                            gks: {
                                                title: 'Genesis Knowledge', subtitle: 'Code Intelligence', icon: 'ti ti-brain',
                                            items: [
                                            {id: 'structure', label: 'Code Structure', icon: 'ti ti-hierarchy-2', action: () => switchMainView('callgraph') },
                                            {id: 'logic', label: 'Business Logic', icon: 'ti ti-script', action: () => { } },
                                            {id: 'graph', label: 'Codebase Graph', icon: 'ti ti-share', action: () => switchMainView('canvas') }
                                            ]
      },
                                            gdb: {
                                                title: 'Block DB', subtitle: 'Atomic Memory', icon: 'ti ti-database',
                                            items: [
                                            {id: 'explorer', label: 'Explorer Hub', icon: 'ti ti-table', action: () => switchDomainSubTab('explorer') },
                                            {id: 'processing', label: 'Processing Lab', icon: 'ti ti-microscope', action: () => switchDomainSubTab('processing') },
                                            {id: 'retrieval', label: 'Retrieval Studio', icon: 'ti ti-search', action: () => switchDomainSubTab('retrieval') },
                                            {id: 'symbol-link', label: 'Symbol Linker', icon: 'ti ti-link', action: () => switchDomainSubTab('symbol-link') },
                                            {id: 'visualizer', label: 'HNSW Space', icon: 'ti ti-binary-tree', action: () => switchDomainSubTab('visualizer') }
                                            ]
      },
                                            benchmark: {
                                                title: 'Benchmark', subtitle: 'Performance', icon: 'ti ti-trending-up',
                                            items: [
                                            {id: 'bench-control', label: 'Execution', icon: 'ti ti-player-play', action: () => switchMainView('benchmark') },
                                            {id: 'telemetry', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchTab('gap-analysis') },
                                            {id: 'reports', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchTab('campaign') }
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
      ids.forEach(id => { const el = document.getElementById(id); if(el) {el.classList.add('hidden'); el.classList.remove('flex'); } });
                                            const target = document.getElementById(view + '-view') || document.getElementById(view) || document.getElementById(view + '-container');
                                            if (target) {target.classList.remove('hidden'); if(view !== 'roadmap') target.classList.add('flex'); }
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

                                            function runSrsSimulation(q) {console.log(`Querying SRS for: ${q}`); }

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
        } catch(e) { }
    }

    window.onload = () => {switchDomain('overview'); animateReactor(); loadBenchmarkData(); };
                                        </script>


                                        <style>
                                            :root {
                                                --color - card - bg: rgba(20, 26, 32, 0.65);
                                            --color-border-dim: rgba(255, 255, 255, 0.08);
                                            --color-border-hover-dim: rgba(255, 255, 255, 0.16);
                                            --color-text-primary-dim: #f3f7f4;
                                            --color-text-secondary-dim: #a8b6b0;
                                            --color-text-tertiary-dim: #6b7c75;
                                            --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

                                            /* Phase Card & Sprint Card styles from covibe_roadmap.html */
                                            .phase {
                                                background: var(--color-card-bg);
                                            border: 1px solid var(--color-border-dim);
                                            border-radius: 16px;
                                            overflow: hidden;
                                            backdrop-filter: blur(12px);
                                            -webkit-backdrop-filter: blur(12px);
                                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                                            transition: var(--transition-smooth);
                                            margin-bottom: 1.25rem;
    }

                                            .phase:hover {
                                                border - color: var(--color-border-hover-dim);
                                            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }

                                            .phase-header {
                                                display: flex;
                                            align-items: center;
                                            gap: 14px;
                                            padding: 1.25rem 1.5rem;
                                            cursor: pointer;
                                            user-select: none;
                                            background: rgba(255, 255, 255, 0.02);
                                            transition: var(--transition-smooth);
    }

                                            .phase-header:hover {
                                                background: rgba(255, 255, 255, 0.04);
    }

                                            .phase-badge {
                                                font - size: 0.7rem;
                                            font-weight: 700;
                                            padding: 4px 10px;
                                            border-radius: 99px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.03em;
                                            flex-shrink: 0;
    }

                                            .phase-title {
                                                font - size: 0.95rem;
                                            font-weight: 600;
                                            color: var(--color-text-primary-dim);
                                            flex: 1;
                                            font-family: 'Plus Jakarta Sans', sans-serif;
    }

                                            .phase-header-progress {
                                                display: flex;
                                            align-items: center;
                                            gap: 10px;
                                            flex-shrink: 0;
    }

                                            .phase-progress-val {
                                                font - size: 0.8rem;
                                            font-weight: 700;
                                            color: var(--color-text-secondary-dim);
                                            font-family: 'Inter', monospace;
                                            width: 40px;
                                            text-align: right;
    }

                                            .phase-mini-bar {
                                                width: 60px;
                                            height: 6px;
                                            background: rgba(255, 255, 255, 0.05);
                                            border-radius: 99px;
                                            overflow: hidden;
                                            display: none;
    }

                                            @media (min-width: 520px) {
      .phase - mini - bar {
                                                display: block;
      }
    }

                                            .phase-mini-fill {
                                                height: 100%;
                                            background: #78f4bf;
                                            width: 0%;
                                            border-radius: 99px;
                                            transition: width 0.6s ease;
    }

                                            .phase-chevron {
                                                font - size: 1.1rem;
                                            color: var(--color-text-secondary-dim);
                                            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                                            flex-shrink: 0;
    }

                                            .phase-chevron.open {
                                                transform: rotate(180deg);
                                            color: #78f4bf;
    }

                                            .phase-body {
                                                border - top: 1px solid var(--color-border-dim);
                                            padding: 1.5rem;
                                            display: none;
                                            background: rgba(0, 0, 0, 0.12);
    }

                                            .phase-body.open {
                                                display: block;
    }

                                            .phase-desc {
                                                font - size: 0.875rem;
                                            color: var(--color-text-secondary-dim);
                                            margin-bottom: 1.5rem;
                                            line-height: 1.6;
                                            border-left: 2px solid var(--color-border-dim);
                                            padding-left: 12px;
    }

                                            .sprint-grid {
                                                display: flex;
                                            flex-direction: column;
                                            gap: 1.25rem;
    }

                                            .sprint {
                                                background: rgba(255, 255, 255, 0.03);
                                            border: 1px solid var(--color-border-dim);
                                            border-radius: 12px;
                                            padding: 1.25rem;
                                            margin-bottom: 1rem;
                                            box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
                                            transition: var(--transition-smooth);
    }

                                            .sprint:hover {
                                                border - color: var(--color-border-hover-dim);
                                            background: rgba(255, 255, 255, 0.05);
    }

                                            .sprint-header {
                                                display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            gap: 10px;
                                            margin-bottom: 0.75rem;
                                            flex-wrap: wrap;
                                            border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
                                            padding-bottom: 0.5rem;
    }

                                            .sprint-identity {
                                                display: flex;
                                            align-items: center;
                                            gap: 10px;
                                            flex: 1;
    }

                                            .sprint-tag {
                                                font - size: 0.65rem;
                                            font-weight: 700;
                                            padding: 3px 8px;
                                            border-radius: 99px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.03em;
    }

                                            .sprint-name {
                                                font - size: 0.925rem;
                                            font-weight: 600;
                                            color: #ffffff;
    }

                                            .sprint-meta {
                                                display: flex;
                                            align-items: center;
                                            gap: 12px;
    }

                                            .sprint-percent {
                                                font - size: 0.75rem;
                                            font-weight: 700;
                                            color: var(--color-text-secondary-dim);
                                            font-family: 'Inter', monospace;
                                            background: rgba(255, 255, 255, 0.03);
                                            padding: 2px 8px;
                                            border-radius: 6px;
                                            border: 1px solid rgba(255, 255, 255, 0.04);
    }

                                            .sprint-dur {
                                                font - size: 0.75rem;
                                            color: var(--color-text-tertiary-dim);
                                            display: flex;
                                            align-items: center;
                                            gap: 4px;
    }

                                            .exit {
                                                background: rgba(255, 255, 255, 0.01);
                                            border-top: 1px dashed rgba(255, 255, 255, 0.06);
                                            margin-top: 0.75rem;
                                            padding-top: 0.75rem;
    }

                                            .exit-label {
                                                font - size: 0.7rem;
                                            font-weight: 700;
                                            color: var(--color-text-tertiary-dim);
                                            text-transform: uppercase;
                                            letter-spacing: 0.05em;
                                            margin-bottom: 6px;
                                            display: flex;
                                            align-items: center;
                                            gap: 4px;
    }

                                            .exit-items {
                                                display: flex;
                                            flex-direction: column;
                                            gap: 5px;
    }

                                            .exit-item {
                                                font - size: 0.75rem;
                                            color: var(--color-text-secondary-dim);
                                            display: flex;
                                            gap: 6px;
                                            align-items: flex-start;
                                            line-height: 1.4;
    }

                                            .exit-item i {
                                                font - size: 0.85rem;
                                            color: #34d399;
                                            margin-top: 2px;
                                            flex-shrink: 0;
    }

                                            /* Badges Color Palettes */
                                            .p0-badge,
                                            .s0 {
                                                background: rgba(12, 68, 124, 0.2);
                                            color: #7cb2ec;
                                            border: 1px solid rgba(12, 68, 124, 0.4);
    }

                                            .p1-badge,
                                            .s1 {
                                                background: rgba(39, 80, 10, 0.2);
                                            color: #9be25b;
                                            border: 1px solid rgba(39, 80, 10, 0.4);
    }

                                            .p2-badge,
                                            .s2 {
                                                background: rgba(60, 52, 137, 0.25);
                                            color: #9c95f7;
                                            border: 1px solid rgba(60, 52, 137, 0.4);
    }

                                            .p3-badge,
                                            .s3 {
                                                background: rgba(99, 56, 6, 0.25);
                                            color: #fab65a;
                                            border: 1px solid rgba(99, 56, 6, 0.4);
    }

                                            .nsm {
                                                background: rgba(255, 255, 255, 0.05);
                                            color: var(--color-text-secondary-dim);
                                            border: 1px solid rgba(255, 255, 255, 0.08);
    }

                                            .doc-chk,
                                            .code-chk {
                                                accent - color: #78f4bf;
                                            cursor: pointer;
    }

                                            .doc-chk:disabled,
                                            .code-chk:disabled {
                                                cursor: not-allowed;
                                            opacity: 0.4;
    }

                                            body {
                                                background - color: theme('colors.bg.primary');
                                            background-image: radial-gradient(circle at top, rgba(16, 20, 24, 0.9) 0%, rgba(10, 13, 16, 1) 100%);
                                            color: theme('colors.text.primary');
                                            overflow: hidden;
    }

                                            /* Custom Scrollbar */
                                            ::-webkit-scrollbar {
                                                width: 6px;
                                            height: 6px;
    }

                                            ::-webkit-scrollbar-track {
                                                background: transparent;
    }

                                            ::-webkit-scrollbar-thumb {
                                                background: rgba(255, 255, 255, 0.12);
                                            border-radius: 99px;
    }

                                            ::-webkit-scrollbar-thumb:hover {
                                                background: rgba(255, 255, 255, 0.25);
    }

                                            /* Canvas Grid */
                                            .bg-grid {
                                                background - size: 24px 24px;
                                            background-image: radial-gradient(circle, theme('colors.border.DEFAULT') 1px, transparent 1px);
    }

                                            /* =========================================================
                                               1. TASK ITEMS (3-State Design)
                                               ========================================================= */
                                            .task-item {
                                                display: flex;
                                            align-items: center;
                                            gap: 10px;
                                            position: relative;
                                            padding: 6px 10px;
                                            border-radius: 6px;
                                            transition: all 0.3s ease;
                                            background: transparent;
                                            border: 1px solid transparent;
                                            margin-bottom: 4px;
                                            cursor: pointer;
    }

                                            .task-item:hover {
                                                background: rgba(255, 255, 255, 0.02);
    }

                                            .task-text {
                                                font - size: 0.85rem;
                                            color: theme('colors.text.primary');
                                            display: flex;
                                            gap: 6px;
                                            align-items: center;
                                            flex: 1;
                                            min-width: 0;
                                            word-break: break-word;
    }

                                            /* DONE */
                                            .task-item[data-state="done"] .task-text {
                                                color: var(--color-text-tertiary-dim);
                                            text-decoration: line-through;
                                            text-decoration-color: rgba(255, 255, 255, 0.15);
    }

                                            /* Status Badges */
                                            .status-badge {
                                                display: none;
                                            font-size: 0.65rem;
                                            font-weight: 600;
                                            padding: 2px 8px;
                                            border-radius: 4px;
                                            margin-left: auto;
                                            align-items: center;
                                            flex-shrink: 0;
                                            white-space: nowrap;
    }

                                            .task-item[data-state="pending"] .status-pending {
                                                display: inline-flex;
                                            background: rgba(250, 182, 90, 0.1);
                                            color: #fab65a;
                                            border: 1px solid rgba(250, 182, 90, 0.2);
    }

                                            .task-item[data-state="done"] .status-done {
                                                display: inline-flex;
                                            background: theme('colors.accent.dim');
                                            color: theme('colors.accent.DEFAULT');
                                            border: 1px solid rgba(120, 244, 191, 0.2);
    }

                                            .pulse-dot {
                                                width: 6px;
                                            height: 6px;
                                            border-radius: 50%;
                                            display: inline-block;
                                            margin-right: 6px;
                                            background-color: #fab65a;
                                            animation: pulse-yellow 1.6s infinite;
    }

                                            @keyframes pulse-yellow {

                                                0 %,
                                                100 % {
                                                    box- shadow: 0 0 0 0 rgba(250, 182, 90, 0.7);
      }

                                            50% {
                                                box - shadow: 0 0 0 4px rgba(250, 182, 90, 0);
      }
    }

                                            /* =========================================================
                                               2. ROADMAP VIEW
                                               ========================================================= */
                                            .roadmap-container {
                                                width: 100%;
                                            max-width: 860px;
                                            margin: 0 auto;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 1.5rem;
    }

                                            .progress-track {
                                                background: rgba(255, 255, 255, 0.05);
                                            height: 8px;
                                            border-radius: 99px;
                                            overflow: hidden;
    }

                                            .progress-fill {
                                                height: 100%;
                                            background: linear-gradient(90deg, #34d399 0%, theme('colors.accent.DEFAULT') 100%);
                                            transition: width 0.5s ease;
                                            box-shadow: 0 0 10px theme('colors.accent.glow');
    }

                                            /* =========================================================
                                               3. WORKFLOW STUDIO (Node Editor)
                                               ========================================================= */
                                            .workflow-node {
                                                position: absolute;
                                            width: 260px;
                                            background: rgba(16, 20, 24, 0.95);
                                            backdrop-filter: blur(12px);
                                            border: 1px solid theme('colors.border.DEFAULT');
                                            border-radius: 12px;
                                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                                            z-index: 10;
                                            user-select: none;
                                            transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }

                                            .workflow-node:hover {
                                                border - color: rgba(255, 255, 255, 0.2);
    }

                                            .workflow-node.active-node {
                                                border - color: theme('colors.accent.DEFAULT');
                                            box-shadow: 0 0 15px theme('colors.accent.glow');
    }

                                            .workflow-node.waiting-node {
                                                border - color: #60a5fa;
                                            animation: pulseBorder 2s infinite;
    }

                                            .node-header {
                                                padding: 10px 14px;
                                            border-bottom: 1px solid theme('colors.border.DEFAULT');
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                            cursor: grab;
                                            border-top-left-radius: 12px;
                                            border-top-right-radius: 12px;
                                            background: rgba(255, 255, 255, 0.03);
    }

                                            .node-body {
                                                padding: 12px 14px;
                                            font-size: 0.8rem;
                                            color: theme('colors.text.secondary');
                                            line-height: 1.4;
    }

                                            .port {
                                                position: absolute;
                                            width: 10px;
                                            height: 10px;
                                            background: theme('colors.bg.tertiary');
                                            border: 1.5px solid theme('colors.text.tertiary');
                                            border-radius: 50%;
                                            top: 50%;
                                            transform: translateY(-50%);
                                            z-index: 20;
    }

                                            .port.left {
                                                left: -6px;
    }

                                            .port.right {
                                                right: -6px;
    }

                                            .workflow-node.active-node .port {
                                                border - color: theme('colors.accent.DEFAULT');
                                            background: theme('colors.bg.secondary');
    }

                                            .edge-path {
                                                fill: none;
                                            stroke: rgba(255, 255, 255, 0.15);
                                            stroke-width: 2.5;
                                            transition: stroke 0.3s ease;
    }

                                            .edge-path.active {
                                                stroke: theme('colors.accent.DEFAULT');
                                            filter: drop-shadow(0 0 4px theme('colors.accent.DEFAULT'));
                                            stroke-dasharray: 8;
                                            animation: flow 1s linear infinite;
    }

                                            @keyframes flow {
                                                to {
                                                stroke - dashoffset: -16;
      }
    }

                                            /* =========================================================
                                               5. DATABASE SCHEMA VISUALIZER
                                               ========================================================= */
                                            .db-table-card {
                                                width: 220px !important;
                                            background: rgba(16, 20, 24, 0.95);
                                            border: 1px solid var(--color-border-dim);
                                            border-radius: 12px;
                                            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
                                            overflow: hidden;
    }

                                            .db-table-card:hover {
                                                border - color: rgba(255, 255, 255, 0.2);
    }

                                            /* =========================================================
                                               4. RIGHT PANEL (Terminal & Telemetry)
                                               ========================================================= */
                                            .tab-btn {
                                                color: theme('colors.text.secondary');
                                            border-bottom: 2px solid transparent;
                                            transition: all 0.2s;
                                            background: transparent;
    }

                                            .tab-btn:hover {
                                                color: theme('colors.text.primary');
                                            background: rgba(255, 255, 255, 0.03);
    }

                                            .tab-btn.active {
                                                color: #ffffff;
                                            border-bottom-color: theme('colors.accent.DEFAULT');
                                            font-weight: 700;
                                            background: rgba(255, 255, 255, 0.05);
    }

                                            .tab-content {
                                                display: none;
    }

                                            .tab-content.active {
                                                display: block;
    }

                                            .terminal-line {
                                                animation: fadeIn 0.15s ease-out forwards;
                                            opacity: 0;
                                            transform: translateY(2px);
    }

                                            @keyframes fadeIn {
                                                to {
                                                opacity: 1;
                                            transform: translateY(0);
      }
    }

                                            .cursor-blink {
                                                display: inline-block;
                                            width: 6px;
                                            height: 12px;
                                            background-color: theme('colors.accent.DEFAULT');
                                            animation: blink 1s step-end infinite;
                                            vertical-align: text-bottom;
                                            margin-left: 4px;
    }

                                            @keyframes blink {
                                                50 % {
                                                    opacity: 0;
                                                }
                                            }

                                            .hitl-overlay {
                                                background: radial-gradient(circle at center, rgba(96, 165, 250, 0.1) 0%, rgba(10, 13, 16, 0.7) 100%);
                                            backdrop-filter: blur(4px);
    }

                                            /* Panel Toggle Transitions */
                                            #right-panel {
                                                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    }

                                            .panel-collapsed {
                                                width: 0 !important;
                                            opacity: 0;
                                            border-left-color: transparent !important;
    }

                                            /* FAB Terminal Button */
                                            .fab-terminal-btn {
                                                position: fixed;
                                            bottom: 24px;
                                            right: 24px;
                                            width: 56px;
                                            height: 56px;
                                            border-radius: 50%;
                                            background: linear-gradient(135deg, #101418 0%, #0a0d10 100%);
                                            border: 1.5px solid rgba(120, 244, 191, 0.4);
                                            color: #78f4bf;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            box-shadow: 0 4px 20px rgba(120, 244, 191, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.1);
                                            cursor: pointer;
                                            z-index: 90;
                                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

                                            .fab-terminal-btn:hover {
                                                transform: scale(1.05) translateY(-2px);
                                            box-shadow: 0 6px 24px rgba(120, 244, 191, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.15);
                                            border-color: #78f4bf;
    }

                                            .fab-terminal-btn i {
                                                font - size: 24px;
    }

                                            /* Floating Terminal Window */
                                            .floating-terminal-window {
                                                position: fixed;
                                            bottom: 90px;
                                            right: 24px;
                                            width: 480px;
                                            height: 360px;
                                            background: rgba(10, 13, 16, 0.95);
                                            backdrop-filter: blur(12px);
                                            border: 1px solid rgba(255, 255, 255, 0.15);
                                            border-radius: 12px;
                                            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
                                            z-index: 95;
                                            display: flex;
                                            flex-direction: column;
                                            overflow: hidden;
                                            transform: scale(0.9) translateY(10px);
                                            opacity: 0;
                                            pointer-events: none;
                                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

                                            .floating-terminal-window.expanded {
                                                transform: scale(1) translateY(0);
                                            opacity: 1;
                                            pointer-events: auto;
    }

                                            /* Header styling */
                                            .terminal-hdr {
                                                padding: 10px 14px;
                                            background: rgba(255, 255, 255, 0.03);
                                            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                            display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            cursor: move;
                                            user-select: none;
    }

                                            /* Shell Select */
                                            .shell-select {
                                                background: rgba(255, 255, 255, 0.05);
                                            border: 1px solid rgba(255, 255, 255, 0.1);
                                            border-radius: 6px;
                                            color: #c2d1cb;
                                            font-family: 'JetBrains Mono', monospace;
                                            font-size: 11px;
                                            padding: 3px 24px 3px 8px;
                                            appearance: none;
                                            outline: none;
                                            cursor: pointer;
                                            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a39d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                                            background-repeat: no-repeat;
                                            background-position: right 6px center;
                                            background-size: 12px;
    }

                                            .shell-select:focus {
                                                border - color: rgba(120, 244, 191, 0.5);
    }

                                            .shell-select option {
                                                background: #101418;
                                            color: #ffffff;
    }

                                            /* Blinking Status Capsule */
                                            .status-dot-orange {
                                                animation: pulse-orange 1.5s infinite;
                                            box-shadow: 0 0 8px rgba(255, 95, 86, 0.6);
    }

                                            @keyframes pulse-orange {

                                                0 %,
                                                100 % {
                                                    opacity: 0.5;
                                                    filter: brightness(0.8);
                                                }

      50% {
                                                opacity: 1;
                                            filter: brightness(1.2);
      }
    }

                                            /* AST Code Panel Highlight */
                                            .line-code {
                                                padding: 2px 8px;
                                            border-radius: 4px;
                                            transition: background 0.3s;
                                            border-left: 3px solid transparent;
    }

                                            .line-code.highlighted {
                                                background: rgba(120, 244, 191, 0.15);
                                            border-left-color: #78f4bf;
    }

                                            /* Verification Icons Group (DOC, CODE, TEST) */
                                            .verif-icons {
                                                display: flex;
                                            align-items: center;
                                            gap: 6px;
    }

                                            .verif-icon-btn {
                                                font - size: 0.85rem;
                                            transition: var(--transition-smooth);
                                            cursor: pointer;
                                            display: inline-flex;
                                            align-items: center;
                                            justify-content: center;
                                            width: 22px;
                                            height: 22px;
                                            border-radius: 6px;
                                            background: rgba(255, 255, 255, 0.02);
                                            border: 1px solid rgba(255, 255, 255, 0.06);
                                            color: var(--color-text-tertiary-dim);
    }

                                            .verif-icon-btn:hover:not(.disabled):not(.active) {
                                                background: rgba(255, 255, 255, 0.06);
                                            border-color: rgba(255, 255, 255, 0.15);
                                            color: var(--color-text-primary-dim);
    }

                                            .verif-icon-btn.active {
                                                color: #78f4bf;
                                            background: rgba(120, 244, 191, 0.12);
                                            border-color: rgba(120, 244, 191, 0.35);
                                            box-shadow: 0 0 8px rgba(120, 244, 191, 0.2);
    }

                                            .verif-icon-btn.disabled {
                                                cursor: not-allowed;
                                            opacity: 0.15;
                                            background: transparent;
                                            border-color: transparent;
    }

                                            .text-glow-orange {
                                                text - shadow: 0 0 10px rgba(237, 108, 53, 0.4);
    }

                                            .text-glow-amber {
                                                text - shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    }

                                            /* --- MODERN GLASS SIDEBAR STYLES --- */
                                            .sidebar {
                                                width: 256px;
                                            background: rgba(16, 20, 24, 0.8);
                                            backdrop-filter: blur(20px);
                                            -webkit-backdrop-filter: blur(20px);
                                            border-right: 1px solid rgba(255, 255, 255, 0.1);
                                            display: flex;
                                            flex-direction: column;
                                            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                            flex-shrink: 0;
                                            height: 100%;
                                            position: relative;
                                            z-index: 40;
    }

                                            .sidebar.collapsed {
                                                width: 72px;
    }

                                            .sb-brand {
                                                display: flex;
                                            align-items: center;
                                            gap: 12px;
                                            padding: 24px 20px;
                                            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                                            margin-bottom: 16px;
                                            min-height: 80px;
                                            overflow: hidden;
    }

                                            .sb-brand-icon {
                                                width: 40px;
                                            height: 40px;
                                            background: rgba(120, 244, 191, 0.1);
                                            color: #78f4bf;
                                            border-radius: 12px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-size: 20px;
                                            border: 1px solid rgba(120, 244, 191, 0.2);
                                            flex-shrink: 0;
    }

                                            .sb-brand-text {
                                                display: flex;
                                            flex-direction: column;
                                            min-width: 0;
    }

                                            .sb-brand-title {
                                                font - size: 14px;
                                            font-weight: 900;
                                            color: white;
                                            text-transform: uppercase;
                                            letter-spacing: -0.02em;
                                            white-space: nowrap;
                                            overflow: hidden;
                                            text-overflow: ellipsis;
    }

                                            .sb-brand-sub {
                                                font - size: 10px;
                                            font-weight: 700;
                                            color: #94a39d;
                                            text-transform: uppercase;
                                            letter-spacing: 0.1em;
                                            white-space: nowrap;
                                            overflow: hidden;
                                            text-overflow: ellipsis;
    }

                                            .sb-nav {
                                                list - style: none;
                                            padding: 0 12px;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 4px;
                                            flex: 1;
                                            overflow-y: auto;
    }

                                            .sb-item {
                                                list - style: none;
    }

                                            .sb-link {
                                                width: 100%;
                                            display: flex;
                                            align-items: center;
                                            gap: 12px;
                                            padding: 10px 14px;
                                            border-radius: 12px;
                                            color: #94a39d;
                                            font-size: 13px;
                                            font-weight: 600;
                                            transition: all 0.2s ease;
                                            cursor: pointer;
                                            border: 1px solid transparent;
                                            background: transparent;
                                            text-align: left;
    }

                                            .sb-link i {
                                                font - size: 18px;
                                            flex-shrink: 0;
    }

                                            .sb-link:hover {
                                                background: rgba(255, 255, 255, 0.05);
                                            color: white;
    }

                                            .sb-link.active {
                                                background: rgba(120, 244, 191, 0.1);
                                            color: #78f4bf;
                                            border: 1px solid rgba(120, 244, 191, 0.2);
    }

                                            .sb-footer {
                                                padding: 20px 12px;
                                            border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

                                            .sb-divider {
                                                height: 1px;
                                            background: rgba(255, 255, 255, 0.05);
                                            margin-bottom: 20px;
    }

                                            .sb-stats-grid {
                                                display: grid;
                                            grid-template-cols: repeat(3, 1fr);
                                            gap: 8px;
    }

                                            .sb-stat {
                                                display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            background: rgba(0, 0, 0, 0.2);
                                            padding: 8px 4px;
                                            border-radius: 8px;
                                            border: 1px solid rgba(255, 255, 255, 0.03);
    }

                                            .sb-stat-val {
                                                font - size: 10px;
                                            font-weight: 900;
                                            font-family: 'JetBrains Mono', monospace;
    }

                                            .sb-stat-lbl {
                                                font - size: 7px;
                                            color: #6b7c75;
                                            text-transform: uppercase;
                                            font-weight: 700;
                                            margin-top: 2px;
    }

                                            /* Hide text when collapsed */
                                            .sidebar.collapsed .sb-brand-text,
                                            .sidebar.collapsed .sb-link span,
                                            .sidebar.collapsed .sb-stat-lbl,
                                            .sidebar.collapsed .sb-stat-val {
                                                display: none;
    }

                                            .sidebar.collapsed .sb-stats-grid {
                                                grid - template - cols: 1fr;
                                            gap: 4px;
    }

                                            .sidebar.collapsed .sb-brand {
                                                padding: 20px 15px;
                                            justify-content: center;
    }

                                            .sidebar.collapsed .sb-link {
                                                padding: 10px;
                                            justify-content: center;
    }

                                        </style>
                                    </head>

                                    <body
                                        class="h-screen w-screen flex antialiased selection:bg-accent selection:text-bg-primary bg-bg-primary overflow-hidden">

                                        <!-- GLOBAL LEFT NAV BAR -->
                                        <nav
                                            class="w-14 sm:w-16 h-full bg-bg-secondary border-r border-border flex flex-col items-center py-4 gap-4 shrink-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)] overflow-y-auto overflow-x-hidden">
                                            <!-- App Logo -->
                                            <div
                                                class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg cursor-pointer hover:opacity-90 transition mb-2 shrink-0">
                                                <i class="ti ti-brand-codesandbox"></i>
                                            </div>

                                            <!-- Nav Items -->
                                            <div class="flex flex-col gap-2 w-full px-2 shrink-0">
                                                <button
                                                    class="w-full aspect-square flex flex-col items-center justify-center gap-1 text-accent bg-accent/10 rounded-xl border border-accent/20 cursor-default"
                                                    title="AST Viewer">
                                                    <i class="ti ti-hierarchy-2 text-xl"></i>
                                                    <span class="text-[9px] font-bold hidden sm:block">AST</span>
                                                </button>
                                                <button
                                                    class="w-full aspect-square flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-text-primary hover:bg-white/5 rounded-xl transition cursor-pointer"
                                                    title="Roadmaps">
                                                    <i class="ti ti-layout-kanban text-xl"></i>
                                                    <span class="text-[9px] font-bold hidden sm:block">Boards</span>
                                                </button>
                                                <button
                                                    class="w-full aspect-square flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-text-primary hover:bg-white/5 rounded-xl transition cursor-pointer"
                                                    title="Agent Hub">
                                                    <i class="ti ti-users text-xl"></i>
                                                    <span class="text-[9px] font-bold hidden sm:block">Agents</span>
                                                </button>
                                                <button
                                                    class="w-full aspect-square flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-text-primary hover:bg-white/5 rounded-xl transition cursor-pointer"
                                                    title="Knowledge Base">
                                                    <i class="ti ti-database text-xl"></i>
                                                    <span class="text-[9px] font-bold hidden sm:block">Data</span>
                                                </button>
                                            </div>

                                            <div class="flex-1"></div>

                                            <!-- Bottom Items -->
                                            <div class="flex flex-col gap-2 shrink-0 pb-2">
                                                <button
                                                    class="w-10 h-10 mx-auto rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-white hover:border-accent transition cursor-pointer"
                                                    title="Settings">
                                                    <i class="ti ti-settings text-lg"></i>
                                                </button>
                                                <button
                                                    class="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-border overflow-hidden cursor-pointer shadow-md">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" class="w-full h-full object-cover">
                                                </button>
                                            </div>
                                        </nav>

                                        <!-- MAIN WRAPPER (To hold Top Nav + Content) -->
                                        <div class="flex-1 flex flex-col min-w-0 h-full relative">

                                            <!-- TOP NAVIGATION BAR (Responsive Flex Layout) -->

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


                                            <!-- Main Workspace Area -->

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


                                                <!-- COLUMN 2: CENTER BENTO LARGE PANEL -->
                                                <section
                                                    class="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-bg-secondary border border-border rounded-xl shadow-lg relative min-w-0">

                                                    <!-- LEFT TOOLBAR (Only visible in Canvas View, inside Center Panel) -->
                                                    <aside id="left-toolbar"
                                                        class="hidden w-12 sm:w-14 border-r border-border bg-bg-primary flex-col items-center py-4 gap-3 shrink-0 z-20 absolute left-0 top-0 bottom-0">
                                                        <button class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"
                                                            title="Select"><i class="ti ti-pointer"></i></button>
                                                        <button
                                                            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-white/5 text-text-tertiary hover:text-text-primary flex items-center justify-center transition"
                                                            title="Pan"><i class="ti ti-hand-stop"></i></button>
                                                        <div class="w-6 h-[1px] bg-border my-1"></div>
                                                        <button
                                                            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-white/5 text-text-tertiary hover:text-text-primary flex items-center justify-center transition"
                                                            title="Add Node"><i class="ti ti-square-plus"></i></button>
                                                    </aside>

                                                    <!-- CENTER VIEW 1: ROADMAP VIEW -->
                                                    <div class="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 relative z-10" id="roadmap-view">
                                                        <div class="roadmap-container">

                                                            <!-- PHASE 0 -->
                                                            <div class="phase" id="p0">
                                                                <div class="phase-header" onclick="togglePhase('p0')">
                                                                    <span class="phase-badge p0-badge">Phase 0</span>
                                                                    <span class="phase-title">Feasibility Spike — พิสูจน์ความเสถียร</span>
                                                                    <div class="phase-header-progress">
                                                                        <div class="phase-mini-bar">
                                                                            <div class="phase-mini-fill" id="p0-mini-fill"></div>
                                                                        </div>
                                                                        <span class="phase-progress-val" id="p0-progress-lbl">0%</span>
                                                                    </div>
                                                                    <i class="ti ti-chevron-down phase-chevron open" id="p0-ch"></i>
                                                                </div>
                                                                <div class="phase-body open" id="p0-body">
                                                                    <p class="phase-desc">ก่อนเริ่ม Sprint จริง ต้องพิสูจน์ให้ได้ว่าระบบ YouTube IFrame API ทำงานร่วมกับ
                                                                        WebSocket sync ในการดึงพิกัดเวลาของเพลงได้เสถียรบนมือถือ 2 เครื่อง และหาข้อจำกัดระบบ</p>
                                                                    <div class="sprint-grid">
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s0">Sprint 0</span>
                                                                                    <span class="sprint-name">Technical Spike</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p0-s0-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 3–5 วัน</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p0-s0">
                                                                                <div class="task-item" data-task-id="p0-s0-1" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-1" name="doc-chk-p0-s0-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-1" name="code-chk-p0-s0-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Prototype YouTube IFrame Player บน 2 clients
                                                                                        พร้อมกัน</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-1" name="assist-select-p0-s0-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p0-s0-2" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-2" name="doc-chk-p0-s0-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-2" name="code-chk-p0-s0-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">WebSocket room ขั้นต่ำ: สร้างห้อง / join /
                                                                                        broadcast event</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-2" name="assist-select-p0-s0-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p0-s0-3" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-3" name="doc-chk-p0-s0-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-3" name="code-chk-p0-s0-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Play / Pause / Seek sync เบื้องต้น</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-3" name="assist-select-p0-s0-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p0-s0-4" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-4" name="doc-chk-p0-s0-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-4" name="code-chk-p0-s0-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">วัด drift จริงระหว่าง 2 เครื่อง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-4" name="assist-select-p0-s0-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p0-s0-5" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-5" name="doc-chk-p0-s0-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-5" name="code-chk-p0-s0-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">ทดสอบบน iOS Safari + Android Chrome</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-5" name="assist-select-p0-s0-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p0-s0-6" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p0-s0-6" name="doc-chk-p0-s0-6" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p0-s0-6" name="code-chk-p0-s0-6" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">ระบุข้อจำกัด autoplay / background playback /
                                                                                        wake lock</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p0-s0-6" name="assist-select-p0-s0-6"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>มือถือ 2 เครื่องเล่นเพลงเดียวกัน drift เฉลี่ย
                                                                                        &lt; 500ms</div>
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>Join ด้วย room link ได้</div>
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>มี document สรุปข้อจำกัดของแต่ละแพลตฟอร์ม
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- PHASE 1 -->
                                                            <div class="phase" id="p1">
                                                                <div class="phase-header" onclick="togglePhase('p1')">
                                                                    <span class="phase-badge p1-badge">Phase 1</span>
                                                                    <span class="phase-title">MVP Core — ฟังก์ชันห้องและการแชร์เพลง</span>
                                                                    <div class="phase-header-progress">
                                                                        <div class="phase-mini-bar">
                                                                            <div class="phase-mini-fill" id="p1-mini-fill"></div>
                                                                        </div>
                                                                        <span class="phase-progress-val" id="p1-progress-lbl">0%</span>
                                                                    </div>
                                                                    <i class="ti ti-chevron-down phase-chevron open" id="p1-ch"></i>
                                                                </div>
                                                                <div class="phase-body open" id="p1-body">
                                                                    <p class="phase-desc">วางรากฐานโครงสร้างระบบ Client และ Server ให้ Rider
                                                                        สามารถเปิดห้องและส่งต่อลิงก์ห้องให้ Passenger ร่วมใช้งานได้จริงบนระบบ Production</p>
                                                                    <div class="sprint-grid">

                                                                        <!-- Sprint 1A -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s1">Sprint 1A</span>
                                                                                    <span class="sprint-name">Setup + Room Creation</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p1-s1a-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p1-s1a">
                                                                                <div class="task-item" data-task-id="p1-s1a-1" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-1" name="doc-chk-p1-s1a-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-1" name="code-chk-p1-s1a-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">ตั้งโปรเจกต์ React + Vite (PWA manifest, service
                                                                                        worker shell)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-1" name="assist-select-p1-s1a-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-2" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-2" name="doc-chk-p1-s1a-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-2" name="code-chk-p1-s1a-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Backend Node.js + TypeScript + WebSocket room
                                                                                        state ในเมมโมรี่</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-2" name="assist-select-p1-s1a-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-3" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-3" name="doc-chk-p1-s1a-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-3" name="code-chk-p1-s1a-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Rider: สร้างห้อง → รับ roomId → แสดง QR
                                                                                        code</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-3" name="assist-select-p1-s1a-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-4" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-4" name="doc-chk-p1-s1a-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-4" name="code-chk-p1-s1a-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">QR generator + share link</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-4" name="assist-select-p1-s1a-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-5" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-5" name="doc-chk-p1-s1a-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-5" name="code-chk-p1-s1a-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Passenger: สแกน QR → ใส่ชื่อ → join ห้อง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-5" name="assist-select-p1-s1a-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-6" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-6" name="doc-chk-p1-s1a-6" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-6" name="code-chk-p1-s1a-6" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Participant presence (connected /
                                                                                        disconnected)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-6" name="assist-select-p1-s1a-6"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1a-7" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1a-7" name="doc-chk-p1-s1a-7" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1a-7" name="code-chk-p1-s1a-7" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Thai UI ขั้นพื้นฐาน, dark mode, mobile-first
                                                                                        layout</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1a-7" name="assist-select-p1-s1a-7"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>Rider เปิดห้องและ Passenger join ได้บน
                                                                                        production URL จริง</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <!-- Sprint 1B -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s1">Sprint 1B</span>
                                                                                    <span class="sprint-name">Queue + Playback Sync</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p1-s1b-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p1-s1b">
                                                                                <div class="task-item" data-task-id="p1-s1b-1" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-1" name="doc-chk-p1-s1b-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-1" name="code-chk-p1-s1b-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">YouTube link parser + YouTube IFrame API
                                                                                        integration</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-1" name="assist-select-p1-s1b-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1b-2" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-2" name="doc-chk-p1-s1b-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-2" name="code-chk-p1-s1b-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Queue เพลง: add / remove / reorder</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-2" name="assist-select-p1-s1b-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1b-3" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-3" name="doc-chk-p1-s1b-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-3" name="code-chk-p1-s1b-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Current track state บน server (trackId,
                                                                                        positionMs, serverStartedAt)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-3" name="assist-select-p1-s1b-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1b-4" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-4" name="doc-chk-p1-s1b-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-4" name="code-chk-p1-s1b-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Play / Pause / Skip / Seek ซิงค์ผ่าน
                                                                                        WebSocket</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-4" name="assist-select-p1-s1b-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1b-5" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-5" name="doc-chk-p1-s1b-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-5" name="code-chk-p1-s1b-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Auto-next เมื่อเพลงจบ</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-5" name="assist-select-p1-s1b-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p1-s1b-6" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p1-s1b-6" name="doc-chk-p1-s1b-6" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p1-s1b-6" name="code-chk-p1-s1b-6" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Volume control แยกแต่ละ device</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p1-s1b-6" name="assist-select-p1-s1b-6"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>เล่นเพลงต่อคิว 5 เพลงขึ้นไปโดยไม่ต้อง refresh
                                                                                        หน้าเว็บ</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- PHASE 2 -->
                                                            <div class="phase" id="p2">
                                                                <div class="phase-header" onclick="togglePhase('p2')">
                                                                    <span class="phase-badge p2-badge">Phase 2</span>
                                                                    <span class="phase-title">Hardening + Rider UX — ความเสถียร & ขับขี่จริง</span>
                                                                    <div class="phase-header-progress">
                                                                        <div class="phase-mini-bar">
                                                                            <div class="phase-mini-fill" id="p2-mini-fill"></div>
                                                                        </div>
                                                                        <span class="phase-progress-val" id="p2-progress-lbl">0%</span>
                                                                    </div>
                                                                    <i class="ti ti-chevron-down phase-chevron open" id="p2-ch"></i>
                                                                </div>
                                                                <div class="phase-body open" id="p2-body">
                                                                    <p class="phase-desc">ปรับปรุง Algorithm การซิงค์นาฬิกา และสร้าง UI สำหรับผู้ขับขี่ (Rider)
                                                                        เพื่อความสะดวกปลอดภัยเวลาใช้งานจริงขณะขี่มอเตอร์ไซค์</p>
                                                                    <div class="sprint-grid">

                                                                        <!-- Sprint 2A -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s2">Sprint 2A</span>
                                                                                    <span class="sprint-name">Sync Hardening</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p2-s2a-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p2-s2a">
                                                                                <div class="task-item" data-task-id="p2-s2a-1" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-1" name="doc-chk-p2-s2a-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-1" name="code-chk-p2-s2a-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Drift correction algorithm (&lt;250ms ปล่อย /
                                                                                        250-800ms ปรับ rate / &gt;800ms seek)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-1" name="assist-select-p2-s2a-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2a-2" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-2" name="doc-chk-p2-s2a-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-2" name="code-chk-p2-s2a-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Latency ping ทุก 3 วินาที + clock sync กับ
                                                                                        server</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-2" name="assist-select-p2-s2a-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2a-3" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-3" name="doc-chk-p2-s2a-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-3" name="code-chk-p2-s2a-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Reconnect อัตโนมัติหลังเน็ตหลุด + resync
                                                                                        position</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-3" name="assist-select-p2-s2a-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2a-4" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-4" name="doc-chk-p2-s2a-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-4" name="code-chk-p2-s2a-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Buffer state handling +
                                                                                        แจ้งเตือนผู้ใช้เมื่อเน็ตช้า</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-4" name="assist-select-p2-s2a-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2a-5" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-5" name="doc-chk-p2-s2a-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-5" name="code-chk-p2-s2a-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Host handoff fallback
                                                                                        เมื่อผู้เปิดห้องตัดการเชื่อมต่อ</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-5" name="assist-select-p2-s2a-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2a-6" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2a-6" name="doc-chk-p2-s2a-6" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2a-6" name="code-chk-p2-s2a-6" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Drift metric logging เพื่อใช้ในการ debug
                                                                                        พฤติกรรมการซิงค์</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2a-6" name="assist-select-p2-s2a-6"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>เน็ตหลุดกลับมาแล้วซิงค์ดนตรี drift &lt; 500ms
                                                                                        ภายใน 5 วินาที</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <!-- Sprint 2B -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s2">Sprint 2B</span>
                                                                                    <span class="sprint-name">Rider Mode + Beta Polish</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p2-s2b-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p2-s2b">
                                                                                <div class="task-item" data-task-id="p2-s2b-1" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-1" name="doc-chk-p2-s2b-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-1" name="code-chk-p2-s2b-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Rider dashboard ปุ่มใหญ่ (Play/Pause/Skip)
                                                                                        แตะง่าย</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-1" name="assist-select-p2-s2b-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2b-2" data-state="done">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-2" name="doc-chk-p2-s2b-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-2" name="code-chk-p2-s2b-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">OLED Saver / Black Screen mode
                                                                                        ประหยัดพลังงาน</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-2" name="assist-select-p2-s2b-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2b-3" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-3" name="doc-chk-p2-s2b-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-3" name="code-chk-p2-s2b-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Passenger remote: ค้นหา YouTube +
                                                                                        เพิ่มเพลง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-3" name="assist-select-p2-s2b-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2b-4" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-4" name="doc-chk-p2-s2b-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-4" name="code-chk-p2-s2b-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Trip summary หน้าสรุปรายละเอียดการเดินทาง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-4" name="assist-select-p2-s2b-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2b-5" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-5" name="doc-chk-p2-s2b-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-5" name="code-chk-p2-s2b-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Analytics events (กิจกรรมห้อง,
                                                                                        อัตราดริฟต์เฉลี่ย)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-5" name="assist-select-p2-s2b-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p2-s2b-6" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p2-s2b-6" name="doc-chk-p2-s2b-6" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p2-s2b-6" name="code-chk-p2-s2b-6" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Error tracking integration (รายงาน crash)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p2-s2b-6" name="assist-select-p2-s2b-6"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>กลุ่มทดสอบ Beta สามารถใช้งานระบบเองได้โดยไม่มี
                                                                                        Developer คอยช่วย</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- PHASE 3 -->
                                                            <div class="phase" id="p3">
                                                                <div class="phase-header" onclick="togglePhase('p3')">
                                                                    <span class="phase-badge p3-badge">Phase 3</span>
                                                                    <span class="phase-title">Private Beta — เริ่มการทดสอบกลุ่มย่อย</span>
                                                                    <div class="phase-header-progress">
                                                                        <div class="phase-mini-bar">
                                                                            <div class="phase-mini-fill" id="p3-mini-fill"></div>
                                                                        </div>
                                                                        <span class="phase-progress-val" id="p3-progress-lbl">0%</span>
                                                                    </div>
                                                                    <i class="ti ti-chevron-down phase-chevron" id="p3-ch"></i>
                                                                </div>
                                                                <div class="phase-body" id="p3-body">
                                                                    <p class="phase-desc">เริ่มเชิญกลุ่มผู้ใช้รถมอเตอร์ไซค์จำนวน 20–50 คู่
                                                                        ทำการทดสอบเดินทางในชีวิตประจำวันเพื่อรวบรวมข้อเสนอแนะและบั๊กที่แฝงอยู่</p>
                                                                    <div class="sprint-grid">

                                                                        <!-- Sprint 3A -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s3">Sprint 3A</span>
                                                                                    <span class="sprint-name">Beta Onboarding + Distribution</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p3-s3a-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p3-s3a">
                                                                                <div class="task-item" data-task-id="p3-s3a-1" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3a-1" name="doc-chk-p3-s3a-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3a-1" name="code-chk-p3-s3a-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Beta onboarding flow อธิบาย autoplay +
                                                                                        วิธีเชื่อมต่อ</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3a-1" name="assist-select-p3-s3a-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3a-2" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3a-2" name="doc-chk-p3-s3a-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3a-2" name="code-chk-p3-s3a-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">In-app feedback form + rating
                                                                                        ประเมินหลังเดินทาง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3a-2" name="assist-select-p3-s3a-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3a-3" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3a-3" name="doc-chk-p3-s3a-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3a-3" name="code-chk-p3-s3a-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">รับสมัครกลุ่มผู้ขี่มอเตอร์ไซค์ 20-50
                                                                                        คู่มาร่วมทดสอบ</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3a-3" name="assist-select-p3-s3a-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3a-4" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3a-4" name="doc-chk-p3-s3a-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3a-4" name="code-chk-p3-s3a-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">ทำสื่อคลิปสั้นอธิบายระบบลง Reels/TikTok</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3a-4" name="assist-select-p3-s3a-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3a-5" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3a-5" name="doc-chk-p3-s3a-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3a-5" name="code-chk-p3-s3a-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">ผลิตสื่อ QR Code
                                                                                        ประชาสัมพันธ์ติดร้านบิ๊กไบค์</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3a-5" name="assist-select-p3-s3a-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <!-- Sprint 3B -->
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag s3">Sprint 3B</span>
                                                                                    <span class="sprint-name">Monitoring + Learning</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p3-s3b-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> 1–2 สัปดาห์</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p3-s3b">
                                                                                <div class="task-item" data-task-id="p3-s3b-1" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3b-1" name="doc-chk-p3-s3b-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3b-1" name="code-chk-p3-s3b-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Usage Dashboard:
                                                                                        ตรวจสอบความถี่และชั่วโมงการเปิดซิงค์เพลง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3b-1" name="assist-select-p3-s3b-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3b-2" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3b-2" name="doc-chk-p3-s3b-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3b-2" name="code-chk-p3-s3b-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Retention tracking: อัตราการกลับมาเปิดเล่นซ้ำใน
                                                                                        7 วัน</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3b-2" name="assist-select-p3-s3b-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3b-3" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3b-3" name="doc-chk-p3-s3b-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3b-3" name="code-chk-p3-s3b-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">รวบรวม Bugs ยอดฮิต 5
                                                                                        อันดับแรกเพื่อจัดคิวแก้ไข</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3b-3" name="assist-select-p3-s3b-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3b-4" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3b-4" name="doc-chk-p3-s3b-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3b-4" name="code-chk-p3-s3b-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">สรุป Persona
                                                                                        ผู้ใช้ที่ชอบฟีเจอร์นี้มากที่สุด</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3b-4" name="assist-select-p3-s3b-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p3-s3b-5" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p3-s3b-5" name="doc-chk-p3-s3b-5" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p3-s3b-5" name="code-chk-p3-s3b-5" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">เปิดอัปเดต Quick-fix
                                                                                        แก้ปัญหาเร่งด่วนตามเสียงตอบรับ</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p3-s3b-5" name="assist-select-p3-s3b-5"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="exit">
                                                                                <div class="exit-label"><i class="ti ti-door-exit"></i> Exit criteria</div>
                                                                                <div class="exit-items">
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>สะสมทริปเดินทางที่มีการใช้งานเกิน 15 นาที
                                                                                        ได้อย่างน้อย 20 ทริป</div>
                                                                                    <div class="exit-item"><i class="ti ti-check"></i>ค้นหาจุดบกพร่องยอดนิยม 5
                                                                                        อันดับแรกเพื่อวางคิวพัฒนาเฟสถัดไป</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- PHASE 4 -->
                                                            <div class="phase" id="p4">
                                                                <div class="phase-header" onclick="togglePhase('p4')">
                                                                    <span class="phase-badge nsm">Future</span>
                                                                    <span class="phase-title">Post-Beta Expansion — แผนขยายฟีเจอร์หลัง MVP</span>
                                                                    <div class="phase-header-progress">
                                                                        <div class="phase-mini-bar">
                                                                            <div class="phase-mini-fill" id="p4-mini-fill"></div>
                                                                        </div>
                                                                        <span class="phase-progress-val" id="p4-progress-lbl">0%</span>
                                                                    </div>
                                                                    <i class="ti ti-chevron-down phase-chevron" id="p4-ch"></i>
                                                                </div>
                                                                <div class="phase-body" id="p4-body">
                                                                    <p class="phase-desc">แนวคิดฟีเจอร์ในอนาคตที่อยู่นอกขอบเขตของระบบ MVP
                                                                        โดยมีข้อจำกัดและต้องการความพร้อมด้านเทคนิคเพิ่มเติม</p>
                                                                    <div class="sprint-grid">
                                                                        <div class="sprint">
                                                                            <div class="sprint-header">
                                                                                <div class="sprint-identity">
                                                                                    <span class="sprint-tag nsm">Backlog</span>
                                                                                    <span class="sprint-name">รอการประเมิน Demand และความเป็นไปได้</span>
                                                                                </div>
                                                                                <div class="sprint-meta">
                                                                                    <span class="sprint-percent" id="p4-backlog-percent">0%</span>
                                                                                    <span class="sprint-dur"><i class="ti ti-calendar-event"></i> TBD</span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="tasks" data-sprint="p4-backlog">
                                                                                <div class="task-item" data-task-id="p4-task-1" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p4-task-1" name="doc-chk-p4-task-1" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p4-task-1" name="code-chk-p4-task-1" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Hotspot / Local WebSocket
                                                                                        (ซิงค์ตรงโดยไม่พึ่งอินเทอร์เน็ต)</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p4-task-1" name="assist-select-p4-task-1"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p4-task-2" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p4-task-2" name="doc-chk-p4-task-2" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p4-task-2" name="code-chk-p4-task-2" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Intercom voice chat
                                                                                        สนทนาเสียงแบบสายตรงในแอป</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p4-task-2" name="assist-select-p4-task-2"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p4-task-3" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p4-task-3" name="doc-chk-p4-task-3" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p4-task-3" name="code-chk-p4-task-3" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Convoy GPS tracking
                                                                                        ติดตามแผนที่ของเพื่อนร่วมคาราวาน</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p4-task-3" name="assist-select-p4-task-3"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                                <div class="task-item" data-task-id="p4-task-4" data-state="todo">
                                                                                    <div class="flex items-center gap-2.5 shrink-0" onclick="event.stopPropagation()">
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="doc-chk-p4-task-4" name="doc-chk-p4-task-4" type="checkbox" class="doc-chk"
                                                                                                onchange="handleDocChange(this)">
                                                                                                <span>Doc</span>
                                                                                        </label>
                                                                                        <label
                                                                                            class="flex items-center gap-1 text-[10px] text-text-secondary cursor-pointer select-none">
                                                                                            <input id="code-chk-p4-task-4" name="code-chk-p4-task-4" type="checkbox" class="code-chk"
                                                                                                disabled onchange="handleCodeChange(this)">
                                                                                                <span>Code</span>
                                                                                        </label>
                                                                                    </div>
                                                                                    <span class="task-text truncate flex-1 min-w-0">Voice command สั่งงานระบบคิวเพลงด้วยเสียง</span>
                                                                                    <div class="shrink-0 flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                                                        <span class="text-[9px] text-text-tertiary">Assist:</span>
                                                                                        <select id="assist-select-p4-task-4" name="assist-select-p4-task-4"
                                                                                            class="assist-to-select bg-bg-primary border border-border rounded text-[9.5px] text-text-secondary px-1 py-0.5 outline-none focus:border-accent"
                                                                                            onchange="saveStateToStorage()">
                                                                                            <option value="none">Unassigned</option>
                                                                                            <option value="eva">EVA Agent</option>
                                                                                            <option value="qwen">Qwen Coder</option>
                                                                                            <option value="local">Local Dev</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <span class="status-badge status-pending shrink-0"><span
                                                                                        class="pulse-dot"></span>Waiting...</span>
                                                                                    <span class="status-badge status-done shrink-0">Done</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <!-- CENTER VIEW 2: AST EXPLORER -->
                                                    <div class="hidden flex-1 flex overflow-hidden pl-12 sm:pl-14" id="workflow-canvas">

                                                        <!-- AST Code Viewer (Left Split) -->
                                                        <div id="ast-code-panel"
                                                            class="w-[280px] lg:w-[300px] border-r border-border bg-bg-secondary flex flex-col h-full shrink-0 overflow-hidden">
                                                            <div class="px-4 py-3 border-b border-border bg-white/5 flex items-center justify-between shrink-0">
                                                                <span class="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                                                    <i class="ti ti-file-code text-accent text-sm"></i> calculateDrift.js
                                                                </span>
                                                                <span class="text-[9px] font-mono text-text-tertiary">javascript</span>
                                                            </div>
                                                            <div
                                                                class="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#07090c] leading-relaxed text-[#c2d1cb] select-text space-y-1">
                                                                <div class="line-code" id="lc-1"><span class="text-gray-500 mr-2.5 select-none">1</span><span
                                                                    class="text-indigo-400">function</span> <span class="text-yellow-400">calculateDrift</span>(<span
                                                                        class="text-orange-300">latency</span>, <span class="text-orange-300">jitter</span>) {</div>
                                                                <div class="line-code" id="lc-2"><span class="text-gray-500 mr-2.5 select-none">2</span> <span
                                                                    class="text-indigo-400">if</span> (<span class="text-orange-300">latency</span> &gt; <span
                                                                        class="text-cyan-400">250</span>) {</div>
                                                                <div class="line-code" id="lc-3"><span class="text-gray-500 mr-2.5 select-none">3</span> <span
                                                                    class="text-yellow-400">logDrift</span>(<span class="text-orange-300">latency</span> - <span
                                                                        class="text-cyan-400">250</span> + <span class="text-orange-300">jitter</span>);</div>
                                                                <div class="line-code" id="lc-4"><span class="text-gray-500 mr-2.5 select-none">4</span> }</div>
                                                                <div class="line-code" id="lc-5"><span class="text-gray-500 mr-2.5 select-none">5</span>}</div>
                                                            </div>
                                                            <div class="p-3 border-t border-border bg-bg-primary text-[10px] text-text-tertiary shrink-0">
                                                                คลิก <strong>Test Run</strong> เพื่อจำลองการวิเคราะห์ไวยากรณ์ (AST Traversal)
                                                            </div>
                                                        </div>

                                                        <!-- AST Canvas Area (Right Split) -->
                                                        <div class="flex-1 relative bg-grid overflow-hidden" id="ast-tree-canvas">
                                                            <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" id="svg-layer">
                                                                <path id="edge-1" class="edge-path" d="" />
                                                                <path id="edge-2" class="edge-path" d="" />
                                                                <path id="edge-3" class="edge-path" d="" />
                                                            </svg>

                                                            <!-- Nodes -->
                                                            <div class="workflow-node" style="left: 40px; top: 120px;" id="node-start">
                                                                <div class="node-header">
                                                                    <div class="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm"><i
                                                                        class="ti ti-code"></i></div>
                                                                    <span class="font-bold text-sm text-text-primary flex-1">Program</span>
                                                                </div>
                                                                <div class="node-body">
                                                                    <div class="font-mono text-[10px] text-text-secondary">
                                                                        type: "Program"<br>
                                                                            sourceType: "module"
                                                                    </div>
                                                                </div>
                                                                <div class="port right" id="port-start-out"></div>
                                                            </div>

                                                            <div class="workflow-node" style="left: 340px; top: 100px;" id="node-agent">
                                                                <div class="port left"></div>
                                                                <div class="node-header">
                                                                    <div class="w-6 h-6 rounded bg-accent/20 text-accent flex items-center justify-center text-sm"><i
                                                                        class="ti ti-braces"></i></div>
                                                                    <span class="font-bold text-sm text-text-primary flex-1">FunctionDeclaration</span>
                                                                    <span class="flex h-2 w-2 relative hidden" id="agent-spinner">
                                                                        <span
                                                                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                                                    </span>
                                                                </div>
                                                                <div class="node-body">
                                                                    <div
                                                                        class="bg-bg-primary border border-border rounded p-2 mb-2 font-mono text-[10px] text-text-secondary">
                                                                        id: Identifier (calculateDrift)<br>
                                                                            params: [latency, jitter]
                                                                    </div>
                                                                    <div class="flex justify-between items-center text-[10px]"><span>Node Type: Function</span><span
                                                                        class="text-accent" id="node-agent-status">Idle</span></div>
                                                                </div>
                                                                <div class="port right"></div>
                                                            </div>

                                                            <div class="workflow-node" style="left: 640px; top: 100px;" id="node-hitl">
                                                                <div class="port left"></div>
                                                                <div class="node-header">
                                                                    <div class="w-6 h-6 rounded bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-sm">
                                                                        <i class="ti ti-git-fork"></i>
                                                                    </div>
                                                                    <span class="font-bold text-sm text-text-primary flex-1">BinaryExpression</span>
                                                                </div>
                                                                <div class="node-body">
                                                                    <div
                                                                        class="bg-bg-primary border border-border rounded p-2 mb-2 font-mono text-[10px] text-text-secondary">
                                                                        left: latency<br>
                                                                            operator: "&gt;"<br>
                                                                                right: 250
                                                                            </div>
                                                                            <div class="flex justify-between items-center text-[10px]"><span>Node Type: Compare</span><span
                                                                                class="text-yellow-500" id="node-hitl-status">Idle</span></div>
                                                                    </div>
                                                                    <div class="port right"></div>
                                                                </div>

                                                                <div class="workflow-node" style="left: 940px; top: 120px;" id="node-end">
                                                                    <div class="port left"></div>
                                                                    <div class="node-header">
                                                                        <div class="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                                                                            <i class="ti ti-terminal-2"></i>
                                                                        </div>
                                                                        <span class="font-bold text-sm text-text-primary flex-1">CallExpression</span>
                                                                    </div>
                                                                    <div class="node-body">
                                                                        <div
                                                                            class="bg-bg-primary border border-border rounded p-2 mb-2 font-mono text-[10px] text-text-secondary">
                                                                            callee: logDrift<br>
                                                                                arguments: [drift]
                                                                        </div>
                                                                        <div class="flex justify-between items-center text-[10px]"><span>Node Type: Call</span><span
                                                                            class="text-text-tertiary">Ready</span></div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <!-- CENTER VIEW 3: LIVE CALL GRAPH -->
                                                        <div class="hidden flex-1 flex flex-col overflow-hidden relative" id="callgraph-view">
                                                            <!-- Toolbar -->
                                                            <div class="h-10 border-b border-border bg-bg-primary flex items-center px-4 justify-between shrink-0">
                                                                <div class="flex items-center gap-4">
                                                                    <div class="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
                                                                        <i class="ti ti-database text-accent"></i>
                                                                        <span>SQLite DB: <span class="text-accent">in-memory (active)</span></span>
                                                                    </div>
                                                                    <div class="flex items-center gap-1.5 text-[10px] text-text-secondary border-l border-border pl-4">
                                                                        <label for="graph-depth-selector">Depth:</label>
                                                                        <select id="graph-depth-selector" name="graph-depth-selector" onchange="changeGraphDepth(this.value)"
                                                                            class="bg-bg-secondary border border-border rounded text-[9.5px] text-text-secondary px-1.5 py-0.5 outline-none focus:border-accent">
                                                                            <option value="all">All (Show All)</option>
                                                                            <option value="1">1 (Direct Calls)</option>
                                                                            <option value="2">2 (Nested Calls)</option>
                                                                            <option value="3">3+ (Full Path)</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="flex items-center gap-2">
                                                                    <span id="sync-status-msg" class="text-[9px] text-text-tertiary hidden italic">Syncing AST...</span>
                                                                    <button onclick="refreshCallGraph()" id="btn-sync-graph"
                                                                        class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent hover:bg-accent/20 transition">
                                                                        <i class="ti ti-refresh" id="sync-icon"></i> Sync Tree-sitter
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <!-- Graph Workspace -->
                                                            <div id="cy-container" class="flex-1 w-full h-full bg-bg-primary"></div>

                                                            <!-- Floating Details Panel -->
                                                            <div id="cy-info-panel"
                                                                class="absolute top-4 right-4 w-72 bg-bg-secondary/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 transform translate-x-80 transition-transform duration-300 z-30">
                                                                <div class="flex justify-between items-start mb-3">
                                                                    <div class="min-w-0">
                                                                        <h4 id="node-name" class="font-bold text-accent text-sm truncate">---</h4>
                                                                        <p id="node-type" class="text-[9px] text-text-tertiary uppercase tracking-wider font-bold">---</p>
                                                                    </div>
                                                                    <button onclick="hideNodeDetails()" class="text-text-tertiary hover:text-white transition-colors"><i
                                                                        class="ti ti-x"></i></button>
                                                                </div>
                                                                <div class="space-y-4">
                                                                    <div>
                                                                        <p class="text-[9px] text-text-tertiary uppercase font-bold mb-1 flex items-center gap-1"><i
                                                                            class="ti ti-file-code"></i> Location</p>
                                                                        <p id="node-file"
                                                                            class="text-[10px] text-text-secondary font-mono bg-bg-primary/50 p-1.5 rounded border border-border/40 truncate">
                                                                            ---</p>
                                                                    </div>
                                                                    <div class="grid grid-cols-1 gap-3">
                                                                        <div>
                                                                            <p class="text-[9px] text-text-tertiary uppercase font-bold mb-2 flex items-center gap-1"><i
                                                                                class="ti ti-arrow-left-bar"></i> Inbound Callers</p>
                                                                            <div id="inbound-list" class="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                                                                                <p class="text-[10px] text-text-tertiary italic">None</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p class="text-[9px] text-text-tertiary uppercase font-bold mb-2 flex items-center gap-1"><i
                                                                                class="ti ti-arrow-right-bar"></i> Outbound Calls</p>
                                                                            <div id="outbound-list" class="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                                                                                <p class="text-[10px] text-text-tertiary italic">None</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- CENTER VIEW 4: DATABASE SCHEMA VISUALIZER -->
                                                        <div class="hidden flex-1 flex overflow-hidden relative" id="database-view">

                                                            <!-- Left Database Sidebar -->
                                                            <aside class="w-[200px] border-r border-border bg-bg-primary flex flex-col p-4 shrink-0 overflow-y-auto z-10">
                                                                <div class="mb-6">
                                                                    <h4 class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Database Management</h4>
                                                                    <nav class="flex flex-col gap-1">
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg bg-accent/10 text-accent border border-accent/20 cursor-default">
                                                                            <i class="ti ti-sitemap"></i> Schema Visualizer
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-table"></i> Tables
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-terminal-2"></i> Functions
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-bolt"></i> Triggers
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-list"></i> Enumerated Types
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-box-align-top"></i> Extensions
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-book"></i> Indexes
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-share"></i> Publications
                                                                        </a>
                                                                    </nav>
                                                                </div>

                                                                <div class="mb-6">
                                                                    <h4 class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Configuration</h4>
                                                                    <nav class="flex flex-col gap-1">
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-user-shield"></i> Roles
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-shield"></i> Policies
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-settings"></i> Settings
                                                                        </a>
                                                                    </nav>
                                                                </div>

                                                                <div>
                                                                    <h4 class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Platform</h4>
                                                                    <nav class="flex flex-col gap-1">
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-refresh"></i> Replication
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-device-floppy"></i> Backups
                                                                        </a>
                                                                        <a href="#"
                                                                            class="flex items-center gap-2 px-2.5 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition">
                                                                            <i class="ti ti-database-export"></i> Migrations
                                                                        </a>
                                                                    </nav>
                                                                </div>
                                                            </aside>

                                                            <!-- Schema Workspace Area -->
                                                            <div class="flex-1 flex flex-col overflow-hidden relative bg-bg-secondary">

                                                                <!-- Top Actions Bar -->
                                                                <div class="h-10 border-b border-border bg-bg-primary flex items-center px-4 justify-between shrink-0 z-10">
                                                                    <div class="flex items-center gap-2">
                                                                        <label for="schema-selector" class="text-[10px] text-text-tertiary">Schema:</label>
                                                                        <select
                                                                            class="bg-bg-secondary border border-border rounded text-[9.5px] text-text-primary px-1.5 py-0.5 outline-none focus:border-accent"
                                                                            id="schema-selector" name="schema-selector">
                                                                            <option value="public" selected>public</option>
                                                                            <option value="private">private</option>
                                                                            <option value="auth">auth</option>
                                                                        </select>
                                                                    </div>
                                                                    <div class="flex items-center gap-2">
                                                                        <button
                                                                            class="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-border text-[9.5px] font-bold text-text-secondary hover:text-white transition"
                                                                            id="copy-sql-btn" name="copy-sql-btn">
                                                                            <i class="ti ti-copy"></i> Copy as SQL
                                                                        </button>
                                                                        <button onclick="autoLayoutSchema()"
                                                                            class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent hover:bg-accent/20 transition"
                                                                            id="auto-layout-db-btn" name="auto-layout-db-btn">
                                                                            <i class="ti ti-layout-grid"></i> Auto layout
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <!-- ERD Interactive Canvas -->
                                                                <div class="flex-1 w-full h-full relative overflow-hidden bg-grid select-none" id="erd-canvas">

                                                                    <!-- SVG Connector Overlay -->
                                                                    <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" id="erd-svg-canvas">
                                                                        <g>
                                                                            <path id="erd-edge-1" class="edge-path" d=""
                                                                                style="stroke: rgba(120, 244, 191, 0.4); stroke-width: 1.5; fill: none;"></path>
                                                                            <path id="erd-edge-2" class="edge-path" d=""
                                                                                style="stroke: rgba(120, 244, 191, 0.4); stroke-width: 1.5; fill: none;"></path>
                                                                            <path id="erd-edge-3" class="edge-path" d=""
                                                                                style="stroke: rgba(120, 244, 191, 0.4); stroke-width: 1.5; fill: none;"></path>
                                                                            <path id="erd-edge-4" class="edge-path" d=""
                                                                                style="stroke: rgba(120, 244, 191, 0.4); stroke-width: 1.5; fill: none;"></path>
                                                                        </g>
                                                                    </svg>

                                                                    <!-- TABLE CARD 1: transactions -->
                                                                    <div class="db-table-card workflow-node" style="left: 100px; top: 100px;" id="tbl-transactions">
                                                                        <div class="node-header font-bold text-xs text-white justify-between">
                                                                            <div class="flex items-center gap-2">
                                                                                <i class="ti ti-table text-indigo-400"></i>
                                                                                <span>transactions</span>
                                                                            </div>
                                                                            <span class="text-[9px] text-text-tertiary">PK</span>
                                                                        </div>
                                                                        <div class="node-body p-0">
                                                                            <div class="flex flex-col text-[10px]">
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-transactions-id">
                                                                                    <span class="text-white font-semibold flex items-center gap-1"><i
                                                                                        class="ti ti-key text-yellow-500 text-[10px]"></i> transaction_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-transactions-order-id">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> order_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> date</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">timestamptz</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> amount</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">numeric</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> type</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> method</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div class="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> status</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- TABLE CARD 2: orders -->
                                                                    <div class="db-table-card workflow-node" style="left: 450px; top: 50px;" id="tbl-orders">
                                                                        <div class="node-header font-bold text-xs text-white justify-between">
                                                                            <div class="flex items-center gap-2">
                                                                                <i class="ti ti-table text-indigo-400"></i>
                                                                                <span>orders</span>
                                                                            </div>
                                                                            <span class="text-[9px] text-text-tertiary">PK</span>
                                                                        </div>
                                                                        <div class="node-body p-0">
                                                                            <div class="flex flex-col text-[10px]">
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-orders-id">
                                                                                    <span class="text-white font-semibold flex items-center gap-1"><i
                                                                                        class="ti ti-key text-yellow-500 text-[10px]"></i> order_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> customer_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> date</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">timestamptz</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> status</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> total_amount</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">numeric</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> paid_amount</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">numeric</span>
                                                                                </div>
                                                                                <div class="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition"
                                                                                    id="col-orders-conversation-id">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> conversation_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- TABLE CARD 3: conversations -->
                                                                    <div class="db-table-card workflow-node" style="left: 800px; top: 120px;" id="tbl-conversations">
                                                                        <div class="node-header font-bold text-xs text-white justify-between">
                                                                            <div class="flex items-center gap-2">
                                                                                <i class="ti ti-table text-indigo-400"></i>
                                                                                <span>conversations</span>
                                                                            </div>
                                                                            <span class="text-[9px] text-text-tertiary">PK</span>
                                                                        </div>
                                                                        <div class="node-body p-0">
                                                                            <div class="flex flex-col text-[10px]">
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-conversations-id">
                                                                                    <span class="text-white font-semibold flex items-center gap-1"><i
                                                                                        class="ti ti-key text-yellow-500 text-[10px]"></i> conversation_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> customer_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> channel</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> participant_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> created_at</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">timestamptz</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> status</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> first_touch_ad_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div class="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition"
                                                                                    id="col-conversations-owner-id">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> owner_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- TABLE CARD 4: tasks -->
                                                                    <div class="db-table-card workflow-node" style="left: 800px; top: 550px;" id="tbl-tasks">
                                                                        <div class="node-header font-bold text-xs text-white justify-between">
                                                                            <div class="flex items-center gap-2">
                                                                                <i class="ti ti-table text-indigo-400"></i>
                                                                                <span>tasks</span>
                                                                            </div>
                                                                            <span class="text-[9px] text-text-tertiary">PK</span>
                                                                        </div>
                                                                        <div class="node-body p-0">
                                                                            <div class="flex flex-col text-[10px]">
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-white font-semibold flex items-center gap-1"><i
                                                                                        class="ti ti-key text-yellow-500 text-[10px]"></i> id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">bigint</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-diamond text-cyan-400 text-[10px]"></i> task_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> customer_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-tasks-assignee-id">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> assignee_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> title</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> description</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div class="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> status</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- TABLE CARD 5: employees -->
                                                                    <div class="db-table-card workflow-node" style="left: 1150px; top: 250px;" id="tbl-employees">
                                                                        <div class="node-header font-bold text-xs text-white justify-between">
                                                                            <div class="flex items-center gap-2">
                                                                                <i class="ti ti-table text-indigo-400"></i>
                                                                                <span>employees</span>
                                                                            </div>
                                                                            <span class="text-[9px] text-text-tertiary">PK</span>
                                                                        </div>
                                                                        <div class="node-body p-0">
                                                                            <div class="flex flex-col text-[10px]">
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition"
                                                                                    id="col-employees-id">
                                                                                    <span class="text-white font-semibold flex items-center gap-1"><i
                                                                                        class="ti ti-key text-yellow-500 text-[10px]"></i> employee_id</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">uuid</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> first_name</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> last_name</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> role</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-diamond text-cyan-400 text-[10px]"></i> email</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> phone</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div
                                                                                    class="flex items-center justify-between px-3 py-1.5 border-b border-border/40 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle text-text-tertiary text-[8px]"></i> department</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                                <div class="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition">
                                                                                    <span class="text-text-secondary flex items-center gap-1"><i
                                                                                        class="ti ti-circle-filled text-emerald-400 text-[8px]"></i> status</span>
                                                                                    <span class="text-text-tertiary font-mono text-[8.5px]">text</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                                <!-- Legend Bar -->
                                                                <div
                                                                    class="h-10 border-t border-border bg-bg-primary flex items-center px-4 gap-4 shrink-0 text-[10px] text-text-secondary font-medium z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                                                                    <div class="flex items-center gap-1"><i class="ti ti-key text-yellow-500"></i> Primary key</div>
                                                                    <div class="flex items-center gap-1"><span class="font-bold text-indigo-400 text-xs">#</span> Identity
                                                                    </div>
                                                                    <div class="flex items-center gap-1"><i class="ti ti-diamond text-cyan-400 text-xs"></i> Unique</div>
                                                                    <div class="flex items-center gap-1"><i class="ti ti-circle text-text-tertiary text-[8px]"></i> Nullable
                                                                    </div>
                                                                    <div class="flex items-center gap-1"><i class="ti ti-circle-filled text-emerald-400 text-[8px]"></i>
                                                                        Non-Nullable</div>
                                                                </div>

                                                            </div>

                                                            <!-- CENTER VIEW 5: GKS VECTOR STORE & HNSW VISUALIZER -->
                                                            <div class="hidden flex-1 flex overflow-hidden relative font-sans" id="vector-view">

                                                                <!-- Left Vector Control Panel -->
                                                                <aside
                                                                    class="w-[280px] border-r border-border bg-bg-primary flex flex-col p-4 shrink-0 overflow-y-auto z-10 gap-5">
                                                                    <div>
                                                                        <h4
                                                                            class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                                                                            <i class="ti ti-adjustments-horizontal"></i> Index Configuration
                                                                        </h4>
                                                                        <div class="space-y-3">
                                                                            <div>
                                                                                <label for="vector-backend-type"
                                                                                    class="block text-[8.5px] font-bold text-text-secondary mb-1 uppercase tracking-wide">Index
                                                                                    Backend</label>
                                                                                <select id="vector-backend-type" name="vector-backend-type" onchange="toggleBackendParameters()"
                                                                                    class="w-full bg-bg-secondary border border-border rounded-lg p-2 text-xs text-text-primary focus:border-accent outline-none">
                                                                                    <option value="hnsw">HNSW Graph (In-process)</option>
                                                                                    <option value="bruteforce">Brute-Force Cosine (In-Memory)</option>
                                                                                </select>
                                                                            </div>

                                                                            <div id="hnsw-params-group" class="space-y-3">
                                                                                <div>
                                                                                    <label for="param-efSearch"
                                                                                        class="flex justify-between text-[8.5px] font-bold text-text-secondary mb-1 uppercase tracking-wide">
                                                                                        <span>efSearch (Query Precision)</span>
                                                                                        <span class="text-accent font-mono" id="val-efSearch">40</span>
                                                                                    </label>
                                                                                    <input type="range" id="param-efSearch" name="param-efSearch" min="5" max="200" value="40"
                                                                                        oninput="document.getElementById('val-efSearch').textContent = this.value"
                                                                                        class="w-full accent-accent bg-bg-secondary h-1 rounded-lg cursor-pointer">
                                                                                </div>
                                                                                <div>
                                                                                    <label
                                                                                        class="flex justify-between text-[8.5px] font-bold text-text-secondary mb-1 uppercase tracking-wide">
                                                                                        <span>M (Max Connections)</span>
                                                                                        <span class="text-indigo-400 font-mono">16</span>
                                                                                    </label>
                                                                                    <div
                                                                                        class="text-[10px] text-text-tertiary font-mono bg-bg-secondary border border-border/40 p-1.5 rounded">
                                                                                        M = 16 (Optimal for BGE-large)</div>
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <label for="param-threshold"
                                                                                    class="flex justify-between text-[8.5px] font-bold text-text-secondary mb-1 uppercase tracking-wide">
                                                                                    <span>Similarity Threshold</span>
                                                                                    <span class="text-accent font-mono" id="val-threshold">0.35</span>
                                                                                </label>
                                                                                <input type="range" id="param-threshold" name="param-threshold" min="0.0" max="1.0" step="0.05"
                                                                                    value="0.35" oninput="document.getElementById('val-threshold').textContent = this.value"
                                                                                    class="w-full accent-accent bg-bg-secondary h-1 rounded-lg cursor-pointer">
                                                                            </div>

                                                                            <div>
                                                                                <label for="param-topk"
                                                                                    class="flex justify-between text-[8.5px] font-bold text-text-secondary mb-1 uppercase tracking-wide">
                                                                                    <span>Top K (Max Hits)</span>
                                                                                    <span class="text-accent font-mono" id="val-topk">5</span>
                                                                                </label>
                                                                                <input type="range" id="param-topk" name="param-topk" min="1" max="10" value="5"
                                                                                    oninput="document.getElementById('val-topk').textContent = this.value"
                                                                                    class="w-full accent-accent bg-bg-secondary h-1 rounded-lg cursor-pointer">
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div class="border-t border-border/40 pt-4">
                                                                        <h4
                                                                            class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                                                                            <i class="ti ti-search"></i> Semantic Query
                                                                        </h4>
                                                                        <div class="space-y-3">
                                                                            <textarea id="vector-query-input" name="vector-query-input" aria-label="Semantic Query Input"
                                                                                class="w-full h-20 bg-bg-secondary border border-border rounded-lg p-2.5 text-xs text-text-primary focus:border-accent outline-none resize-none"
                                                                                placeholder="ป้อนคำถาม เช่น 'memory alignment policy' หรือ 'AST traversal'"></textarea>
                                                                            <button onclick="runVectorSearch()"
                                                                                class="w-full py-2 rounded-lg bg-accent text-bg-primary text-xs font-bold shadow-[0_0_15px_rgba(120,244,191,0.2)] hover:bg-[#9ef7d3] transition flex items-center justify-center gap-1.5">
                                                                                <i class="ti ti-sparkles"></i> Search Vector Store
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div class="border-t border-border/40 pt-4">
                                                                        <h4
                                                                            class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                                                                            <i class="ti ti-plus"></i> Ingest New Memory
                                                                        </h4>
                                                                        <div class="space-y-3">
                                                                            <textarea id="vector-ingest-text" name="vector-ingest-text" aria-label="New Memory Content"
                                                                                class="w-full h-16 bg-bg-secondary border border-border rounded-lg p-2 text-xs text-text-primary focus:border-accent outline-none resize-none"
                                                                                placeholder="เนื้อหาความจำ เช่น 'ADR-012: HNSW replaces brute-force at scale'"></textarea>
                                                                            <input id="vector-ingest-source" name="vector-ingest-source" aria-label="New Memory Source File"
                                                                                type="text" placeholder="แหล่งที่มา (เช่น adr-012.md)"
                                                                                class="w-full bg-bg-secondary border border-border rounded-lg p-1.5 text-[10px] text-text-primary focus:border-accent outline-none font-mono">
                                                                                <button onclick="ingestVectorDoc()"
                                                                                    class="w-full py-1.5 rounded-lg bg-bg-tertiary border border-border hover:border-accent hover:text-accent transition text-xs font-bold flex items-center justify-center gap-1.5">
                                                                                    <i class="ti ti-circle-plus"></i> Add to Index
                                                                                </button>
                                                                        </div>
                                                                    </div>
                                                                </aside>

                                                                <!-- HNSW Multi-Layer Visualization Canvas (Center) -->
                                                                <div class="flex-1 flex flex-col min-w-0 bg-[#080b0e] relative overflow-hidden">
                                                                    <!-- Canvas Toolbar -->
                                                                    <div
                                                                        class="h-10 border-b border-border bg-bg-primary flex items-center px-4 justify-between shrink-0 z-10">
                                                                        <div class="flex items-center gap-3">
                                                                            <span class="text-[10px] font-bold text-text-secondary flex items-center gap-1.5">
                                                                                <i class="ti ti-route text-accent"></i> HNSW Index Graph (3-Layer Hierarchy)
                                                                            </span>
                                                                            <span
                                                                                class="text-[9px] text-text-tertiary px-1.5 py-0.5 rounded bg-white/5 border border-border font-mono"
                                                                                id="lbl-index-docs-count">12 nodes</span>
                                                                        </div>
                                                                        <div class="flex items-center gap-2">
                                                                            <button onclick="rebuildHnswIndex()"
                                                                                class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition">
                                                                                <i class="ti ti-refresh"></i> Rebuild Index
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <!-- Visualization Area -->
                                                                    <div class="flex-1 relative overflow-hidden" id="hnsw-visualizer-area">
                                                                        <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" id="hnsw-svg-canvas">
                                                                            <!-- SVG lines will be rendered dynamically by JavaScript -->
                                                                        </svg>
                                                                        <!-- Multi-plane wrappers -->
                                                                        <div id="hnsw-planes-container"
                                                                            class="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none select-none">

                                                                            <!-- LAYER 2 -->
                                                                            <div
                                                                                class="hnsw-layer-plane relative border-t border-dashed border-indigo-500/10 h-1/4 flex items-center justify-center">
                                                                                <span
                                                                                    class="absolute left-4 top-2 text-[8px] font-mono text-indigo-400/50 uppercase tracking-widest font-bold">Layer
                                                                                    2 — Express Skip Lane</span>
                                                                                <div class="absolute inset-0 flex items-center justify-around px-20" id="hnsw-nodes-layer-2">
                                                                                    <!-- Layer 2 nodes -->
                                                                                </div>
                                                                            </div>

                                                                            <!-- LAYER 1 -->
                                                                            <div
                                                                                class="hnsw-layer-plane relative border-t border-dashed border-purple-500/10 h-1/4 flex items-center justify-center">
                                                                                <span
                                                                                    class="absolute left-4 top-2 text-[8px] font-mono text-purple-400/50 uppercase tracking-widest font-bold">Layer
                                                                                    1 — Sub-Express Lane</span>
                                                                                <div class="absolute inset-0 flex items-center justify-around px-12" id="hnsw-nodes-layer-1">
                                                                                    <!-- Layer 1 nodes -->
                                                                                </div>
                                                                            </div>

                                                                            <!-- LAYER 0 -->
                                                                            <div
                                                                                class="hnsw-layer-plane relative border-t border-dashed border-emerald-500/10 h-2/5 flex items-center justify-center">
                                                                                <span
                                                                                    class="absolute left-4 top-2 text-[8px] font-mono text-emerald-400/50 uppercase tracking-widest font-bold">Layer
                                                                                    0 — Base Document Lane (Nearest Neighbors)</span>
                                                                                <div class="absolute inset-0 flex items-center justify-around px-8" id="hnsw-nodes-layer-0">
                                                                                    <!-- Layer 0 nodes -->
                                                                                </div>
                                                                            </div>

                                                                        </div>

                                                                        <!-- Greedy Search Overlay Message -->
                                                                        <div id="hnsw-search-path-overlay"
                                                                            class="absolute bottom-4 left-4 bg-bg-secondary/90 border border-accent/20 rounded-xl p-3 max-w-sm pointer-events-none z-20 opacity-0 transition-opacity duration-300">
                                                                            <div class="flex items-center gap-2 mb-1">
                                                                                <span class="flex h-2 w-2 relative">
                                                                                    <span
                                                                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                                                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                                                                </span>
                                                                                <h5 class="text-[10px] font-bold text-white uppercase tracking-wider">HNSW Path Traversal</h5>
                                                                            </div>
                                                                            <p id="hnsw-path-desc" class="text-[9.5px] text-text-secondary leading-normal">
                                                                                Starting greedy search...
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <!-- Legend Bar -->
                                                                    <div
                                                                        class="h-10 border-t border-border bg-bg-primary flex items-center px-4 gap-4 shrink-0 text-[10px] text-text-secondary font-medium z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                                                                        <div class="flex items-center gap-1.5"><span
                                                                            class="w-2.5 h-2.5 rounded bg-indigo-500 border border-indigo-400/50"></span> Layer 2 Anchor</div>
                                                                        <div class="flex items-center gap-1.5"><span
                                                                            class="w-2.5 h-2.5 rounded bg-purple-500 border border-purple-400/50"></span> Layer 1 Anchor</div>
                                                                        <div class="flex items-center gap-1.5"><span
                                                                            class="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400/50"></span> Layer 0 Doc</div>
                                                                        <div class="flex items-center gap-1.5"><span class="w-4 h-[2px] bg-[#78f4bf] inline-block"></span>
                                                                            Search Hop Path</div>
                                                                    </div>
                                                                </div>

                                                                <!-- Right Search Results Panel (25%) -->
                                                                <aside class="w-[280px] border-l border-border bg-bg-primary flex flex-col shrink-0 overflow-hidden z-10">
                                                                    <div class="p-4 border-b border-border bg-white/5 flex flex-col gap-2 shrink-0">
                                                                        <h4 class="text-[9px] font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1"><i
                                                                            class="ti ti-percentage"></i> Search Performance</h4>
                                                                        <div class="flex justify-between items-center text-xs">
                                                                            <span class="text-text-secondary">Complexity:</span>
                                                                            <span class="font-mono text-accent font-bold" id="lbl-perf-complexity">O(log N)</span>
                                                                        </div>
                                                                        <div class="flex justify-between items-center text-xs">
                                                                            <span class="text-text-secondary">Graph Hops:</span>
                                                                            <span class="font-mono text-white font-bold" id="lbl-perf-hops">0 hops</span>
                                                                        </div>
                                                                        <div class="flex justify-between items-center text-xs">
                                                                            <span class="text-text-secondary">Query Latency:</span>
                                                                            <span class="font-mono text-white font-bold" id="lbl-perf-latency">0.00ms</span>
                                                                        </div>
                                                                    </div>

                                                                    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3" id="vector-results-container">
                                                                        <div class="text-center py-8 text-text-tertiary italic text-xs">
                                                                            กรอกคำค้นหาและกดปุ่มสืบค้นข้อมูลเวกเตอร์
                                                                        </div>
                                                                    </div>
                                                                </aside>

                                                            </div>

                                                            <!-- CENTER VIEW 6: COVIBE AI BENCHMARK DASHBOARD -->
                                                            <div class="hidden flex-1 flex overflow-hidden relative font-sans" id="benchmark-view">



                                                                <!-- Main Content Pane -->
                                                                <div class="flex-1 flex flex-col overflow-y-auto bg-bg-secondary p-4 sm:p-6 space-y-6">

                                                                    <!-- TOP KPI STATS -->
                                                                    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                        <!-- KPI-Card-01 : TASK IN FOCUS -->
                                                                        <div class="bg-bg-primary/60 border border-border/80 rounded-xl p-4">
                                                                            <div class="flex items-center justify-between mb-2">
                                                                                <span class="text-[9.5px] text-text-tertiary font-medium font-mono tracking-wider">TASK IN FOCUS</span>
                                                                                <span class="text-orange-400 relative flex h-2 w-2">
                                                                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                                                </span>
                                                                            </div>
                                                                            <div class="text-sm font-bold tracking-tight text-white leading-tight">Audio Player with Oscilloscope</div>
                                                                            <p class="text-[10px] text-orange-400 mt-1 font-mono">ทดสอบการควบคุม Web Audio API</p>
                                                                        </div>

                                                                        <!-- KPI-Card-02 : CHAMPION SPEED -->
                                                                        <div class="bg-bg-primary/60 border border-border/80 rounded-xl p-4">
                                                                            <div class="flex items-center justify-between mb-2">
                                                                                <span class="text-[9.5px] text-text-tertiary font-medium font-mono tracking-wider">CHAMPION SPEED</span>
                                                                                <i class="ti ti-bolt text-amber-400 text-sm"></i>
                                                                            </div>
                                                                            <div class="text-xl font-bold tracking-tight text-white">55.41 <span class="text-xs font-normal text-text-secondary">t/s</span></div>
                                                                            <p class="text-[10px] text-amber-400 mt-1 font-mono">Qwen 3.5 (4B)</p>
                                                                        </div>

                                                                        <!-- KPI-Card-03 : SAFE TUNING -->
                                                                        <div class="bg-bg-primary/60 border border-border/80 rounded-xl p-4">
                                                                            <div class="flex items-center justify-between mb-2">
                                                                                <span class="text-[9.5px] text-text-tertiary font-medium font-mono tracking-wider">SAFE TUNING</span>
                                                                                <i class="ti ti-settings text-amber-400 text-sm"></i>
                                                                            </div>
                                                                            <div class="text-sm font-bold tracking-tight text-amber-400">-104MHz Core Underclock</div>
                                                                            <p class="text-[10px] text-text-secondary mt-1 font-mono">MSI Afterburner Active (90% Power)</p>
                                                                        </div>

                                                                        <!-- KPI-Card-04 : FAILED RUNS -->
                                                                        <div class="bg-bg-primary/60 border border-border/80 rounded-xl p-4">
                                                                            <div class="flex items-center justify-between mb-2">
                                                                                <span class="text-[9.5px] text-text-tertiary font-medium font-mono tracking-wider">FAILED RUNS</span>
                                                                                <i class="ti ti-flag text-rose-500 text-sm"></i>
                                                                            </div>
                                                                            <div class="text-xl font-bold tracking-tight text-rose-400">3 Models</div>
                                                                            <p class="text-[10px] text-rose-500/80 mt-1 font-mono">เกิด TDR/Loop ทันทีบน VRAM 12GB</p>
                                                                        </div>
                                                                    </section>

                                                                    <!-- TAB 1: INTERACTIVE SIMULATOR (Default) -->
                                                                    <section id="tab-content-simulator" class="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                                                        <!-- LEFT PANEL: CONTROL & METRICS -->
                                                                        <div class="lg:col-span-1 space-y-6">
                                                                            <!-- MODEL SELECTOR -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 space-y-4 shadow-sm">
                                                                                <div>
                                                                                    <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
                                                                                        <i class="ti ti-cpu text-orange-400"></i>
                                                                                        โครงสร้างคอมโพเนนต์เสียงของ AI
                                                                                    </h3>
                                                                                    <p class="text-[10px] text-text-secondary mt-1 leading-normal">
                                                                                        คลิกเลือกโมเดลด้านล่างเพื่อสับเปลี่ยนตรรกะเสียงจำลองและการเรนเดอร์กราฟิก
                                                                                    </p>
                                                                                </div>

                                                                                <!-- Model Button List -->
                                                                                <div class="space-y-2" id="model-buttons-container">
                                                                                    <!-- ปุ่มจะได้รับการเรนเดอร์ผ่าน JS -->
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <!-- MID PANEL: PREVIEW / SANDBOX -->
                                                                        <div class="lg:col-span-2 flex flex-col h-[520px] bg-bg-primary/80 border border-border rounded-xl overflow-hidden shadow-lg">
                                                                            <!-- Terminal Top Bar -->
                                                                            <div class="bg-bg-primary/90 px-4 py-2.5 border-b border-border flex items-center justify-between">
                                                                                <div class="flex items-center space-x-2">
                                                                                    <div class="relative flex h-2 w-2">
                                                                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-55"></span>
                                                                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                                                    </div>
                                                                                    <span class="text-xs font-bold text-white">Audio-Component Sandbox</span>
                                                                                </div>

                                                                                <!-- Sandbox/Code Switch Toggle -->
                                                                                <div class="flex bg-bg-secondary p-0.5 rounded-lg border border-border">
                                                                                    <button onclick="togglePreviewMode(false)" id="btn-mode-sandbox"
                                                                                        class="px-2.5 py-1 rounded text-[9.5px] font-bold font-mono transition bg-orange-500 text-slate-950 shadow-sm">
                                                                                        ⚡ Live Sandbox
                                                                                    </button>
                                                                                    <button onclick="togglePreviewMode(true)" id="btn-mode-code"
                                                                                        class="px-2.5 py-1 rounded text-[9.5px] font-bold font-mono transition text-text-secondary hover:text-white">
                                                                                        💻 AI Source Code
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            <!-- Live Dynamic Sandbox Box -->
                                                                            <div class="flex-1 p-5 overflow-y-auto flex flex-col justify-between bg-bg-primary/20">

                                                                                <!-- 1. CODE PREVIEW VIEW -->
                                                                                <div id="code-preview-wrapper" class="hidden flex-1 flex flex-col space-y-3">
                                                                                    <div class="flex items-center justify-between text-[10px] font-mono text-text-secondary bg-bg-primary/60 px-3 py-1.5 rounded border border-border/40">
                                                                                        <span class="flex items-center gap-1.5">
                                                                                            <i class="ti ti-code text-orange-400"></i>
                                                                                            โค้ดผลลัพธ์จาก: <span id="code-model-title" class="text-orange-400 ml-1 font-bold">---</span>
                                                                                        </span>
                                                                                        <span id="code-model-speed" class="font-bold text-white">--- t/s</span>
                                                                                    </div>
                                                                                    <div class="flex-1 p-4 bg-bg-primary/40 border border-border rounded-xl font-mono text-[10px] text-text-secondary overflow-x-auto leading-relaxed select-all">
                                                                                        <pre id="code-display-block" class="whitespace-pre-wrap"></pre>
                                                                                    </div>
                                                                                    <div class="text-right">
                                                                                        <button onclick="copyCurrentCode()"
                                                                                            class="bg-bg-tertiary hover:bg-white/5 border border-border text-white px-3 py-1.5 rounded-lg text-[10.5px] font-mono transition inline-flex items-center gap-1.5">
                                                                                            <i class="ti ti-copy"></i>
                                                                                            คัดลอกโค้ดไปรัน (Copy)
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                <!-- 2. LIVE SANDBOX VIEW -->
                                                                                <div id="sandbox-preview-wrapper" class="flex-1 flex flex-col justify-between space-y-4">
                                                                                    <div class="bg-bg-primary/60 p-3 border border-border/60 rounded-xl flex items-center justify-between">
                                                                                        <div class="space-y-0.5">
                                                                                            <span class="text-[8.5px] font-bold font-mono tracking-wider text-orange-400 block uppercase">ACTIVE ENGINE PREVIEW</span>
                                                                                            <h4 id="active-engine-title" class="text-xs font-extrabold text-white">Engine Name</h4>
                                                                                        </div>
                                                                                        <!-- Live synth status beacon -->
                                                                                        <div id="synth-status-beacon"
                                                                                            class="hidden flex items-center space-x-1.5 font-mono text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                                                                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                                                                            <span>ACTIVE GENERATION: <span id="active-note-text">A2</span></span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <!-- Canvas Frame with audio-player-controls inside -->
                                                                                    <div class="flex-1 relative bg-bg-primary/90 border border-border rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                                                                                        <!-- Visualizer Oscilloscope Canvas -->
                                                                                        <canvas id="oscilloscope-canvas" class="absolute inset-0 w-full h-full"></canvas>

                                                                                        <!-- Standby overlays -->
                                                                                        <div id="canvas-standby-overlay"
                                                                                            class="absolute inset-0 bg-bg-primary/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10">
                                                                                            <div class="w-10 h-10 bg-orange-500/10 rounded-full border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2 animate-bounce">
                                                                                                <i class="ti ti-player-play text-lg"></i>
                                                                                            </div>
                                                                                            <h5 class="text-xs font-bold text-white">พร้อมจำลองสัญญาณเครื่องดนตรีและออสซิลโลสโคป</h5>
                                                                                            <p class="text-[9.5px] text-text-tertiary max-w-xs mt-1 leading-normal">
                                                                                                กดปุ่ม 'Play / จำลองเสียง' ด้านล่างเพื่อกำเนิดสัญญาณความถี่จำลองแบบเรียลไทม์ และตรวจวัดความเร็ว
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <!-- Playback Hardware controller bar -->
                                                                                    <div class="bg-bg-primary/60 p-3 border border-border/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                                                                                        <!-- Toggle Play -->
                                                                                        <div class="flex items-center space-x-2.5 w-full sm:w-auto">
                                                                                            <button onclick="toggleAudioPlayback()" id="btn-audio-playback"
                                                                                                class="w-full sm:w-auto px-4 py-2 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/10 transition flex items-center justify-center gap-1.5">
                                                                                                <i id="playback-btn-icon" class="ti ti-player-play"></i>
                                                                                                <span id="playback-btn-text">Play / จำลองเสียง</span>
                                                                                            </button>
                                                                                            <span id="audio-waveform-label" class="text-[9.5px] font-mono text-text-tertiary hidden sm:inline">Sine Sound</span>
                                                                                        </div>

                                                                                        <!-- Vol Control -->
                                                                                        <div class="flex items-center space-x-2.5 w-full sm:w-auto shrink-0">
                                                                                            <i class="ti ti-volume text-text-secondary text-sm"></i>
                                                                                            <div class="flex-1 sm:w-28">
                                                                                                <input oninput="updateAudioVolume(this.value)" type="range" min="0" max="1" step="0.1" value="0.4"
                                                                                                    class="w-full accent-orange-500 bg-bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer">
                                                                                            </div>
                                                                                            <span id="volume-label-text" class="text-[9.5px] font-mono text-text-secondary w-7 text-right">40%</span>
                                                                                        </div>
                                                                                    </div>

                                                                                </div>
                                                                            </div>

                                                                            <!-- Footer Status Bar inside Visualizer -->
                                                                            <div class="p-2.5 bg-bg-primary border-t border-border flex justify-between items-center text-[9px] font-mono text-text-tertiary px-4 shrink-0">
                                                                                <span>ACTIVE EXPERIMENT: Audio visualization algorithm benchmarking</span>
                                                                                <span id="experiment-status-text">STATUS: STANDBY</span>
                                                                            </div>
                                                                        </div>

                                                                        <!-- RIGHT PANEL: DETAILED TUNING & LOGS -->
                                                                        <div class="lg:col-span-1 space-y-6">
                                                                            <!-- Telemetry / HARDWARE MONITORS -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 space-y-4">
                                                                                <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
                                                                                    <i class="ti ti-activity text-orange-400"></i>
                                                                                    Telemetry / ตรวจสอบฮาร์ดแวร์จำลอง
                                                                                </h3>

                                                                                <!-- VRAM Progress Bar -->
                                                                                <div class="space-y-1">
                                                                                    <div class="flex justify-between text-[10px] font-mono">
                                                                                        <span class="text-text-secondary">GPU VRAM Load (RTX 3060 12GB):</span>
                                                                                        <span id="vram-load-text" class="text-orange-400 font-bold">5%</span>
                                                                                    </div>
                                                                                    <div class="h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                                                                                        <div id="vram-load-bar" class="h-full bg-orange-400 rounded-full transition-all duration-300" style="width: 5%"></div>
                                                                                    </div>
                                                                                    <div class="flex justify-between text-[8px] font-mono text-text-tertiary">
                                                                                        <span>ขีดจำกัดเสถียร: 11.2GB (Qwen 3)</span>
                                                                                        <span id="vram-capacity-text">ความจุตามรุ่น AI</span>
                                                                                    </div>
                                                                                </div>

                                                                                <!-- GPU Sensors Grid -->
                                                                                <div class="grid grid-cols-2 gap-2.5 pt-1">
                                                                                    <div class="bg-bg-primary/80 p-2.5 rounded-lg border border-border">
                                                                                        <span class="text-[8px] font-mono text-text-tertiary block uppercase">GPU Temp</span>
                                                                                        <span id="gpu-temp-text" class="text-sm font-extrabold font-mono text-amber-400">38°C</span>
                                                                                    </div>
                                                                                    <div class="bg-bg-primary/80 p-2.5 rounded-lg border border-border">
                                                                                        <span class="text-[8px] font-mono text-text-tertiary block uppercase">Clock Adjust</span>
                                                                                        <span class="text-sm font-extrabold font-mono text-amber-400">-104 MHz</span>
                                                                                    </div>
                                                                                </div>

                                                                                <!-- Safety Warning Badge (สำหรับ Qwen 3) -->
                                                                                <div id="safety-warning-box" class="hidden bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex gap-2 items-start">
                                                                                    <i class="ti ti-alert-triangle text-amber-400 shrink-0 mt-0.5 text-xs"></i>
                                                                                    <p class="text-[9.5px] text-amber-300 leading-normal">
                                                                                        แจ้งเตือนความปลอดภัย (Qwen 3 - 14B): โมเดลขนาดใหญ่อาจเกิด TDR/ไดรเวอร์การ์ดจอดับ หาก Context พุ่งเกิน 8K แนะนำให้จำกัด Context Layer
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <!-- Card 1: Micro Execution Log -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 space-y-4">
                                                                                <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
                                                                                    <i class="ti ti-terminal text-orange-400"></i>
                                                                                    Execution Trace / Live Log
                                                                                </h3>
                                                                                <div id="right-panel-logs" class="bg-bg-primary p-3 border border-border rounded-lg h-[240px] font-mono text-[9px] text-text-secondary space-y-1.5 overflow-y-auto">
                                                                                    <div class="text-text-tertiary">[System] Dashboard Standby. Ready for signal simulation...</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </section>

                                                                    <!-- TAB 2: OVERVIEW & ACTIVE CHAMPIONS (Hidden by default) -->
                                                                    <section id="tab-content-overview" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-6">

                                                                        <!-- LEFT PANEL: GRID & CHAMPIONS SUMMARY -->
                                                                        <div class="lg:col-span-2 space-y-6">
                                                                            <!-- Champions List Card -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                                <div class="flex items-center justify-between mb-5">
                                                                                    <div>
                                                                                        <h2 class="text-sm font-bold text-white flex items-center gap-1.5">
                                                                                            <i class="ti ti-award text-amber-400"></i>
                                                                                            The Champions of CoVibe (ทำเนียบสุดยอดโมเดล)
                                                                                        </h2>
                                                                                        <p class="text-[10px] text-text-secondary">วัดผลความแม่นยำและการประมวลผลบนฮาร์ดแวร์ RTX 3060 (12GB)</p>
                                                                                    </div>
                                                                                    <span class="text-[9px] font-mono bg-bg-primary border border-border text-text-secondary px-2 py-0.5 rounded">Safe-Tuned Active</span>
                                                                                </div>

                                                                                <!-- List container mapped dynamically via script -->
                                                                                <div class="space-y-3" id="champions-card-container"></div>
                                                                            </div>

                                                                            <!-- Bar Speed Chart -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                                <h3 class="text-xs font-bold text-slate-200 mb-3.5">เปรียบเทียบความเร็วโทเค็น (Tokens per Second)</h3>
                                                                                <div class="space-y-3.5" id="speed-bars-container"></div>
                                                                            </div>
                                                                        </div>

                                                                        <!-- RIGHT PANEL: SAFE MODE TUNING & DECOMMISSIONED -->
                                                                        <div class="space-y-6">
                                                                            <!-- Safe mode detailed card -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5 relative overflow-hidden">
                                                                                <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                                                    <i class="ti ti-settings text-8xl text-orange-400 rotate-45"></i>
                                                                                </div>

                                                                                <div class="flex items-center space-x-2 mb-4">
                                                                                    <div class="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                                                                        <i class="ti ti-lock text-amber-400 text-sm"></i>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 class="text-xs font-bold text-white">Safe Mode Tuning Settings</h3>
                                                                                        <p class="text-[9.5px] text-amber-400">จำกัดขีดจำกัดพลังงานการทำงานเพื่อรักษาเสถียรภาพ</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div class="bg-bg-primary/80 rounded-lg p-3 border border-border space-y-3">
                                                                                    <div class="flex justify-between items-center text-[10px] font-mono">
                                                                                        <span class="text-text-secondary">Core Underclock:</span>
                                                                                        <span class="text-amber-400">-104 MHz</span>
                                                                                    </div>
                                                                                    <div class="flex justify-between items-center text-[10px] font-mono">
                                                                                        <span class="text-text-secondary">Power Limit (Afterburner):</span>
                                                                                        <span class="text-amber-400">90% Max</span>
                                                                                    </div>
                                                                                    <div class="flex justify-between items-center text-[10px] font-mono">
                                                                                        <span class="text-text-secondary">GPU Priorities:</span>
                                                                                        <span class="text-orange-400">Power over Temp</span>
                                                                                    </div>
                                                                                    <div class="flex justify-between items-center text-[9px] font-mono border-t border-border/40 pt-2">
                                                                                        <span class="text-text-tertiary">Hardware Test Bed:</span>
                                                                                        <span class="text-slate-300">i7-8700K / 3060 12GB / 750W</span>
                                                                                    </div>
                                                                                </div>

                                                                                <p class="text-[9px] text-text-tertiary mt-3 leading-relaxed">
                                                                                    * ผลพวงหลังจากการวิเคราะห์หาสาเหตุหลัก (RCA) ได้ทำการปรับลดความเร็ว Core เพื่อหลีกเลี่ยงพลังงานกระชากจอดำ
                                                                                </p>
                                                                            </div>

                                                                            <!-- Decommissioned list -->
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                                <div class="flex items-center space-x-1.5 mb-3.5">
                                                                                    <i class="ti ti-circle-x text-rose-500 text-sm"></i>
                                                                                    <h3 class="text-xs font-bold text-slate-100">Failed Models (โมเดลที่ยกเลิก)</h3>
                                                                                </div>

                                                                                <p class="text-[10px] text-text-secondary mb-3.5">รายชื่อโมเดลที่ไม่เสถียรและก่อความเสียหายให้แก่ไดรเวอร์การ์ดจอจากการรัน 12GB VRAM</p>
                                                                                <div class="space-y-2.5" id="failed-models-container"></div>
                                                                            </div>
                                                                        </div>

                                                                    </section>

                                                                    <!-- TAB 3: TELEMETRY ANALYTICS (Real Data) -->
                                                                    <section id="tab-content-gap-analysis" class="hidden space-y-6">
                                                                        <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                            <div class="flex items-center space-x-1.5 mb-1.5">
                                                                                <i class="ti ti-activity text-orange-400"></i>
                                                                                <h2 class="text-sm font-bold text-white">Hardware Telemetry Analytics (EABS-01 Trace)</h2>
                                                                            </div>
                                                                            <p class="text-[10px] text-text-secondary max-w-3xl">
                                                                                วิเคราะห์ข้อมูลฮาร์ดแวร์จริงจากการรัน Benchmark ของโมเดลที่เลือก แสดงกราฟ Power Draw และ Temperature เพื่อตรวจสอบความเสถียรภายใต้ EABS-01 standard
                                                                            </p>
                                                                        </div>

                                                                        <div class="grid grid-cols-1 gap-6">
                                                                            <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5 h-[360px] flex flex-col shadow-sm">
                                                                                <div class="flex justify-between items-center mb-3">
                                                                                    <h3 class="text-xs font-bold text-slate-200">GPU Performance Trace (Power & Temp)</h3>
                                                                                    <div class="flex gap-2">
                                                                                        <span class="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">Power (W)</span>
                                                                                        <span class="text-[9px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">Temp (°C)</span>
                                                                                        <span class="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">VRAM (MB)</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="flex-1 relative">
                                                                                    <canvas id="telemetryChart"></canvas>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                    <!-- TAB 4: TRAINING & FINE-TUNING (Hidden by default) -->
                                                                    <section id="tab-content-training" class="hidden space-y-6">
                                                                        <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                            <div class="flex items-center space-x-1.5 mb-1.5">
                                                                                <i class="ti ti-users-minus text-orange-400"></i>
                                                                                <h2 class="text-sm font-bold text-white">ฝึกอบรม & พัฒนาโมเดล (Model Training & Fine-Tuning)</h2>
                                                                            </div>
                                                                            <p class="text-[10px] text-text-secondary max-w-3xl">
                                                                                ระบบจัดการจำลองการฝึกอบรม (SFT/LoRA Fine-Tuning) และตรวจสอบสถานะ Loss / GPU Metrics ขณะปรับแต่งโมเดล CoVibe
                                                                            </p>
                                                                        </div>

                                                                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                            <!-- Training Progress & Logs -->
                                                                            <div class="lg:col-span-2 space-y-6">
                                                                                <!-- Training Metrics Cards -->
                                                                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                                    <div class="bg-bg-primary/40 border border-border rounded-xl p-3.5">
                                                                                        <div class="text-[9px] text-text-tertiary font-mono uppercase tracking-wider">TRAINING LOSS</div>
                                                                                        <div class="text-lg font-bold text-amber-400 font-mono mt-1">0.842 <span class="text-xs font-normal text-text-secondary">(-12.4%)</span></div>
                                                                                        <p class="text-[8px] text-text-tertiary mt-1 font-mono">Target: &lt; 0.500</p>
                                                                                    </div>
                                                                                    <div class="bg-bg-primary/40 border border-border rounded-xl p-3.5">
                                                                                        <div class="text-[9px] text-text-tertiary font-mono uppercase tracking-wider">TRAINING EPOCHS</div>
                                                                                        <div class="text-lg font-bold text-white font-mono mt-1">3 / 10</div>
                                                                                        <p class="text-[8px] text-text-tertiary mt-1 font-mono">Step: 1,200 / 4,000</p>
                                                                                    </div>
                                                                                    <div class="bg-bg-primary/40 border border-border rounded-xl p-3.5">
                                                                                        <div class="text-[9px] text-text-tertiary font-mono uppercase tracking-wider">LEARNING RATE</div>
                                                                                        <div class="text-lg font-bold text-orange-400 font-mono mt-1">2e-5</div>
                                                                                        <p class="text-[8px] text-text-tertiary mt-1 font-mono">Cosine Decay Active</p>
                                                                                    </div>
                                                                                </div>

                                                                                <!-- Hyperparameters Table -->
                                                                                <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                                    <h3 class="text-xs font-bold text-slate-300 mb-3">พารามิเตอร์การฝึกอบรม (Hyperparameters)</h3>
                                                                                    <div class="overflow-x-auto">
                                                                                        <table class="w-full text-left text-[11px] font-mono text-slate-300">
                                                                                            <thead>
                                                                                                <tr class="border-b border-border/60 text-text-tertiary">
                                                                                                    <th class="pb-1.5 font-semibold">Parameter</th>
                                                                                                    <th class="pb-1.5 font-semibold">Current Value</th>
                                                                                                    <th class="pb-1.5 font-semibold">Description</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody class="divide-y divide-border/20">
                                                                                                <tr>
                                                                                                    <td class="py-2 font-bold text-orange-400">LoRA Rank (r)</td>
                                                                                                    <td class="py-2">16</td>
                                                                                                    <td class="py-2 text-text-secondary leading-normal">มิติการปรับลดของ Low-Rank Adapter สำหรับโมเดลภาษา</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td class="py-2 font-bold text-orange-400">LoRA Alpha</td>
                                                                                                    <td class="py-2">32</td>
                                                                                                    <td class="py-2 text-text-secondary leading-normal">Scaling factor สำหรับ LoRA Adapter weights</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td class="py-2 font-bold text-orange-400">Batch Size</td>
                                                                                                    <td class="py-2">4 (Micro) / 32 (Global)</td>
                                                                                                    <td class="py-2 text-text-secondary leading-normal">จำนวนตัวอย่างข้อมูลที่ป้อนเข้ารุ่นในแต่ละรอบย่อย</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td class="py-2 font-bold text-orange-400">Sequence Length</td>
                                                                                                    <td class="py-2">2,048 Tokens</td>
                                                                                                    <td class="py-2 text-text-secondary leading-normal">ขนาดหน้าต่าง Context สูงสุดสำหรับการคำนวณ Loss</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <!-- GPU Allocations / Resource Status -->
                                                                            <div class="space-y-6">
                                                                                <div class="bg-bg-primary/40 border border-border rounded-xl p-4 sm:p-5">
                                                                                    <h3 class="text-xs font-bold text-slate-300 mb-3">การจัดสรร GPU และหน่วยความจำ (Allocation)</h3>
                                                                                    <div class="space-y-3.5">
                                                                                        <div class="space-y-1">
                                                                                            <div class="flex justify-between text-[10px] font-mono">
                                                                                                <span class="text-text-secondary">RTX 3060 Local (Training VRAM)</span>
                                                                                                <span class="text-amber-400 font-bold">11.4 GB / 12 GB</span>
                                                                                            </div>
                                                                                            <div class="h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                                                                                                <div class="h-full bg-amber-500 rounded-full" style="width: 95%"></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="space-y-1">
                                                                                            <div class="flex justify-between text-[10px] font-mono">
                                                                                                <span class="text-text-secondary">GPU Core Load</span>
                                                                                                <span class="text-amber-400 font-bold">100%</span>
                                                                                            </div>
                                                                                            <div class="h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                                                                                                <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style="width: 100%"></div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="border-t border-border/40 pt-3 text-[10px] text-text-secondary leading-relaxed font-mono">
                                                                                            ⚡ <span class="text-amber-400 font-bold">TDR Warning Guard</span>: ตรวจจับ GPU Temp ที่ 68°C และจำกัดพลังงานไว้ที่ 90% เพื่อความปลอดภัยของระบบ
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                    <!-- TAB 5: CAMPAIGN REPORT (EABS-01 SUMMARY) -->
                                                                    <section id="tab-content-campaign" class="hidden space-y-6">
                                                                        <div class="bg-bg-primary/40 border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                                                                            <div>
                                                                                <div class="flex items-center space-x-2 mb-1">
                                                                                    <i class="ti ti-file-certificate text-orange-400 text-lg"></i>
                                                                                    <h2 class="text-base font-bold text-white uppercase tracking-tight">EABS-01 Campaign Summary: Sushi Skill-List</h2>
                                                                                </div>
                                                                                <p class="text-xs text-text-secondary">
                                                                                    Technical validation report for model <span class="text-orange-400 font-bold" id="summary-model-name">...</span>
                                                                                </p>
                                                                            </div>
                                                                            <div id="summary-overall-badge" class="px-4 py-2 rounded-xl border font-black text-sm uppercase tracking-widest shadow-lg">
                                                                                LOADING...
                                                                            </div>
                                                                        </div>

                                                                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                                                            <div class="lg:col-span-3 space-y-6">
                                                                                <!-- Levels Matrix -->
                                                                                <div class="bg-bg-primary/40 border border-border rounded-xl overflow-hidden shadow-md">
                                                                                    <table class="w-full text-left text-xs font-mono">
                                                                                        <thead class="bg-bg-primary/80 text-text-tertiary uppercase">
                                                                                            <tr>
                                                                                                <th class="p-4 border-b border-border">Level / Skill</th>
                                                                                                <th class="p-4 border-b border-border">Status</th>
                                                                                                <th class="p-4 border-b border-border">Mean TPS</th>
                                                                                                <th class="p-4 border-b border-border">Variance (CV)</th>
                                                                                                <th class="p-4 border-b border-border">Max Temp</th>
                                                                                                <th class="p-4 border-b border-border">Compliance</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody id="campaign-summary-body" class="divide-y divide-border/30 text-text-secondary">
                                                                                            <!-- Dynamic rows -->
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>

                                                                            <div class="space-y-6">
                                                                                <!-- Completion Score -->
                                                                                <div class="bg-bg-primary/40 border border-border rounded-xl p-6 text-center shadow-md">
                                                                                    <div class="text-[10px] text-text-tertiary font-mono mb-2 uppercase font-bold tracking-widest">Skill Completion</div>
                                                                                    <div class="text-5xl font-black text-white font-mono tracking-tighter" id="summary-completion-pct">0%</div>
                                                                                    <div class="mt-4 h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                                                                                        <div id="summary-completion-bar" class="h-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" style="width: 0%"></div>
                                                                                    </div>
                                                                                </div>

                                                                                <!-- Production Readiness -->
                                                                                <div class="bg-bg-primary/60 border border-border rounded-xl p-6 shadow-md">
                                                                                    <h4 class="text-[10px] font-bold text-text-tertiary mb-3 uppercase tracking-widest flex items-center gap-1.5">
                                                                                        <i class="ti ti-shield-check text-orange-400"></i>
                                                                                        Production Sign-off
                                                                                    </h4>
                                                                                    <div id="production-readiness-content" class="space-y-3.5">
                                                                                        <!-- Pass/Fail Criteria -->
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                </div>
                                                            </div>
                                                        </section>

                                                    </main>

                                                    <!-- HITL Modal (Global Overlay) -->
                                                    <div id="hitl-modal"
                                                        class="fixed inset-0 hitl-overlay z-[100] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 px-4">
                                                        <div
                                                            class="bg-bg-secondary border border-blue-500/30 rounded-2xl shadow-2xl max-w-md w-full p-5 lg:p-6 transform translate-y-4 transition-transform duration-300"
                                                            id="hitl-card">
                                                            <div class="flex items-center gap-3 mb-4">
                                                                <div
                                                                    class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl animate-pulse shrink-0">
                                                                    <i class="ti ti-shield-lock"></i>
                                                                </div>
                                                                <div class="min-w-0">
                                                                    <h3 class="font-bold text-base lg:text-lg text-white leading-tight truncate">AST Verification</h3>
                                                                    <p class="text-xs text-blue-400 truncate">Node: BinaryExpression Verification</p>
                                                                </div>
                                                            </div>

                                                            <p class="text-sm text-text-secondary mb-4">
                                                                Agent <span class="font-mono text-accent">eva-cli</span> is requesting verification for the conditional code
                                                                execution path:
                                                            </p>

                                                            <div
                                                                class="bg-bg-primary border border-border rounded-xl p-3 font-mono text-xs text-gray-300 mb-6 shadow-inner overflow-x-auto whitespace-nowrap">
                                                                <span class="text-text-tertiary">if (</span><span class="text-red-400">latency &gt; 250</span><span
                                                                    class="text-text-tertiary">) {... }</span>
                                                            </div>

                                                            <div class="flex gap-3">
                                                                <button onclick="resolveHitl(false)"
                                                                    class="flex-1 py-2 lg:py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-white/5 transition">Halt</button>
                                                                <button onclick="resolveHitl(true)"
                                                                    class="flex-1 py-2 lg:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition shadow-[0_0_15px_rgba(37,99,235,0.4)]">Verify</button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div> <!-- Close MAIN WRAPPER -->

                                                <!-- FAB Terminal Button -->
                                                <button id="fab-terminal" class="fab-terminal-btn" onclick="toggleTerminal()" title="เปิด Terminal">
                                                    <i class="ti ti-terminal"></i>
                                                </button>

                                                <!-- Floating Terminal Window (Matching user reference) -->
                                                <div id="floating-terminal" class="floating-terminal-window">
                                                    <!-- Header -->
                                                    <div class="terminal-hdr" id="terminal-drag-header">
                                                        <div class="flex items-center gap-3">
                                                            <div class="flex gap-1.5 shrink-0">
                                                                <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] cursor-pointer hover:brightness-90 animate-pulse"
                                                                    onclick="toggleTerminal()"></span>
                                                                <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                                                                <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                                                            </div>
                                                            <div class="font-mono text-[10px] text-text-secondary select-none truncate max-w-[150px] sm:max-w-none">
                                                                covibe-agent-pipeline ~ sh
                                                            </div>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            <div class="flex items-center">
                                                                <label for="terminal-shell-selector" class="text-[9px] text-text-tertiary font-sans mr-1.5">เอเจนต์:</label>
                                                                <select class="shell-select" id="terminal-shell-selector">
                                                                    <option value="gemini">Gemini CLI (Official)</option>
                                                                    <option value="system">System Shell (Raw Command)</option>
                                                                    <option value="eva" selected>EVA Agent (eva-cli)</option>
                                                                    <option value="qwen">Qwen Coder (qwen-cli)</option>
                                                                </select>
                                                            </div>
                                                            <span class="w-1.5 h-4 bg-[#ff5f56] rounded-full shrink-0 status-dot-orange"></span>
                                                        </div>
                                                    </div>

                                                    <!-- Body -->
                                                    <div class="flex-1 overflow-y-auto p-3 bg-[#06080a] font-mono text-[9px] lg:text-[10px] leading-relaxed break-words"
                                                        id="terminal-output">
                                                        <!-- Terminal outputs go here -->
                                                    </div>

                                                    <!-- Input Area -->
                                                    <div
                                                        class="p-2 lg:p-3 border-t border-border bg-[#06080a] flex items-center shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                                                        <span class="text-accent text-xs font-mono mr-2.5 font-bold">$</span>
                                                        <input type="text" id="terminal-input" placeholder="พิมพ์คำสั่งที่นี่ (เช่น npm run test)..."
                                                            class="flex-1 min-w-0 bg-transparent border-none text-[11px] font-mono text-text-primary focus:outline-none placeholder-text-tertiary"
                                                            onkeypress="handleTerminalInput(event)">
                                                    </div>
                                                </div>


                                                <script>
                                                    let models = { }, selectedModel = '', isPlaying = false;
                                                    let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0, currentDomain = 'overview';
                                                    let sidebarExpanded = true;

                                                    const domainRegistry = {
                                                        overview: {
                                                        title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
                                                    items: [
                                                    {id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchTab('simulator') },
                                                    {id: 'roadmap', label: 'Manager Board', icon: 'ti ti-layout-kanban', action: () => switchMainView('roadmap') },
                                                    {id: 'agents', label: 'Agent Roster', icon: 'ti ti-users', action: () => switchTab('training') }
                                                    ]
      },
                                                    gks: {
                                                        title: 'Genesis Knowledge', subtitle: 'Code Intelligence', icon: 'ti ti-brain',
                                                    items: [
                                                    {id: 'structure', label: 'Code Structure', icon: 'ti ti-hierarchy-2', action: () => switchMainView('callgraph') },
                                                    {id: 'logic', label: 'Business Logic', icon: 'ti ti-script', action: () => { } },
                                                    {id: 'graph', label: 'Codebase Graph', icon: 'ti ti-share', action: () => switchMainView('canvas') }
                                                    ]
      },
                                                    gdb: {
                                                        title: 'Block DB', subtitle: 'Atomic Memory', icon: 'ti ti-database',
                                                    items: [
                                                    {id: 'explorer', label: 'Explorer Hub', icon: 'ti ti-table', action: () => switchDomainSubTab('explorer') },
                                                    {id: 'processing', label: 'Processing Lab', icon: 'ti ti-microscope', action: () => switchDomainSubTab('processing') },
                                                    {id: 'retrieval', label: 'Retrieval Studio', icon: 'ti ti-search', action: () => switchDomainSubTab('retrieval') },
                                                    {id: 'symbol-link', label: 'Symbol Linker', icon: 'ti ti-link', action: () => switchDomainSubTab('symbol-link') },
                                                    {id: 'visualizer', label: 'HNSW Space', icon: 'ti ti-binary-tree', action: () => switchDomainSubTab('visualizer') }
                                                    ]
      },
                                                    benchmark: {
                                                        title: 'Benchmark', subtitle: 'Performance', icon: 'ti ti-trending-up',
                                                    items: [
                                                    {id: 'bench-control', label: 'Execution', icon: 'ti ti-player-play', action: () => switchMainView('benchmark') },
                                                    {id: 'telemetry', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchTab('gap-analysis') },
                                                    {id: 'reports', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchTab('campaign') }
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
      ids.forEach(id => { const el = document.getElementById(id); if(el) {el.classList.add('hidden'); el.classList.remove('flex'); } });
                                                    const target = document.getElementById(view + '-view') || document.getElementById(view) || document.getElementById(view + '-container');
                                                    if (target) {target.classList.remove('hidden'); if(view !== 'roadmap') target.classList.add('flex'); }
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

                                                    function runSrsSimulation(q) {console.log(`Querying SRS for: ${q}`); }

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
        } catch(e) { }
    }

    window.onload = () => {switchDomain('overview'); animateReactor(); loadBenchmarkData(); };
                                                </script>

                                            </body>

                                        </html>
