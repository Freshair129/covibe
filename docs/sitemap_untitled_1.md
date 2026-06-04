# Site Map of Untitled-1.html (CoDev - Agent Command Center)

**File Path:** [G:\covibe\Untitled-1.html](file:///G:/covibe/Untitled-1.html)
**Purpose:** Multi-view developer command center dashboard interface for CoVibe development.

---

## 1. Visual Navigation Map (Mermaid Diagram)

```mermaid
graph TD
    %% Global Structure
    App["CoDev - Agent Command Center"] --> Nav["1. Global Left Nav Bar"]
    App --> MainWrapper["Main Wrapper"]
    
    %% Top Navigation
    MainWrapper --> Header["2. Top Navigation Bar"]
    Header --> Breadcrumbs["Workspace Breadcrumbs & WS Status Dot"]
    Header --> ViewSwitcher["View Switcher Buttons"]
    Header --> TopActions["Test Run Action Button"]
    
    %% Workspace Body
    MainWrapper --> MainWorkspace["3. Main Workspace Area"]
    
    %% Left Sidebar (Conditional Views)
    MainWorkspace --> Sidebar["3.1 Left Sidebar"]
    Sidebar --> RoadmapStack["Roadmap Stack & Telemetry KPI Grid"]
    Sidebar --> TabPanel["Tab Panel: Config / Monitor / Agents / Dashboard Settings"]
    
    %% Main Content Views
    MainWorkspace --> CenterPanel["3.2 Center Content Pane"]
    CenterPanel --> RoadmapView["View 1: Roadmap View - Phase Accordions & Sprints"]
    CenterPanel --> ASTView["View 2: AST Explorer - Code panel & SVG Interactive Tree"]
    CenterPanel --> CallGraphView["View 3: Live Call Graph - Cytoscape.js Dependency Tree"]
    CenterPanel --> DBView["View 4: Database Schema - Draggable ERD Tables"]
    CenterPanel --> VectorView["View 5: Vector Store - HNSW 3-Layer Plane Graph & Search Panel"]
    CenterPanel --> BenchmarkView["View 6: AI Benchmark Board - Sound Simulator & KPI Cards"]
    
    %% Floating & Overlays
    App --> Overlays["4. Floating & Global Overlays"]
    Overlays --> HITLModal["HITL Approval Modal - Human Verification"]
    Overlays --> TerminalWindow["Floating Terminal Window - Drag-and-Drop Command line"]
    Overlays --> FABBtn["FAB Terminal Toggle Button"]
```

---

## 2. Hierarchical Tree Structure (โครงสร้างแบบแผนภูมิต้นไม้)

โครงสร้างการจัดวางคอมโพเนนต์และลำดับชั้นหน้าจอควบคุม (DOM Hierarchy Layout):

```text
CoDev - Agent Command Center (Untitled-1.html)
├── 1. Global Left Navigation Bar (แถบเมนูด้านซ้ายสุด)
│   ├── App Logo (โลโก้หลัก)
│   ├── AST Viewer Button (ปุ่มทางลัดสลับมุมมอง AST)
│   ├── Roadmaps Button (ปุ่มทางลัดสลับมุมมองบอร์ด)
│   ├── Agent Hub Button (ปุ่มทางลัดสลับมุมมองเอเจนต์)
│   ├── Knowledge Base Button (ปุ่มทางลัดสลับมุมมองฐานข้อมูล)
│   ├── Settings Button (ปุ่มตั้งค่าด่วน)
│   └── User Avatar (ภาพโปรไฟล์ผู้ใช้งาน)
├── 2. Top Navigation Bar (แถบเมนูด้านบนสุด)
│   ├── Breadcrumbs (ระบุพิกัด CoDev Workspace > CoVibe)
│   ├── WebSocket Connection Status Dot (ไฟบอกสถานะพอร์ต 8787)
│   ├── View Switcher Buttons (แถบเปลี่ยนมุมมองหลัก 6 รูปแบบ)
│   │   ├── Roadmap View Button
│   │   ├── AST Explorer View Button
│   │   ├── Call Graph View Button
│   │   ├── Database View Button
│   │   ├── Vector Store View Button
│   │   └── Benchmark View Button
│   └── Top Actions (ปุ่มเรียกคำสั่งจำลอง Test Run)
├── 3. Main Workspace Area (พื้นที่หน้าจอหลัก)
│   ├── 3.1 Left Sidebar (แผงควบคุมฝั่งซ้าย - แสดงใน Roadmap & Benchmark)
│   │   ├── Roadmap Stack (แถบเปอร์เซ็นต์ความคืบหน้าโครงการและ Telemetry KPIs)
│   │   └── Tab Panel Sub-menus (ระบบแท็บตั้งค่า/ประมวลผลย่อย)
│   │       ├── Config Tab (ตั้งค่า Prompt และ Path)
│   │       ├── Monitor Tab (แสดงประวัติการเรียกทำงาน Execution Trace)
│   │       ├── Agents Tab (ตรวจสอบสถานะ Agent Roster)
│   │       └── Settings Tab (เปลี่ยนธีม Midnight/OLED/Cyberpunk/Forest, ลิมิตความร้อน, ปริมาณเสียง)
│   └── 3.2 Center Content Pane (แผงกลางแสดงมุมมองตามที่เลือก)
│       ├── Roadmap View (พื้นที่แสดงการ์ด Phase 0-4 และ Sprint งานย่อย)
│       ├── AST Explorer View (มุมมองแยก: Code Panel และ AST Tree Canvas ที่ลากย้ายได้)
│       ├── Call Graph View (มุมมองแสดงผัง Dependency Cytoscape.js และกล่องข้อมูลข้างขวา)
│       ├── Database View (มุมมองแยก: แท็บฟังก์ชันฐานข้อมูล และ ERD Canvas แสดงตารางสัมพันธ์)
│       ├── Vector Store View (มุมมองแยก: ตัวป้อนคำสืบค้น, กราฟ HNSW 3 ชั้น, และผลการคำนวณ)
│       └── AI Benchmark View (มุมมองแยก: ชุดปุ่มโมเดล, เครื่องเล่น Waveform sandbox, และชาร์ตวิเคราะห์ความร้อน)
└── 4. Overlays & Floating Components (ส่วนแสดงผลทับซ้อนและหน้าต่างลอย)
    ├── HITL Verification Modal (กล่องอนุมัติ Human-In-The-Loop สำหรับยืนยันไวยากรณ์)
    ├── FAB Terminal Button (ปุ่มลอยสำหรับเปิด/ปิด Terminal)
    └── Floating Terminal Window (หน้าต่างเชลล์คำสั่งที่เคลื่อนย้ายได้ พร้อมแถบสลับโหมดคำสั่ง)
```

---

## 3. Interface Navigation & Layout Breakdown

### 2.1 Global Left Navigation Bar (`nav`)
- **App Logo:** Codesandbox Brand Icon (`ti-brand-codesandbox`)
- **Quick Links:**
  - **AST Viewer:** Icon (`ti-hierarchy-2`)
  - **Roadmaps:** Icon (`ti-layout-kanban`)
  - **Agent Hub:** Icon (`ti-users`)
  - **Knowledge Base:** Icon (`ti-database`)
- **Settings & User Profile:** Settings cog button (`ti-settings`) and avatar placeholder.

### 2.2 Top Navigation Bar (`header`)
- **Breadcrumbs:** `CoDev Workspace > CoVibe`
- **Connection Status:** WebSocket server status indicator dot (Default port: `8787`).
- **Main View Switcher:** Buttons to switch active views in the center panel:
  - **Roadmap:** `roadmap` view
  - **AST:** `canvas` view
  - **Call Graph:** `callgraph` view
  - **Database:** `database` view
  - **Vector Store (HNSW):** `vector` view
  - **Benchmark:** `benchmark` view
- **Actions:** **Test Run** button (`ti-player-play`) which starts the AST Traversal animation.

### 2.3 Left Sidebar (`aside#left-sidebar`)
*Only active when the Roadmap or Benchmark views are selected.*
- **Roadmap Progress & Metrics:**
  - Global project progress percentage, stats count (Total, Done, Pending, Phase).
  - Telemetry KPIs: Spend ($), Calls, Tools, Forecast ($), Input/Output Tokens, time, and GPU temperature.
- **Tab Panel Sub-menus:**
  - **Config (`tab-settings`):** System prompt setting and workspace path.
  - **Monitor (`tab-monitor`):** Execution trace list.
  - **Agents (`tab-agents`):** Agent roster status (EVA-cli, Qwen Coder, Local Dev).
  - **Settings (`tab-dashboard-settings`):** UI Theme selection, Autoplay Assist toggle, Telemetry interval poll frequency, GPU thermal safety caution limit, and synthesizer volume control.

### 2.4 Center Content Pane (`main > section`)

#### 1) Roadmap View (`#roadmap-view`)
Organizes CoVibe features into phase-based accordions:
- **Phase 0: Technical Spike:** YouTube API integration, WebSocket room proof of concept.
- **Phase 1: MVP Core:** React/Vite project setup, WebSocket backend room state, QR code generation, room join flow.
- **Phase 2: Sync Calibration:** Playback speed adjustments, background playback handling, OLED Saver.
- **Phase 3: Beta Test & Real Rider Feedback:** WebRTC voice channel spike, telemetry logs, feedback forms.
- **Phase 4: Post-Beta Expansion:** Hotspot direct connection, intercom voice chat, convoy GPS, voice commands.
- **Sprint / Tasks structure:** Task items support status verification checkboxes (`Doc`, `Code`, `Test`), assignee selection (`Assist`), and status badges (`Waiting`, `Done`).

#### 2) AST Explorer (`#workflow-canvas`)
- **AST Code Viewer:** Left pane displaying code snippet `calculateDrift.js` with code line highlighters.
- **AST Canvas:** Right pane containing tree nodes (`Program`, `FunctionDeclaration`, `BinaryExpression`, `CallExpression`) connected via dynamic SVG curves.

#### 3) Live Call Graph View (`#callgraph-view`)
- **Toolbar:** Database connection metadata, depth level selector (All, 1, 2, 3+), "Sync Tree-sitter" action button.
- **Cytoscape Graph Area:** Interactive tree view displaying dependencies grouped into parent packages (`apps/web`, `packages/msp`, `packages/gks`).
- **Floating Details Panel:** Node file details, inbound/outbound call lists.

#### 4) Database Schema View (`#database-view`)
- **Management Sidebar:** Database sections (Tables, Functions, Triggers, Replication, Backups).
- **Interactive ERD Canvas:** Drag-and-drop table layouts (`transactions`, `orders`, `conversations`, `tasks`, `employees`) with SVG path connectors.

#### 5) Vector Store View (`#vector-view`)
- **Control Panel:** Input query field, new document ingestion form, rebuild index graph actions, similarity parameters.
- **HNSW Visualizer:** Visual 3-plane HNSW graph structure (Layer 2 Skip lane, Layer 1 Sub-express, Layer 0 Base KNN) displaying node greedy traversal paths.
- **Search Results:** Scoring matched items by Cosine Similarity rankings.

#### 6) AI Benchmark Dashboard (`#benchmark-view`)
- **KPI Metrics:** Task in Focus, Champion Speed, GPU clock safety, Token Efficiency, Failed Runs.
- **Sound Simulator Sandbox:** Web Audio API synth generator producing sine waveforms rendered dynamically on an HTML5 canvas oscilloscope.
- **Overview & Performance:** Detailed champion lists comparing tokens/sec output across different LLM backends (Qwen, Ollama, Gemini).

### 3.5 Overlays & Dialogs
- **Human-In-The-Loop Modal (`#hitl-modal`):** Halt/Verify prompt overlay to authorize AST execution paths.
- **Floating Terminal Window (`#floating-terminal`):** WebSocket terminal shell trace supporting multiple environments (Gemini, System, EVA, Qwen). Activated/toggled by the floating terminal button (`#fab-terminal`).

---

## 4. Top-Nav to Side-Nav State Dependency (ความสัมพันธ์การทำงานของเมนูด้านบนและเมนูด้านข้าง)

ระบบจะควบคุมการแสดงผลของแถบเมนูด้านข้าง (Side Nav / Left Sidebar) และคอมโพเนนต์ย่อยด้านใน (Child components) ตามตัวเลือกที่ถูกเปิดใช้งานบนแถบสวิตช์มุมมองด้านบน (Top Nav View Switcher) ผ่านฟังก์ชัน `switchMainView(view)` โดยมีความสัมพันธ์เชิงตรรกะ (Logical State Dependency) ดังนี้:

### ตารางความเกี่ยวข้องการแสดงผล (State Mapping Table)

| Top Nav View (Parent) | Left Sidebar State | Sidebar Active Stack (Child) | Content View Panel |
| :--- | :--- | :--- | :--- |
| **Roadmap** | 🟢 แสดงผล (`block`) | `#left-sidebar-roadmap` | `#roadmap-view` |
| **AST (Explorer)** | 🔴 ซ่อน (`hidden`) | *ไม่มี* | `#workflow-canvas` |
| **Call Graph** | 🔴 ซ่อน (`hidden`) | *ไม่มี* | `#callgraph-view` |
| **Database** | 🔴 ซ่อน (`hidden`) | *ไม่มี* | `#database-view` |
| **Vector Store** | 🔴 ซ่อน (`hidden`) | *ไม่มี* | `#vector-view` |
| **Benchmark** | 🟢 แสดงผล (`block`) | `#left-sidebar-benchmark` | `#benchmark-view` |

### รายละเอียดการซิงค์ตรรกะ (Logical Sync Behavior)

1. **การควบคุมการซ่อน/แสดงแผงข้าง (Left Sidebar Toggle)**
   - เมื่อสลับไปยังมุมมอง **Roadmap** หรือ **Benchmark**: ระบบจะเรียก `leftSidebar.classList.remove('hidden')` เพื่อกางแผงควบคุมฝั่งซ้ายออก
   - เมื่อสลับไปยังมุมมองด้านความสัมพันธ์หรือทางเทคนิคอื่นๆ (**AST, Call Graph, Database, Vector Store**): ระบบจะปิดพื้นที่แผงข้างด้วย `leftSidebar.classList.add('hidden')` เพื่อเพิ่มขนาดความกว้างให้กับหน้าต่างทำกิจกรรมหลัก (Interactive Canvas)
2. **การสับเปลี่ยนชุดข้อมูลในแผงข้าง (Sidebar Child Stack)**
   - **เมื่อกางแผงในมุมมอง Roadmap**: ตัวควบคุมหลักจะทำการปิดมุมมองแผงฝั่ง Benchmark และเปิดแสดงเฉพาะ `#left-sidebar-roadmap` ซึ่งบรรจุระบบติดตามความคืบหน้าโครงการและแท็บการประเมินผล EVA/Qwen Coder
   - **เมื่อกางแผงในมุมมอง Benchmark**: ตัวควบคุมจะปิดการแสดงแผง Roadmap และดึงเฉพาะชุดข้อมูลตรวจสอบเซ็นเซอร์ฮาร์ดแวร์และการรันคะแนนโมเดล AI ขึ้นมาแสดง

---

## 5. Detailed View Features Specification (คำอธิบายรายละเอียดฟีเจอร์แต่ละหน้าหลัก)

แดชบอร์ด **CoDev - Agent Command Center** ประกอบด้วย 6 หน้าต่างย่อย (Main Views) ที่ถูกออกแบบมาเพื่อวัตถุประสงค์เฉพาะทางด้านการตรวจสอบระบบและการประเมินประสิทธิภาพ โดยมีรายละเอียดการทำงานดังนี้:

### 5.1 Roadmap View (หน้าต่างแผนการพัฒนาโครงการ)
หน้านี้ทำหน้าที่เป็นแดชบอร์ดหลักในการติดตามโครงการและสั่งงานเอเจนต์ AI ในการเขียนโค้ด
- **Interactive Phase Accordion**: ระบบกล่องเปิด-ปิดดูขอบข่ายงานของแต่ละเฟส (Phase 0 - 4) พร้อมแอนิเมชันเลื่อนหน้าจออัตโนมัติ (Smooth scroll) เมื่อขยายเฟสถัดไป
- **Sprints & Task Checkboxes**: ตารางรายงานผลสถานะภารกิจย่อยในแต่ละ Sprint ที่แยกการตรวจสอบสถานะออกเป็น 3 ขั้นตอน: `Doc` (การทำเอกสาร), `Code` (การเขียนโปรแกรม), และ `Test` (การเขียนการทดสอบ)
- **AI Assist Selectors**: เมนูเลือกมอบหมายภารกิจให้กับเอเจนต์ AI เฉพาะด้าน เช่น EVA Agent, Qwen Coder หรือจำลองการทำสอบด้วย Local Dev node
- **Active WebSocket Execution**: การคลิกที่รายการงานที่ค้างอยู่จะทำการยิงคำสั่งในรูปแบบ JSON Payload ผ่าน WebSocket Server เพื่อเรียกเอเจนต์หลังบ้านให้รันและส่ง Log กลับมาแสดงจริง
- **Phase Exit Criteria Checklists**: ตารางตรวจสอบเงื่อนไขความสำเร็จก่อนสิ้นสุดแต่ละเฟส เพื่อรับประกันคุณภาพก่อนการย้ายงานเข้าสู่โปรดักชัน

### 5.2 AST Explorer View (หน้าต่างวิเคราะห์โครงสร้างต้นไม้ไวยากรณ์)
เครื่องมือตรวจสอบและแสดงความสัมพันธ์ของตัวแปรและบล็อกสโคปของโค้ดแบบเรียลไทม์
- **Linked Code & Editor Panel**: แผงฝั่งซ้ายแสดงบรรทัดของโค้ดโปรแกรมภาษา JavaScript (`calculateDrift.js`) พร้อมติดตั้งตัวระบุตำแหน่งแถบสี (Line Highlighter)
- **Draggable AST Tree Canvas**: แผงแสดงโครงสร้างต้นไม้แบบมีปฏิสัมพันธ์ (Interactive Canvas) ประกอบด้วยกล่องประเภท Node (เช่น Program, FunctionDeclaration, BinaryExpression) ที่ผู้ใช้สามารถคลิกลากและย้ายพิกัดได้ตามสะดวก
- **Laser Traversal Animation**: เมื่อกดปุ่ม **Test Run** จะเป็นการรันสคริปต์จำลองการเข้าถึงไวยากรณ์ (AST Traversal Simulation) โดยจะวาดเส้นเลเซอร์เลื่อนไหลวิ่งผ่านจุดพอร์ตของแต่ละ Node

### 5.3 Live Call Graph View (หน้าต่างความสัมพันธ์ฟังก์ชัน)
แดชบอร์ดที่ช่วยให้นักพัฒนามองเห็นภาพโครงสร้างแพ็กเกจย่อยและลำดับการเรียกใช้งานของโปรแกรมทั้งหมด
- **Interactive Network Layout**: การใช้ไลบรารี Cytoscape.js เพื่อวาดผังเครือข่ายความสัมพันธ์ของฟังก์ชันต่างๆ ที่แบ่งสัดส่วนตามกลุ่มแพ็กเกจย่อยของ Monorepo (`apps/web`, `packages/msp`, `packages/gks`)
- **Hover & Dim Dependency Highlight**: เมื่อนำเมาส์ไปชี้ที่ Node ระบบจะทำการหรี่ไฟ (Dim) ตัวแปรหรือเส้นเชื่อมโยงที่ไม่ได้เกี่ยวข้องกัน และจะไฮไลต์เน้นเฉพาะคู่ฟังก์ชันที่เป็น Inbound และ Outbound ของฟังก์ชันนั้น
- **Depth Selector Control**: ตัวเลือกจำกัดความลึกของแผนภาพ เพื่อกรองข้อมูลในการทำความเข้าใจการเชื่อมโยง เช่น แสดงเฉพาะการเรียกตรง (Level 1) หรือดูความเชื่อมโยงทั้งหมด (Full Path)
- **SQLite & Tree-sitter Synchronizer**: ปุ่มวิเคราะห์ผังความสัมพันธ์ใหม่ด้วย Tree-sitter Parser เพื่ออัปเดตข้อมูลพิกัดความเชื่อมโยงล่าสุดของระบบ

### 5.4 Database Schema View (หน้าต่างสถาปัตยกรรมฐานข้อมูล)
บอร์ดแสดงความสัมพันธ์และโครงสร้างตารางข้อมูลในรูปแบบ Entity-Relationship Diagram (ERD)
- **Interactive ERD Canvas**: แผงวาดความสัมพันธ์ความเชื่อมโยงของฐานข้อมูล โดยวาดเส้นเชื่อมจากคู่ตารางต่างๆ ด้วยเส้นเบซิเยร์ (Bezier curves) ที่อัปเดตมุมโค้งตามการเคลื่อนไหวของการ์ดตาราง
- **Draggable Table Cards**: แผงหน้าต่างตารางที่แสดงรายการคอลัมน์ คีย์หลัก (PK) คีย์นอก (FK) และชนิดตัวแปรของแต่ละฟิลด์ (`transaction_id`, `order_id`, etc.)
- **Auto Layout Engine**: ปุ่มคำนวณตำแหน่งการวางการ์ดตารางตามสัดส่วนที่กางและเหมาะสมบนหน้าจอโดยอัตโนมัติ เพื่อไม่ให้การ์ดทับซ้อนกัน

### 5.5 Vector Store View (หน้าต่างจำลองระบบสืบค้นความรู้ HNSW)
หน้าแสดงพฤติกรรมการค้นหาและการจัดเรียงดัชนีของฐานข้อมูลเวกเตอร์ (Vector Database) ที่ AI ใช้ในการจำข้อมูล
- **HNSW 3-Layer Plane Graph**: แบบจำลองเลเยอร์กราฟ HNSW 3 มิติ แบ่งย่อยเป็น Layer 2 (Express Skip Lane), Layer 1 (Sub-Express Lane), และ Layer 0 (Base Nearest Neighbors)
- **Path Traversal Simulator**: แอนิเมชันแสดง Greedy Search Traversal โดยระบบจะจำลองทิศทางการกระโดดสืบค้นข้อมูลเวกเตอร์แบบเรียลไทม์ โดยเล็งจุดจาก Anchor ชั้นบนสุดและข้ามลงมาหาเพื่อนบ้านที่ใกล้ที่สุดในชั้นล่าง
- **Ingest Memory Pipeline**: แบบฟอร์มป้อนประมวลผลข้อความความจำใหม่เพื่อแปลงเป็น Embedding และอัปเดตเข้าร่วมในแผนผังพิกัดเวกเตอร์บนเลเยอร์กราฟทันที
- **Rank Metric List**: ตารางแสดงผลความคล้ายคลึงของประโยคที่สอดคล้องกับคำค้นหา โดยแปลงค่าความเหมือนเป็นเปอร์เซ็นต์ (Cosine Similarity %) พร้อมแถบสีแจ้งระดับความแม่นยำ

### 5.6 AI Benchmark Dashboard (หน้าต่างวิเคราะห์และจำลองการปรับแต่ง AI)
หน้ารายงานผลลัพธ์การวัดระดับ AI โมเดลบนอุปกรณ์ RTX 3060 ตามมาตรฐาน EABS-01
- **Oscilloscope Visual Sandbox**: กล่องจำลองเครื่องกำเนิดสัญญาณคลื่นเสียง (Sine Wave Synth Engine) ด้วย Web Audio API ผู้ใช้สามารถเลือกเปรียบเทียบโมเดล และทดสอบฟังความเสถียรของคลื่นผ่านออสซิลโลสโคปบนจอ Canvas
- **Hardware Telemetry Monitor**: ตัวแสดงระดับการใช้งาน VRAM ความจุสูงสุด อุณหภูมิการ์ดจอจำลองแบบเรียลไทม์ และระบบแจ้งเตือน Power Limit ตลอดจนระบบ TDR Warning Guard
- **The Champions of CoVibe Table**: แดชบอร์ดสรุปรายชื่อโมเดล AI ที่ดีที่สุด รวมถึงการวิเคราะห์สาเหตุ (RCA) ของโมเดลที่มีสถานะแครชหรือประมวลผลไม่สมบูรณ์

---

## 6. Implementation Backlog for Each View (รายการลำดับความสำคัญในการพัฒนาแต่ละหน้า)

เพื่อผลักดันให้แดชบอร์ดจำลองกลายเป็นระบบตรวจวัดผลการทำงานจริงเชิงโปรดักชัน นี่คือรายการงานที่ต้องพัฒนาในระบบ Backend และ Frontend ในแต่ละส่วน:

### 6.1 Roadmap View Development Backlog
- [ ] **WS Task Execution Hookup**: พัฒนาระบบรันคอมมานด์จริงบน Server ผ่าน WebSocket เมื่อเอเจนต์ได้รับข้อความ `task_id` เพื่อแทนที่ระบบสถานะจำลอง (Mock pending/done)
- [ ] **Git Integration**: เขียนสคริปต์ตรวจสอบ Git History ย้อนหลังเพื่อเปลี่ยนสถานะ checkbox (Doc/Code/Test) อัตโนมัติเมื่อพบ commit ที่เกี่ยวข้อง
- [ ] **Task Customizer**: เพิ่มฟอร์มบน UI เพื่ออนุญาตให้ผู้ใช้เพิ่ม ลบ หรือแก้ไขภารกิจและจัดแบ่ง Sprint ได้โดยไม่ต้องเข้าไปแก้ไฟล์ HTML หรือ JSON โดยตรง

### 6.2 AST Explorer Development Backlog
- [ ] **Dynamic File Loader**: พัฒนาระบบอัปโหลดหรือเลือกไฟล์ JavaScript/TypeScript ในโปรเจกต์มาวิเคราะห์แทนการฟิกซ์โค้ด `calculateDrift.js`
- [ ] **Real AST Parser Bindings**: เชื่อมต่อไลบรารีวิเคราะห์ไวยากรณ์ (เช่น Acorn, Esprima หรือ Tree-sitter) บน WebSocket Server เพื่อแปลงซอร์สโค้ดจริงเป็นโครงสร้าง JSON
- [ ] **Auto-arrange AST Canvas Nodes**: ปรับปรุงระบบลากย้าย Node ให้รองรับระบบ Snap-to-grid และปรับสมดุลตำแหน่งอัตโนมัติ (Graph Layout) เพื่อป้องกัน Node วางซ้อนทับกัน

### 6.3 Live Call Graph Development Backlog
- [ ] **Real-time Tree-sitter Scan**: เขียนสคริปต์สแกนฟังก์ชันในโปรเจกต์จริงด้วย Tree-sitter เพื่อสร้าง Call Path สดของโครงการขึ้นมาจากฐานข้อมูล SQLite แทนการจำลองข้อมูล JSON
- [ ] **Function Search & Jump**: เพิ่มกล่องสืบค้น (Search bar) เพื่อให้นักพัฒนาสามารถพิมพ์หาชื่อฟังก์ชันและโฟกัสจัดกึ่งกลาง (Zoom & Center) ใน Cytoscape.js ได้อย่างรวดเร็ว
- [ ] **Double-Click Code Binding**: พัฒนาระบบคลิกสองครั้งที่ Node ฟังก์ชันเพื่อเปิดดูซอร์สโค้ดบรรทัดนั้นบนแผง Code Panel ฝั่งซ้ายทันที

### 6.4 Database Schema View Development Backlog
- [ ] **Live Postgres Connector**: เชื่อมต่อแผงควบคุมเข้ากับ PostgreSQL/Supabase จริง เพื่ออ่าน Metadata และวาดผัง ERD ขึ้นมาจาก Schema ปัจจุบันใน Database
- [ ] **Interactive Migration Generator**: พัฒนาระบบแก้ไขตาราง (เช่น ลบคอลัมน์ หรือสร้าง FK) บนหน้าเว็บจำลอง แล้วส่งผลคำสั่ง `ALTER TABLE` ออกมาเป็นไฟล์ `migration.sql`
- [ ] **State Storage**: เพิ่มฟังก์ชันจัดเก็บพิกัดตำแหน่งการวางตาราง (X, Y coordinates) ของผู้ใช้ลงในตารางตั้งค่าในฐานข้อมูลเพื่อป้องกันตำแหน่งรีเซ็ตเมื่อรีเฟรชหน้าเว็บ

### 6.5 Vector Store View Development Backlog
- [ ] **Local Embedding Model Server**: รันโมเดลแปลงความรู้ (เช่น BERT หรือ MiniLM) บนเครื่องเซิร์ฟเวอร์หลังบ้านเพื่อรองรับการดึงเวกเตอร์จริง (True Embedding Generation)
- [ ] **Vector Database Bindings**: เชื่อมต่อ API เพื่อบันทึกความจำเวกเตอร์ลงในฐานข้อมูลความจำจริง (เช่น pgvector หรือ ChromaDB)
- [ ] **True HNSW Index Graph**: คำนวณความใกล้เคียงของเส้นทาง Greedy Search Path จากคลังความรู้จริงเพื่อเรนเดอร์ในเลเยอร์บอร์ด (Layer 2, 1, 0)

### 6.6 AI Benchmark Dashboard Development Backlog
- [ ] **NVIDIA Management Library (NVML) Integration**: เชื่อมโยง Library ของการ์ดจอเพื่อดึงค่า GPU Temp, Power Watt, VRAM Load ออกมาจากตัวระบบจริง (ลบระบบสุ่มค่าจำลองออก)
- [ ] **Ollama Model Orchestrator**: พัฒนา API ควบคุมหลังบ้านเพื่อสั่งสตาร์ตและปิดโมเดล Local LLM (เช่น `ollama run` และ `keep_alive: 0`)
- [ ] **Trace Logs Exporter**: พัฒนาเครื่องมือบันทึกประวัติการเรียกใช้งาน (Trace history) ออกมาเป็นตาราง CSV/JSON สำหรับส่งออกข้อมูลวัดผล EABS-01


