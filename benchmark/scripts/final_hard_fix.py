import re
import os

server_path = r'G:\covibe\server\index.js'
html_path = r'G:\covibe\codev_dashboard.html'
html_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

# 1. Update Server CSP Header
if os.path.exists(server_path):
    with open(server_path, 'r', encoding='utf-8') as f:
        server_code = f.read()
    
    # Standardize CSP header to ensure unsafe-eval is permitted everywhere needed
    new_csp = "default-src 'self' * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' * data: blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' * 'unsafe-inline'; connect-src 'self' * ws: wss:;"
    
    server_code = re.sub(r'const csp = isProd\s+\? ".*?"\s+: ".*?";', 
                         f'const csp = "{new_csp}";', 
                         server_code, flags=re.DOTALL)
    
    with open(server_path, 'w', encoding='utf-8') as f:
        f.write(server_code)
    print("Server CSP Updated.")

# 2. Fix HTML
with open(html_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 2.1 Remove any existing meta CSP
content = re.sub(r'<meta http-equiv="Content-Security-Policy".*?>', '', content, flags=re.IGNORECASE)

# 2.2 Fix switchMainView to force show a tab
if "switchTab('dashboard'); // Force show" not in content:
    content = content.replace("if (btnBenchmark) activeBtn(btnBenchmark);", 
                              "if (btnBenchmark) activeBtn(btnBenchmark);\n          switchTab('dashboard'); // Force show default tab")

# 2.3 Accessibility: Exhaustive Input Labeling
def fix_inputs(html):
    # Fix checkboxes without labels
    def wrap_cb(m):
        full = m.group(0)
        if '<label' in full: return full
        id_m = re.search(r'id="([^"]+)"', full)
        if id_m:
            return f'<label for="{id_m.group(1)}" class="sr-only">Input Field</label>{full}'
        return full
    html = re.sub(r'<input[^>]+type="checkbox"[^>]*>', wrap_cb, html)
    
    # Fix range sliders
    html = re.sub(r'<input([^>]+type="range"[^>]*)(?<!aria-label=)>', 
                  r'<input\1 aria-label="Range Slider">', html)
    
    # Fix text inputs
    def wrap_text(m):
        full = m.group(0)
        if 'id="' not in full or '<label' in full: return full
        id_m = re.search(r'id="([^"]+)"', full)
        if id_m:
            return f'<label for="{id_m.group(1)}" class="sr-only">Text Input</label>{full}'
        return full
    html = re.sub(r'<input[^>]+type="text"[^>]*>', wrap_text, html)

    # Fix selects
    def wrap_select(m):
        full = m.group(0)
        if '<label' in full: return full
        id_m = re.search(r'id="([^"]+)"', full)
        if id_m:
            return f'<label for="{id_m.group(1)}" class="sr-only">Selection</label>{full}'
        return full
    html = re.sub(r'<select[^>]+id="([^"]+)"[^>]*>', wrap_select, html)
    
    return html

content = fix_inputs(content)

# 2.4 Encoding: Ensure meta charset is correct and first
if '<meta charset="UTF-8">' not in content:
    content = content.replace('<head>', '<head><meta charset="UTF-8">')

# 3. Save as UTF-8
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(html_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML Navigation & Accessibility Fixed.")
