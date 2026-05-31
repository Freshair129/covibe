import re
import os

source_path = r'G:\covibe\codev_dashboard.html'
dest_path = r'G:\covibe\codev_dashboard.html'
dest_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(source_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Update Domain C Registry for 5-Tab Modular structure
new_gdb_items = r"""
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
"""

content = re.sub(r'gdb: {.*?items: \[.*?\]\s+},', new_gdb_items, content, flags=re.DOTALL)

# 2. Inject Sub-Tab Manager Logic
new_js_logic = r"""
    // --- Domain C Sub-tab Manager ---
    function switchDomainSubTab(tabId) {
      // Hide all Domain C sub-views
      document.querySelectorAll('.gdb-sub-view').forEach(view => view.classList.add('hidden'));
      
      // Show targeted sub-view
      const target = document.getElementById(`gdb-view-${tabId}`);
      if (target) {
        target.classList.remove('hidden');
        if (tabId === 'visualizer') {
          setTimeout(initHnswVisualizer, 100);
        }
      }

      // Update sidebar active state for sub-items
      document.querySelectorAll('.sub-nav-item').forEach(btn => {
        const isActive = btn.getAttribute('data-sub-id') === tabId;
        btn.classList.toggle('text-accent', isActive);
        btn.classList.toggle('bg-accent/10', isActive);
        btn.classList.toggle('border', isActive);
        btn.classList.toggle('border-accent/20', isActive);
        btn.classList.toggle('text-text-tertiary', !isActive);
      });
    }

    // --- SRS Pipeline Simulation ---
    function runSrsSimulation(query) {
      if (!query) return;
      logTerminal('sys', `Initializing SRS Pipeline for query: "${query}"`);
      
      setTimeout(() => {
        logTerminal('sys', '[Stage 1] Executing Semantic Search via Jina-v5 (HNSW Index)...');
        logTerminal('sys', '  - Retrieved 20 candidates from L0-L2 layers.');
        
        setTimeout(() => {
          logTerminal('sys', '[Stage 2] Neural Reranking via Jina Reranker v3...');
          logTerminal('eva', '  - Precision refined. Sorted Top-5 by cross-attention score.');
          
          setTimeout(() => {
            logTerminal('sys', '[Stage 3] Scanning for @SymbolID patterns...');
            logTerminal('eva', '  - Match found: @calculateDrift. Fetching live AST content...');
            logTerminal('sys', 'SRS Context Assembled. Ready for Agent reasoning.');
          }, 1000);
        }, 1200);
      }, 800);
    }
"""

if 'function switchDomainSubTab' not in content:
    content = content.replace('// --- Domain & Sidebar Logic ---', new_js_logic + '\n    // --- Domain & Sidebar Logic ---')

# 3. Refactor Domain C HTML Sections
modular_gdb_html = r"""
      <!-- CENTER VIEW 3: GENESIS BLOCK DB (Domain C) -->
      <div class="hidden flex-1 flex flex-col overflow-hidden relative font-sans" id="gdb-view-container">
        
        <!-- MODULE HUD -->
        <div class="bg-bg-secondary/60 border-b border-border p-4 flex items-center justify-between backdrop-blur-md">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Active Model</span>
              <span id="gdb-active-model" class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold">Jina-Code-v5</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Cache Hit</span>
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                <span id="gdb-cache-rate" class="text-[10px] font-mono font-bold text-white">84.2%</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <i class="ti ti-bolt text-amber-400 text-xs"></i>
            <span class="text-[10px] font-bold text-text-tertiary uppercase">Latency Saved:</span>
            <span class="text-[10px] font-mono font-bold text-amber-400">12.4s total</span>
          </div>
        </div>

        <div class="flex-1 overflow-hidden relative">
          <!-- C1: EXPLORER HUB -->
          <section id="gdb-view-explorer" class="gdb-sub-view h-full flex flex-col p-6 space-y-6">
             <div class="bg-bg-primary/40 border border-border rounded-2xl p-6 shadow-2xl flex-1 overflow-y-auto">
                <h3 class="text-xs font-black text-white uppercase tracking-widest mb-4">Raw Symbol Table</h3>
                <table class="w-full text-left text-[11px] font-mono">
                  <thead class="text-text-tertiary border-b border-white/5 uppercase">
                    <tr><th class="p-3">ID</th><th class="p-3">Type</th><th class="p-3">File</th><th class="p-3">Last Index</th></tr>
                  </thead>
                  <tbody class="text-text-secondary divide-y divide-white/5">
                    <tr><td class="p-3">calculateDrift</td><td class="p-3 text-accent">Function</td><td class="p-3">gks/algo.ts</td><td class="p-3">2m ago</td></tr>
                    <tr><td class="p-3">addNode</td><td class="p-3 text-accent">Method</td><td class="p-3">gks/graph.ts</td><td class="p-3">5m ago</td></tr>
                  </tbody>
                </table>
             </div>
          </section>

          <!-- C2: PROCESSING LAB -->
          <section id="gdb-view-processing" class="gdb-sub-view hidden h-full flex flex-col p-6 space-y-6">
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                <div class="bg-bg-primary/40 border border-border rounded-2xl p-6 space-y-6">
                  <h3 class="text-xs font-black text-white uppercase tracking-widest">Model Zoo</h3>
                  <div class="space-y-3">
                    <button class="w-full p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between group hover:bg-indigo-500/20 transition-all">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl shadow-lg"><i class="ti ti-brand-jina"></i></div>
                        <div class="text-left"><div class="text-sm font-black text-white">Jina-Code-v5</div><div class="text-[10px] text-text-tertiary">768 Dim | Late Chunking</div></div>
                      </div>
                      <div class="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center"><div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div></div>
                    </button>
                    <button class="w-full p-4 rounded-2xl bg-bg-secondary/40 border border-border flex items-center justify-between group hover:border-white/20 transition-all">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-tertiary text-xl"><i class="ti ti-rocket"></i></div>
                        <div class="text-left"><div class="text-sm font-black text-text-secondary">Voyage-Code-3</div><div class="text-[10px] text-text-tertiary">2048 Dim | Precision SOTA</div></div>
                      </div>
                    </button>
                  </div>
                </div>
                <div class="bg-bg-primary/40 border border-border rounded-2xl p-6">
                   <h3 class="text-xs font-black text-white uppercase tracking-widest mb-4">Semantic Chunking Preview</h3>
                   <div class="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-text-tertiary h-[300px] overflow-y-auto">
                     <span class="text-accent">[Chunk #1]</span> function calculateDrift(latency, jitter) {<br>
                     &nbsp;&nbsp;return (latency * 0.8) + (jitter * 0.2);<br>
                     }<br><br>
                     <span class="text-accent">[Chunk #2]</span> // Metadata: Domain=Benchmark, Type=Algorithm
                   </div>
                </div>
             </div>
          </section>

          <!-- C3: RETRIEVAL STUDIO -->
          <section id="gdb-view-retrieval" class="gdb-sub-view hidden h-full flex flex-col p-6 space-y-6">
             <div class="bg-bg-primary/60 border border-border rounded-2xl p-6 shadow-xl space-y-6 flex-1 flex flex-col">
                <div class="flex gap-4">
                   <input type="text" id="srs-query-input" placeholder="Enter technical query..." class="flex-1 bg-black/40 border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent font-sans">
                   <button onclick="runSrsSimulation(document.getElementById('srs-query-input').value)" class="px-8 rounded-xl bg-accent text-slate-950 font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Query Pipeline</button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                   <div class="bg-black/20 rounded-2xl border border-white/5 p-4 flex flex-col">
                      <div class="flex justify-between items-center mb-4"><span class="text-[10px] font-black text-text-tertiary uppercase">Stage 1: Semantic Candidates</span><span class="text-[9px] font-mono text-text-tertiary">Top 20</span></div>
                      <div class="space-y-2 overflow-y-auto flex-1 pr-2">
                        <div class="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300">"drift calculation logic in gks..." <span class="float-right text-emerald-400 font-bold">0.82</span></div>
                      </div>
                   </div>
                   <div class="bg-black/20 rounded-2xl border border-white/5 p-4 flex flex-col">
                      <div class="flex justify-between items-center mb-4"><span class="text-[10px] font-black text-text-tertiary uppercase">Stage 2: Reranked Results</span><span class="text-[9px] font-mono text-accent">Top 5 (Precision)</span></div>
                      <div class="space-y-2 overflow-y-auto flex-1 pr-2">
                        <div class="p-3 rounded-lg bg-accent/10 border border-accent/20 text-[10px] text-white">"function calculateDrift(latency, jitter)..." <span class="float-right text-accent font-bold">0.97</span></div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <!-- C4: SYMBOL LINKER -->
          <section id="gdb-view-symbol-link" class="gdb-sub-view hidden h-full flex flex-col p-6 space-y-6">
             <div class="flex-1 flex gap-6">
                <div class="w-1/3 bg-bg-primary/40 border border-border rounded-2xl p-6">
                   <h3 class="text-xs font-black text-white uppercase tracking-widest mb-4">Linked Knowledge</h3>
                   <div class="space-y-3">
                     <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent transition-all cursor-pointer group">
                        <div class="flex items-center gap-2 mb-2"><i class="ti ti-notes text-accent"></i> <span class="text-xs font-bold text-white">Drift Correction Docs</span></div>
                        <p class="text-[10px] text-text-tertiary leading-relaxed">@calculateDrift is used to adjust WebSocket timing based on jitter.</p>
                     </div>
                   </div>
                </div>
                <div class="flex-1 bg-black/80 border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                   <div class="bg-bg-tertiary px-4 py-2 border-b border-border flex justify-between items-center">
                     <span class="text-[10px] font-black text-white uppercase tracking-widest">Live Code: gks/algo.ts</span>
                     <span class="text-[9px] font-mono text-accent">Line 42-45</span>
                   </div>
                   <div class="p-6 font-mono text-xs text-indigo-300 leading-relaxed overflow-y-auto">
                     <span class="text-slate-500">41</span><br>
                     <span class="text-slate-500">42</span> &nbsp; <span class="text-purple-400">function</span> <span class="text-white font-bold">calculateDrift</span>(latency, jitter) {<br>
                     <span class="text-slate-500">43</span> &nbsp; &nbsp; <span class="text-purple-400">const</span> alpha = <span class="text-amber-400">0.8</span>;<br>
                     <span class="text-slate-500">44</span> &nbsp; &nbsp; <span class="text-purple-400">return</span> (latency * alpha) + (jitter * (<span class="text-amber-400">1</span> - alpha));<br>
                     <span class="text-slate-500">45</span> &nbsp; }
                   </div>
                </div>
             </div>
          </section>

          <!-- C5: VISUALIZER -->
          <section id="gdb-view-visualizer" class="gdb-sub-view hidden h-full flex flex-col relative">
             <div class="absolute inset-0 bg-grid opacity-10"></div>
             <div class="relative z-10 flex h-full">
                <aside class="w-[280px] border-r border-border bg-bg-primary/60 p-4 shrink-0 overflow-y-auto">
                   <h4 class="text-[9px] font-black text-text-tertiary uppercase tracking-wider mb-4">HNSW Space Graph</h4>
                   <div class="space-y-4">
                      <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div class="text-[8px] font-black text-emerald-400 uppercase mb-1">Index Status</div>
                        <div class="text-lg font-black text-white font-mono uppercase">Optimized</div>
                      </div>
                   </div>
                </aside>
                <div class="flex-1 relative" id="hnsw-visualizer-canvas-new">
                    <div class="absolute inset-0 flex flex-col justify-around p-20 opacity-20 pointer-events-none">
                      <div class="h-1 border-t border-dashed border-indigo-500"></div>
                      <div class="h-1 border-t border-dashed border-purple-500"></div>
                      <div class="h-1 border-t border-dashed border-emerald-500"></div>
                    </div>
                </div>
             </div>
          </section>
        </div>
      </div>
"""

# Surgical Replacement
if 'id="gdb-view-container"' not in content:
    # Remove old database and vector views
    content = re.sub(r'<div class="hidden flex-1 flex overflow-hidden relative" id="database-view">.*?</div>\s+<!-- CENTER VIEW 5: VECTOR.*?</div>', modular_gdb_html, content, flags=re.DOTALL)

# 4. Update switchMainView
if "view === 'gdb'" not in content:
    content = content.replace("} else if (view === 'benchmark') {", 
                              "} else if (view === 'gdb') {\n          document.getElementById('gdb-view-container').classList.remove('hidden');\n          document.getElementById('gdb-view-container').classList.add('flex');\n          if (leftSidebar) leftSidebar.classList.remove('hidden');\n          if (btnDatabase) activeBtn(btnDatabase);\n          switchDomainSubTab('explorer');\n        } else if (view === 'benchmark') {")

    content = content.replace("roadmap.classList.add('hidden');", 
                              "roadmap.classList.add('hidden');\n        const gdbContainer = document.getElementById('gdb-view-container');\n        if (gdbContainer) {\n          gdbContainer.classList.add('hidden');\n          gdbContainer.classList.remove('flex');\n        }")

# 5. Save
with open(dest_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(dest_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modular Domain C Refactor Complete.")
