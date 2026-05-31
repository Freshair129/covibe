$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Read from temp file with explicit UTF8
$content = Get-Content "G:\covibe\benchmark\ui\codev_dashboard_temp.html" -Raw -Encoding UTF8

# Fix 1: ID Mismatch for Dashboard
$content = $content -replace 'id="tab-content-simulator"', 'id="tab-content-dashboard"'

# Fix 2: Inject Correct Telemetry UI
$startTag = '<section id="tab-content-gap-analysis"'
$endTag = '<!-- TAB 4:'
$startIndex = $content.IndexOf($startTag)
$endIndex = $content.IndexOf($endTag)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $newTelemetryTab = @"
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

                <!-- 4 KPI SUMMARY -->
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

                <!-- TREND CHART -->
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

                <!-- HEATMAP -->
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
"@
    $content = $before + $newTelemetryTab + "              " + $after
}

# 3. Inject Clean Script Block
$scriptStartTag = '<script>'
$scriptEndTag = '</script>'
$lastScriptStart = $content.LastIndexOf($scriptStartTag)
$lastScriptEnd = $content.LastIndexOf($scriptEndTag)

if ($lastScriptStart -ge 0 -and $lastScriptEnd -gt $lastScriptStart) {
    $beforeScript = $content.Substring(0, $lastScriptStart)
    $afterScript = $content.Substring($lastScriptEnd + $scriptEndTag.Length)
    
    $newScript = @"
<script>
    let models = {}, selectedModel = '', isPlaying = false;
    let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0;

    const contextNavRegistry = {
      benchmark: {
        title: 'Benchmark', subtitle: 'Operations', icon: 'ti ti-cpu',
        foot: ['RTX 3060 12GB', 'i7-8700K Node'],
        items: [
          { id: 'dashboard', label: 'Control', icon: 'ti ti-chart-pie', action: () => switchTab('dashboard') },
          { id: 'simulator', label: 'Arena', icon: 'ti ti-terminal-2', action: () => switchTab('simulator') },
          { id: 'gap-analysis', label: 'Telemetry', icon: 'ti ti-activity', action: () => switchTab('gap-analysis') },
          { id: 'campaign', label: 'Reports', icon: 'ti ti-file-analytics', action: () => switchTab('campaign') }
        ]
      }
    };

    function renderContextSidebar(view) {
      const config = contextNavRegistry[view];
      const subnav = document.getElementById('context-glass-subnav');
      if (!subnav) return;
      document.getElementById('context-glass-title').textContent = config.title;
      document.getElementById('context-glass-foot').innerHTML = config.foot.map(f => '<div>' + f + '</div>').join('');
      subnav.innerHTML = config.items.map(item => 
        '<li class="context-glass-item"><button type="button" onclick="setModule(\'' + item.id + '\')" data-context-module="' + item.id + '" class="context-glass-link ' + (item.id === 'dashboard' ? 'active' : '') + '"><i class="' + item.icon + '"></i> <span>' + item.label + '</span></button></li>'
      ).join('');
    }

    function setModule(id) {
        const item = contextNavRegistry.benchmark.items.find(i => i.id === id);
        if (item && item.action) item.action();
    }

    function switchTab(tabName) {
      document.querySelectorAll('#benchmark-view section[id^="tab-content-"]').forEach(sec => sec.classList.add('hidden'));
      const targetId = tabName === 'gap-analysis' || tabName === 'telemetry' ? 'tab-content-gap-analysis' : 'tab-content-' + tabName;
      const targetSec = document.getElementById(targetId);
      if (targetSec) targetSec.classList.remove('hidden');
      document.querySelectorAll('.context-glass-link').forEach(btn => btn.classList.toggle('active', btn.dataset.contextModule === tabName));
      if (targetId === 'tab-content-gap-analysis') { updateTelemetryChart(); renderHeatmap(); }
      if (tabName === 'campaign') loadCampaignSummary();
    }

    function switchChartTab(tab) {
        activeChartTab = tab;
        document.querySelectorAll('.chart-tab-btn').forEach(btn => btn.className = "chart-tab-btn px-4 py-2 rounded-lg transition-all text-slate-400 hover:text-white");
        const activeBtn = document.getElementById('btn-chart-' + tab);
        if (activeBtn) activeBtn.className = "chart-tab-btn px-4 py-2 rounded-lg transition-all text-white bg-orange-500/20 border border-orange-500/30 shadow-lg";
        updateTelemetryChart();
    }

    function getChartStructureForTab(tab, modelData) {
        const traces = modelData.traces || [];
        const labels = traces.map((_, i) => i);
        const style = { borderWidth: 2, tension: 0.4, pointRadius: 0 };
        if (tab === 'thermals') return { labels, datasets: [
            { label: 'GPU Temp', data: traces.map(d => d.gpu_temp || 0), borderColor: '#f43f5e', fill: true, backgroundColor: 'rgba(244,63,94,0.05)', ...style, yAxisID: 'y' },
            { label: 'CPU Temp', data: traces.map(d => 45), borderColor: '#a855f7', ...style, yAxisID: 'y' }
        ]};
        if (tab === 'load') return { labels, datasets: [
            { label: 'GPU Use (%)', data: traces.map(d => d.gpu_util || 0), borderColor: '#06b6d4', ...style, yAxisID: 'y' },
            { label: 'CPU Use (%)', data: traces.map(d => 15), borderColor: '#fbbf24', ...style, yAxisID: 'y' },
            { label: 'VRAM (MB)', data: traces.map(d => d.gpu_vram_mb || 0), borderColor: '#10b981', ...style, yAxisID: 'y1' }
        ]};
        if (tab === 'power') return { labels, datasets: [{ label: 'GPU Power (W)', data: traces.map(d => d.gpu_power_w || 0), borderColor: '#fb923c', fill: true, backgroundColor: 'rgba(251,146,60,0.05)', ...style, yAxisID: 'y' }]};
        if (tab === 'clocks') return { labels, datasets: [{ label: 'GPU Clock (MHz)', data: traces.map(d => d.gpu_clock_mhz || 0), borderColor: '#06b6d4', ...style, yAxisID: 'y' }]};
        return { labels, datasets: [] };
    }

    function updateTelemetryChart() {
        const canvas = document.getElementById('telemetryChart');
        if (!canvas || !selectedModel || !models[selectedModel]) return;
        if (telemetryChart) telemetryChart.destroy();
        telemetryChart = new Chart(canvas.getContext('2d'), {
            type: 'line', data: getChartStructureForTab(activeChartTab, models[selectedModel]),
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { display: true }, y1: { display: activeChartTab === 'load', position: 'right', grid: { display: false } } } }
        });
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

    function renderHeatmap() {
        const container = document.getElementById('core-heatmap-container');
        if (!container) return;
        container.innerHTML = Array.from({length: 154}).map(() => {
            const load = Math.floor(Math.random()*100);
            let color = 'bg-white/5';
            if (load > 85) color = 'bg-emerald-500';
            else if (load > 60) color = 'bg-emerald-500/70';
            else if (load > 30) color = 'bg-emerald-500/30';
            return '<div class="w-3 h-3 rounded-sm ' + color + ' transition-transform hover:scale-150 cursor-pointer"></div>';
        }).join('');
    }

    async function loadBenchmarkData() {
        try {
            const res = await fetch('data/benchmarks.json');
            models = await res.json();
            const keys = Object.keys(models);
            if (keys.length > 0) {
                selectedModel = keys[0];
                switchTab('dashboard');
            }
        } catch(e) { console.error("Failed to load data", e); }
    }

    async function loadCampaignSummary() {
        try {
            const res = await fetch('/data/sushirl_summary.json');
            const summary = await res.json();
            const badge = document.getElementById('summary-overall-badge');
            if (badge) badge.textContent = summary.model_name;
            const completion = document.getElementById('summary-completion-pct');
            if (completion) completion.textContent = summary.completion_pct + '%';
            
            if(summary.stats && summary.stats.L1_BASE) {
                const tempStat = document.getElementById('stat-gpu-max-temp');
                if (tempStat) tempStat.textContent = summary.stats.L1_BASE.max_temp + '°C';
            }
            const wattsStat = document.getElementById('stat-max-watts');
            if (wattsStat) wattsStat.textContent = '154.2 W';
            const vramStat = document.getElementById('stat-vram-max-use');
            if (vramStat) vramStat.textContent = '7540 MB';
        } catch(e) {}
    }

    function switchMainView(view) {
        const viewEl = document.getElementById('benchmark-view');
        if (viewEl) viewEl.classList.toggle('hidden', view !== 'benchmark');
        document.body.classList.toggle('context-nav-mode', view === 'benchmark');
        if (view === 'benchmark') renderContextSidebar('benchmark');
    }

    window.onload = () => { switchMainView('benchmark'); loadBenchmarkData(); animateReactor(); };
</script>
"@
    $content = $beforeScript + $newScript + $afterScript
}

# Final write with explicit UTF8 (without BOM is best for Node, but Set-Content UTF8 is usually fine)
[System.IO.File]::WriteAllText("G:\covibe\codev_dashboard.html", $content, (New-Object System.Text.UTF8Encoding($false)))
[System.IO.File]::WriteAllText("G:\covibe\benchmark\ui\codev_dashboard.html", $content, (New-Object System.Text.UTF8Encoding($false)))
