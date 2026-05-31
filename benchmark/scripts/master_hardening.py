import re
import os

source_path = r'G:\covibe\benchmark\ui\codev_dashboard_temp.html'
dest_path = r'G:\covibe\codev_dashboard.html'
dest_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(source_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Remove CSP Meta tag
content = re.sub(r'<meta http-equiv="Content-Security-Policy".*?>', '', content, flags=re.IGNORECASE)

# 2. Fix Section ID for Dashboard
content = content.replace('id="tab-content-simulator"', 'id="tab-content-dashboard"')

# 3. Accessibility: Wrap Roadmap Checkboxes in Labels
def wrap_checkbox(match):
    full_tag = match.group(0)
    input_id = re.search(r'id="([^"]+)"', full_tag)
    if input_id:
        id_val = input_id.group(1)
        label_text = "Task Complete"
        if "doc-chk" in id_val: label_text = "Documentation Complete"
        if "code-chk" in id_val: label_text = "Code Complete"
        return f'<label for="{id_val}" class="sr-only">{label_text}</label>{full_tag}'
    return full_tag

content = re.sub(r'<input[^>]+type="checkbox"[^>]*>', wrap_checkbox, content)

# 4. Accessibility: Roadmap Selects
def wrap_select(match):
    full_tag = match.group(0)
    select_id = re.search(r'id="([^"]+)"', full_tag)
    if select_id:
        id_val = select_id.group(1)
        label_text = "Select Assistant"
        return f'<label for="{id_val}" class="sr-only">{label_text}</label>{full_tag}'
    return full_tag

content = re.sub(r'<select[^>]+id="([^"]+)"[^>]*>', wrap_select, content)

# 5. Fix specific inputs
# Terminal
if 'id="terminal-input"' in content:
    content = content.replace('<input type="text" id="terminal-input"', '<label for="terminal-input" class="sr-only">Terminal Input</label><input type="text" id="terminal-input"')

# Volume Slider
content = content.replace('oninput="updateAudioVolume(this.value)" type="range"', 'id="audio-volume-slider" aria-label="Volume Control" oninput="updateAudioVolume(this.value)" type="range"')

# Shell Selector
if 'id="terminal-shell-selector"' in content:
    content = content.replace('<select class="shell-select" id="terminal-shell-selector">', '<label for="terminal-shell-selector" class="sr-only">Shell Selector</label><select class="shell-select" id="terminal-shell-selector">')

# 6. Final Script Logic Restoration (Ensure no truncation)
# I'll keep the script section from the source but ensure the benchmark variables are added if missing.
# Wait, the source 'codev_dashboard_temp.html' might not have the benchmark variables I added later.
# I'll append the necessary JS variables if they aren't there.

if "let models = {}" not in content:
    # Find start of main script
    script_pos = content.find("<script>")
    if script_pos != -1:
        extra_js = "\n    let models = {}, selectedModel = '', isPlaying = false;\n    let telemetryChart = null, activeChartTab = 'thermals', reactorAngle = 0;\n"
        content = content[:script_pos+8] + extra_js + content[script_pos+8:]

# 7. Save as UTF-8
with open(dest_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(dest_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Master Hardening Complete.")
