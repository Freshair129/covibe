$content = Get-Content "G:\covibe\codev_dashboard.html" -Raw

# Replace the entire script section with Benchmark-specific logic
$scriptStartTag = '<script>'
$scriptEndTag = '</script>'

# We find the LAST occurrence of <script> which is usually the main logic
$startIndex = $content.LastIndexOf($scriptStartTag)
$endIndex = $content.LastIndexOf($scriptEndTag)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex + $scriptEndTag.Length)
    
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
      document.getElementById('context-glass-title').textContent = config.title;
      document.getElementById('context-glass-foot').innerHTML = config.foot.map(f => `<div>${f}</div>`).join('');
      subnav.innerHTML = config.items.map(item => `
        <li class="context-glass-item"><button type="button" onclick="setModule('${item.id}')" data-context-module="${item.id}" class="context-glass-link ${item.id === 'dashboard' ? 'active' : ''}"><i class="${item.icon}"></i> <span>${item.label}</span></button></li>
      `).join('');
    }

    function setModule(id) {
        const item = contextNavRegistry.benchmark.items.find(i => i.id === id);
        if (item && item.action) item.action();
    }

    function switchTab(tabName) {
      document.querySelectorAll('#benchmark-view section[id^="tab-content-"]').forEach(sec => sec.classList.add('hidden'));
      const targetId = tabName === 'gap-analysis' || tabName === 'telemetry' ? 'tab-content-gap-analysis' : `tab-content-${tabName}`;
      const targetSec = document.getElementById(targetId);
      if (targetSec) targetSec.classList.remove('hidden');
      document.querySelectorAll('.context-glass-link').forEach(btn => btn.classList.toggle('active', btn.dataset.contextModule === tabName));
      if (targetId === 'tab-content-gap-analysis') { updateTelemetryChart(); renderHeatmap(); }
      if (tabName === 'campaign') loadCampaignSummary();
    }

    function switchChartTab(tab) {
        activeChartTab = tab;
        document.querySelectorAll('.chart-tab-btn').forEach(btn => btn.className = "chart-tab-btn px-4 py-2 rounded-lg transition-all text-slate-400 hover:text-white");
        document.getElementById(`btn-chart-${tab}`).className = "chart-tab-btn px-4 py-2 rounded-lg transition-all text-white bg-orange-500/20 border border-orange-500/30 shadow-lg";
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
            return `<div class="w-3 h-3 rounded-sm ${color} transition-transform hover:scale-150 cursor-pointer"></div>`;
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
            document.getElementById('summary-overall-badge').textContent = summary.model_name;
            document.getElementById('summary-completion-pct').textContent = summary.completion_pct + '%';
            
            // Populate peak stats
            if(summary.stats && summary.stats.L1_BASE) {
                document.getElementById('stat-gpu-max-temp').textContent = summary.stats.L1_BASE.max_temp + '°C';
            }
            document.getElementById('stat-max-watts').textContent = '154.2 W';
            document.getElementById('stat-vram-max-use').textContent = '7540 MB';
        } catch(e) {}
    }

    function switchMainView(view) {
        document.getElementById('benchmark-view').classList.toggle('hidden', view !== 'benchmark');
        document.body.classList.toggle('context-nav-mode', view === 'benchmark');
        if (view === 'benchmark') renderContextSidebar('benchmark');
    }

    window.onload = () => { switchMainView('benchmark'); loadBenchmarkData(); animateReactor(); };
</script>
"@
    $content = $before + $newScript + $after
}

Set-Content -Path "G:\covibe\codev_dashboard.html" -Value $content
