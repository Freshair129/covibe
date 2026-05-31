import re
import os

html_path = r'G:\covibe\codev_dashboard.html'
html_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(html_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Expand Model Zoo in C2 (Processing Lab)
graph_zoo_html = r"""
                <div class="bg-bg-primary/40 border border-border rounded-2xl p-6 space-y-6">
                  <div class="flex justify-between items-center">
                    <h3 class="text-xs font-black text-white uppercase tracking-widest">Graph Intelligence Zoo</h3>
                    <span class="text-[9px] font-bold text-text-tertiary px-2 py-0.5 rounded-full border border-white/5 bg-white/5">171 Models Available</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onclick="setGdbModel('GraphsGPT-8W')" class="p-3 rounded-xl bg-bg-secondary/40 border border-border flex items-center gap-3 group hover:border-accent/30 transition-all text-left">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg"><i class="ti ti-binary-tree"></i></div>
                      <div class="min-w-0">
                        <div class="text-[11px] font-black text-white truncate">GraphsGPT-8W</div>
                        <div class="text-[8px] text-text-tertiary uppercase">Reasoning LLM</div>
                      </div>
                    </button>
                    <button onclick="setGdbModel('Graphormer-v2')" class="p-3 rounded-xl bg-bg-secondary/40 border border-border flex items-center gap-3 group hover:border-accent/30 transition-all text-left">
                      <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg"><i class="ti ti-hierarchy-2"></i></div>
                      <div class="min-w-0">
                        <div class="text-[11px] font-black text-white truncate">Graphormer-Rerank</div>
                        <div class="text-[8px] text-text-tertiary uppercase">Sub-graph Reranker</div>
                      </div>
                    </button>
                    <button onclick="setGdbModel('Ultra-50G')" class="p-3 rounded-xl bg-bg-secondary/40 border border-border flex items-center gap-3 group hover:border-accent/30 transition-all text-left">
                      <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg"><i class="ti ti-poker-chip"></i></div>
                      <div class="min-w-0">
                        <div class="text-[11px] font-black text-white truncate">Ultra-50G</div>
                        <div class="text-[8px] text-text-tertiary uppercase">Knowledge Reasoning</div>
                      </div>
                    </button>
                    <button onclick="setGdbModel('RGCN-v1')" class="p-3 rounded-xl bg-bg-secondary/40 border border-border flex items-center gap-3 group hover:border-accent/30 transition-all text-left">
                      <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg"><i class="ti ti-input-search"></i></div>
                      <div class="min-w-0">
                        <div class="text-[11px] font-black text-white truncate">RGCN-Relational</div>
                        <div class="text-[8px] text-text-tertiary uppercase">Pattern Discovery</div>
                      </div>
                    </button>
                  </div>
                </div>
"""

# Inject before the Chunking Preview in C2
if 'Graph Intelligence Zoo' not in content:
    content = content.replace('<div class="bg-bg-primary/40 border border-border rounded-2xl p-6">', 
                              graph_zoo_html + '\n                <div class="bg-bg-primary/40 border border-border rounded-2xl p-6">')

# 2. Update Retrieval Studio (C3) with "Graph-Augmented" mode
graph_retrieval_toggle = r"""
                <div class="flex items-center gap-4 mb-4">
                   <div class="flex bg-black/60 p-1 rounded-xl border border-white/5 text-[9px] font-black uppercase">
                      <button id="btn-mode-dense" class="px-4 py-1.5 rounded-lg transition-all text-white bg-indigo-500/20 border border-indigo-500/30">Dense Vector</button>
                      <button id="btn-mode-graph" class="px-4 py-1.5 rounded-lg transition-all text-text-tertiary hover:text-white">Graph-Augmented</button>
                   </div>
                   <span class="text-[9px] text-text-tertiary italic">Graph reasoning improves precision for complex dependencies by 24%</span>
                </div>
"""

if 'btn-mode-graph' not in content:
    content = content.replace('<div class="flex gap-4">', graph_retrieval_toggle + '\n                <div class="flex gap-4">')

# 3. Add JS helper to change active model
js_helpers = r"""
    function setGdbModel(modelName) {
      const badge = document.getElementById('gdb-active-model');
      if (badge) {
        badge.textContent = modelName;
        logTerminal('sys', `Switched GDB Engine to: ${modelName}`);
        
        // Visual feedback
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
      }
    }
"""

if 'function setGdbModel' not in content:
    content = content.replace('// --- Domain C Sub-tab Manager ---', js_helpers + '\n    // --- Domain C Sub-tab Manager ---')

# 4. Save
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(html_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Graph AI Zoo Integration Complete.")
