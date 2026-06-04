import re
import os

html_path = r'G:\covibe\codev_dashboard.html'
html_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(html_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Fix switchMainView Null Pointer (centerPanel)
content = content.replace("centerPanel.classList.add('hidden');", "if (centerPanel) centerPanel.classList.add('hidden');")
content = content.replace("centerPanel.classList.remove('hidden');", "if (centerPanel) centerPanel.classList.remove('hidden');")
content = content.replace("centerPanel.classList.add('flex');", "if (centerPanel) centerPanel.classList.add('flex');")

# 2. Fix calculateRoadmapProgress (textContent of null)
safe_roadmap_func = """
    function calculateRoadmapProgress() {
      const allTasks = document.querySelectorAll('#roadmap-view .task-item');
      let tTotal = allTasks.length, tDone = 0, tPending = 0;

      allTasks.forEach(task => {
        const state = task.getAttribute('data-state') || 'todo';
        if (state === 'done') tDone++;
        else if (state === 'pending') tPending++;
      });

      const totalEl = document.getElementById('stat-total');
      const doneEl = document.getElementById('stat-done');
      const pendingEl = document.getElementById('stat-pending');
      const globalTextEl = document.getElementById('global-percent-text');
      const globalFillEl = document.getElementById('global-progress-fill');

      if (totalEl) totalEl.textContent = tTotal;
      if (doneEl) doneEl.textContent = tDone;
      if (pendingEl) pendingEl.textContent = tPending;

      const globalPct = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;
      if (globalTextEl) globalTextEl.textContent = globalPct + '%';
      if (globalFillEl) globalFillEl.style.width = globalPct + '%';
"""
content = re.sub(r'function calculateRoadmapProgress\(\) {.*?// Update Phase Accordion', 
                 safe_roadmap_func + '\n        // Update Phase Accordion', content, flags=re.DOTALL)

# 3. Fix domainRegistry Navigation ID Mismatch
content = content.replace("action: () => switchTab('dashboard')", "action: () => switchTab('simulator')")

# 4. Correct 404 URL for Summary Data
content = content.replace("fetch('/data/sushirl_summary.json')", "fetch('ui/data/sushirl_summary.json')")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(html_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Defensive Fixes Applied Successfully.")
