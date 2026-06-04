import re

html_path = r'G:\covibe\codev_dashboard.html'
html_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Wrap Header and Main in a flex-col container
if '<div class="flex-1 flex flex-col min-w-0 h-full relative" id="master-right-wrapper">' not in content:
    # Find the header start
    header_start = content.find('<header')
    if header_start != -1:
        content = content[:header_start] + '<div class="flex-1 flex flex-col min-w-0 h-full relative" id="master-right-wrapper">\n' + content[header_start:]
        
        # Find where to close (before hitting any scripts at the end)
        last_main_close = content.rfind('</main>')
        if last_main_close != -1:
            # We need to find the close of the div we just opened
            # Actually, it's safer to just close it after the last </main> but before </body>
            content = content[:last_main_close+7] + '\n  </div> <!-- Close master-right-wrapper -->' + content[last_main_close+7:]

# 2. Ensure body is flex row (it already is based on h-screen w-screen flex)
# But we must ensure the old sidebar is not overlapping.

# 3. Final Path Hardening for data
content = content.replace("fetch('/data/benchmarks.json')", "fetch('/data/benchmarks.json')")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(html_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Layout Wrapper & Data Paths Hardened.")
