import re

file_path = r'G:\covibe\codev_dashboard.html'
file_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject 4 KPI blocks and trend chart
new_telemetry_html = r"""
<section id="tab-content-gap-analysis" class="hidden space-y-6 relative">
                <!-- TOP GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div class="bg-bg-primary/40 border border-border rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[300px]">
                    <canvas id="reactor-canvas" width="180" height="180"></canvas>
                    <div class="absolute text-center pointer-events-none">
                        <span id="telemetry-gpu-power-center" class="text-2xl font-black text-white font-mono">0.0W</span>
                    </div>
                  </div>
                  <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-6 shadow-xl space-y-6">
                        <div class="flex justify-between items-center"><h4 class="text-xs font-black text-white uppercase">GPU Monitor</h4><span id="telemetry-gpu-fan" class="text-[10px] font-mono text-orange-400 font-bold">FAN: 0%</span></div>
                        <div class="space-y-4">
                            <div><div class="flex justify-between text-[10px] font-bold mb-1"><span>TEMPERATURE</span><span id="telemetry-gpu-temp-label" class="text-white font-mono">0°C</span></div><div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5"><div id="telemetry-gpu-temp-bar" class="h-full bg-gradient-to-r from-orange-500 to-rose-500" style="width: 0%"></div></div></div>
                            <div class="grid grid-cols-2 gap-4 pt-2">
                              <div class="bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><span class="text-[8px] font-black text-text-tertiary block uppercase mb-1">Clock</span><span id="telemetry-gpu-clock-label" class="text-xs font-mono font-bold text-orange-400">0 MHz</span></div>
                              <div class="bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><span class="text-[8px] font-black text-text-tertiary block uppercase mb-1">VRAM</span><span id="telemetry-gpu-vram-label" class="text-xs font-mono font-bold text-emerald-400">0 MB</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-6 shadow-xl space-y-6">
                        <div class="flex justify-between items-center"><h4 class="text-xs font-black text-white uppercase">CPU Telemetry</h4><span id="telemetry-cpu-power" class="text-[10px] font-mono text-indigo-400 font-bold">PWR: 0W</span></div>
                        <div class="space-y-4">
                            <div><div class="flex justify-between text-[10px] font-bold mb-1"><span>PACKAGE TEMP</span><span id="telemetry-cpu-temp-label" class="text-white font-mono">0°C</span></div><div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5"><div id="telemetry-cpu-temp-bar" class="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style="width: 0%"></div></div></div>
                            <div class="grid grid-cols-2 gap-4 pt-2">
                              <div class="bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><span class="text-[8px] font-black text-text-tertiary block uppercase mb-1">CPU Load</span><span id="telemetry-cpu-usage-label" class="text-xs font-mono font-bold text-indigo-400">0%</span></div>
                              <div class="bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><span class="text-[8px] font-black text-text-tertiary block uppercase mb-1">System RAM</span><span id="telemetry-sys-ram" class="text-xs font-mono font-bold text-amber-400">0 MB</span></div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                <!-- 4 STRATEGIC SUMMARY BLOCKS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-4 shadow-xl">
                        <span class="text-[9px] font-black text-text-tertiary uppercase tracking-widest block mb-2">Heatmap Status</span>
                        <div class="text-xl font-black text-white font-mono uppercase" id="stat-heatmap-summary">OPTIMIZED</div>
                    </div>
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-4 shadow-xl">
                        <span class="text-[9px] font-black text-text-tertiary uppercase tracking-widest block mb-2">GPU MAX Temp</span>
                        <div class="text-xl font-black text-rose-400 font-mono" id="stat-gpu-max-temp">0°C</div>
                    </div>
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-4 shadow-xl">
                        <span class="text-[9px] font-black text-text-tertiary uppercase tracking-widest block mb-2">VRAM Max Use</span>
                        <div class="text-xl font-black text-emerald-400 font-mono" id="stat-vram-max-use">0 MB</div>
                    </div>
                    <div class="bg-bg-primary/60 border border-border rounded-2xl p-4 shadow-xl">
                        <span class="text-[9px] font-black text-text-tertiary uppercase tracking-widest block mb-2">Max Watts</span>
                        <div class="text-xl font-black text-cyan-400 font-mono" id="stat-max-watts">0.0 W</div>
                    </div>
                </div>

                <!-- TREND MATRIX -->
                <div class="bg-bg-primary/40 border border-border rounded-2xl p-6 shadow-2xl h-[480px] flex flex-col relative overflow-hidden">
                  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4 z-10">
                    <h3 class="text-xs font-black text-white uppercase tracking-widest">Fitted Trend Analysis Matrix</h3>
                    <div class="flex bg-black/60 p-1 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-tighter">
                        <button onclick="switchChartTab('thermals')" id="btn-chart-thermals" class="chart-tab-btn px-4 py-2 rounded-lg transition-all text-white bg-orange-500/20 border border-orange-500/30">TEMPERATURE</button>
                        <button onclick="switchChartTab('clocks')" id="btn-chart-clocks" class="chart-tab-btn px-4 py-2 rounded-lg transition-all text-slate-400">CLOCKS</button>
                        <button onclick="switchChartTab('load')" id="btn-chart-load" class="chart-tab-btn px-4 py-2 rounded-lg transition-all text-slate-400">LOAD & RAM</button>
                        <button onclick="switchChartTab('power')" id="btn-chart-power" class="chart-tab-btn px-4 py-2 rounded-lg transition-all text-slate-400">POWER</button>
                    </div>
                  </div>
                  <div class="flex-1 relative z-10 w-full h-full min-h-[300px]"><canvas id="telemetryChart"></canvas></div>
                </div>

                <!-- GitHub-style Core Heatmap -->
                <section class="bg-bg-primary/40 border border-border rounded-2xl p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xs font-black text-white uppercase tracking-widest">Core Density Heatmap</h3>
                        <div class="flex items-center gap-1.5 text-[9px] font-bold text-text-tertiary uppercase">
                            <span>Less</span>
                            <div class="flex gap-0.5 mx-2"><div class="w-2.5 h-2.5 bg-white/5 rounded-sm"></div><div class="w-2.5 h-2.5 bg-emerald-500/30 rounded-sm"></div><div class="w-2.5 h-2.5 bg-emerald-500/60 rounded-sm"></div><div class="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div></div>
                            <span>More</span>
                        </div>
                    </div>
                    <div id="core-heatmap-container" class="flex flex-wrap gap-1"></div>
                </section>
              </section>
"""

# Replace the existing gap-analysis section
content = re.sub(r'<section id="tab-content-gap-analysis".*?</section>', new_telemetry_html, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(file_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("KPIs and Charts Re-injected.")
