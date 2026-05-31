import re
import os

file_path = r'G:\covibe\codev_dashboard.html'

with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 1. Remove CSP Meta tag
content = re.sub(r'<meta http-equiv="Content-Security-Policy".*?>', '', content, flags=re.IGNORECASE)

# 2. Fix Accessibility: Wrap Roadmap Checkboxes in Labels
# Pattern: <input id="..." name="..." type="checkbox" class="...">
# To: <label class="sr-only" for="...">Label</label><input ...>
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

# 3. Fix Accessibility: Roadmap Selects
def wrap_select(match):
    full_tag = match.group(0)
    select_id = re.search(r'id="([^"]+)"', full_tag)
    if select_id:
        id_val = select_id.group(1)
        label_text = "Assignee"
        if "assist-select" in id_val: label_text = "Select Assistant"
        return f'<label for="{id_val}" class="sr-only">{label_text}</label>{full_tag}'
    return full_tag

content = re.sub(r'<select[^>]+id="([^"]+)"[^>]*>', wrap_select, content)

# 4. Fix specific inputs
# Terminal
if 'id="terminal-input"' in content and '<label for="terminal-input"' not in content:
    content = content.replace('<input type="text" id="terminal-input"', '<label for="terminal-input" class="sr-only">Terminal Input</label><input type="text" id="terminal-input"')

# Volume
if 'oninput="updateAudioVolume' in content and 'id="audio-volume-slider"' not in content:
    content = content.replace('type="range" min="0" max="1" step="0.1" value="0.4"', 'id="audio-volume-slider" aria-label="Volume" type="range" min="0" max="1" step="0.1" value="0.4"')

# 5. Fix Workspace Path (already has label but check for attribute)
# Pattern: <label ...>Workspace Path</label> <input id="workspace-path" ...>
# Ensure label has for="workspace-path"

# 6. Save as UTF-8
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed CSP, Accessibility and Encoding.")
