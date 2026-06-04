import re

html_path = r'G:\covibe\codev_dashboard.html'
html_path_ui = r'G:\covibe\benchmark\ui\codev_dashboard.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# CSS for the Modern Glass Sidebar
sidebar_css = r"""
    /* --- MODERN GLASS SIDEBAR STYLES --- */
    .sidebar {
      width: 256px;
      background: rgba(16, 20, 24, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      height: 100%;
      position: relative;
      z-index: 40;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sb-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 16px;
      min-height: 80px;
      overflow: hidden;
    }

    .sb-brand-icon {
      width: 40px;
      height: 40px;
      background: rgba(120, 244, 191, 0.1);
      color: #78f4bf;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 1px solid rgba(120, 244, 191, 0.2);
      flex-shrink: 0;
    }

    .sb-brand-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .sb-brand-title {
      font-size: 14px;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sb-brand-sub {
      font-size: 10px;
      font-weight: 700;
      color: #94a39d;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sb-nav {
      list-style: none;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
    }

    .sb-item {
      list-style: none;
    }

    .sb-link {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      color: #94a39d;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      text-align: left;
    }

    .sb-link i {
      font-size: 18px;
      flex-shrink: 0;
    }

    .sb-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .sb-link.active {
      background: rgba(120, 244, 191, 0.1);
      color: #78f4bf;
      border: 1px solid rgba(120, 244, 191, 0.2);
    }

    .sb-footer {
      padding: 20px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sb-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.05);
      margin-bottom: 20px;
    }

    .sb-stats-grid {
      display: grid;
      grid-template-cols: repeat(3, 1fr);
      gap: 8px;
    }

    .sb-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);
      padding: 8px 4px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .sb-stat-val {
      font-size: 10px;
      font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
    }

    .sb-stat-lbl {
      font-size: 7px;
      color: #6b7c75;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: 2px;
    }

    /* Hide text when collapsed */
    .sidebar.collapsed .sb-brand-text,
    .sidebar.collapsed .sb-link span,
    .sidebar.collapsed .sb-stat-lbl,
    .sidebar.collapsed .sb-stat-val {
      display: none;
    }
    
    .sidebar.collapsed .sb-stats-grid {
      grid-template-cols: 1fr;
      gap: 4px;
    }

    .sidebar.collapsed .sb-brand {
      padding: 20px 15px;
      justify-content: center;
    }
    
    .sidebar.collapsed .sb-link {
      padding: 10px;
      justify-content: center;
    }
"""

# Inject into style tag
if '/* --- MODERN GLASS SIDEBAR STYLES --- */' not in content:
    content = content.replace('</style>', sidebar_css + '\n  </style>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
with open(html_path_ui, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar CSS Injected Successfully.")
