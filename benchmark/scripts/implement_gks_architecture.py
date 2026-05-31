import re
import os

source_path = r'G:\covibe\benchmark\ui\codev_dashboard_temp.html'
dest_path = r'G:\covibe\codev_dashboard.html'

with open(source_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Update Navigation Logic
# We need to add the Domain-based Navigation (Top Domain Bar)
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

# Replace the existing header
content = re.sub(r'<header.*?</header>', top_domain_bar_html, content, flags=re.DOTALL)

# 2. Modern Glass Sidebar Injection
glass_sidebar_html = r"""
      <!-- MODERN GLASS SIDEBAR -->
      <aside id="glass-sidebar" class="w-64 bg-bg-secondary/80 border-r border-border flex flex-col transition-all duration-300 relative z-40 backdrop-blur-xl">
        <div class="p-5 flex flex-col gap-6 h-full overflow-hidden">
          
          <!-- Context Brand Area -->
          <div class="flex items-center gap-3 pb-6 border-b border-white/5">
            <div id="sidebar-context-icon" class="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-xl border border-accent/20">
              <i class="ti ti-layout-dashboard"></i>
            </div>
            <div class="min-w-0">
              <h2 id="sidebar-context-title" class="text-sm font-black text-white uppercase tracking-tight truncate">Overview</h2>
              <p id="sidebar-context-subtitle" class="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Project Center</p>
            </div>
          </div>

          <!-- Dynamic Sub-domain Navigation -->
          <nav id="glass-subnav" class="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
            <!-- Items injected by JS -->
          </nav>

          <!-- Bottom Menu -->
          <div class="pt-6 border-t border-white/5 flex flex-col gap-2">
            <button class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text-tertiary hover:text-white hover:bg-white/5 transition-all">
              <i class="ti ti-user-circle text-lg"></i> <span>User Profile</span>
            </button>
            <button id="sidebar-toggle-btn" onclick="toggleSidebar()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text-tertiary hover:text-white hover:bg-white/5 transition-all">
              <i class="ti ti-layout-sidebar-left-collapse text-lg" id="sidebar-toggle-icon"></i> <span id="sidebar-toggle-text">Collapse Sidebar</span>
            </button>
          </div>
        </div>
      </aside>
"""

# We need to wrap the main layout in a flex-row to support the sidebar
content = content.replace('<main class="flex-1 flex overflow-hidden relative bg-bg-primary">', 
                          '<div class="flex-1 flex flex-row overflow-hidden relative bg-bg-primary">' + glass_sidebar_html + '<main class="flex-1 flex flex-col min-w-0 h-full relative">')
content = content.replace('</main>', '</main></div>')

# 3. JS Navigation Logic Update
domain_logic_js = r"""
    // --- Domain & Sidebar Logic ---
    let currentDomain = 'overview';
    let sidebarExpanded = true;

    const domainRegistry = {
      overview: {
        title: 'Overview', subtitle: 'Project Center', icon: 'ti ti-layout-dashboard',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie', action: () => switchTab('dashboard') },
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
          { id: 'obsidian', label: 'Obsidian View', icon: 'ti ti-notes', action: () => switchMainView('database') },
          { id: 'vector', label: 'Vector Store', icon: 'ti ti-binary-tree', action: () => switchMainView('vector') },
          { id: 'graphrag', label: 'GraphRAG', icon: 'ti ti-vector-triangle', action: () => {} }
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
      
      // Update Top Nav
      document.querySelectorAll('.domain-tab-btn').forEach(btn => {
        const isActive = btn.id === `domain-btn-${domainId}`;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('bg-white/5', isActive);
        btn.classList.toggle('border-white/10', isActive);
        btn.classList.toggle('text-text-tertiary', !isActive);
      });

      // Update Sidebar Brand
      document.getElementById('sidebar-context-title').textContent = config.title;
      document.getElementById('sidebar-context-subtitle').textContent = config.subtitle;
      document.getElementById('sidebar-context-icon').innerHTML = `<i class="${config.icon}"></i>`;

      // Update Sub-nav Items
      const navContainer = document.getElementById('glass-subnav');
      navContainer.innerHTML = config.items.map(item => `
        <button onclick="handleSubNavClick('${item.id}', this)" data-sub-id="${item.id}" class="sub-nav-item group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text-tertiary hover:text-white hover:bg-white/5 transition-all w-full text-left">
          <i class="${item.icon} text-lg transition-transform group-hover:scale-110"></i>
          <span class="sidebar-text transition-opacity duration-300">${item.label}</span>
        </button>
      `).join('');

      // Auto-trigger first item
      if (config.items.length > 0) {
        handleSubNavClick(config.items[0].id, navContainer.firstElementChild);
      }
    }

    function handleSubNavClick(itemId, element) {
      const config = domainRegistry[currentDomain];
      const item = config.items.find(i => i.id === itemId);
      
      document.querySelectorAll('.sub-nav-item').forEach(btn => {
        btn.classList.remove('text-accent', 'bg-accent/10', 'border', 'border-accent/20');
        btn.classList.add('text-text-tertiary');
      });

      element.classList.remove('text-text-tertiary');
      element.classList.add('text-accent', 'bg-accent/10', 'border', 'border-accent/20');

      if (item && item.action) item.action();
    }

    function toggleSidebar() {
      const aside = document.getElementById('glass-sidebar');
      const toggleIcon = document.getElementById('sidebar-toggle-icon');
      const toggleText = document.getElementById('sidebar-toggle-text');
      sidebarExpanded = !sidebarExpanded;

      if (sidebarExpanded) {
        aside.style.width = '16rem';
        toggleIcon.className = 'ti ti-layout-sidebar-left-collapse text-lg';
        toggleText.style.display = 'inline';
        document.querySelectorAll('.sidebar-text').forEach(t => t.style.opacity = '1');
      } else {
        aside.style.width = '4.5rem';
        toggleIcon.className = 'ti ti-layout-sidebar-left-expand text-lg';
        toggleText.style.display = 'none';
        document.querySelectorAll('.sidebar-text').forEach(t => t.style.opacity = '0');
      }
    }
"""

# Inject JS into script section
content = content.replace('window.addEventListener(\'load\', () => {', domain_logic_js + '\n    window.addEventListener(\'load\', () => {\n      switchDomain(\'overview\');')

# Save result
with open(dest_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("GKS Architecture Implementation Complete.")
