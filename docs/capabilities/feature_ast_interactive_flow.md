# Feature: AST Interactive Data Flow

## 1. Overview
The AST Interactive Data Flow feature allows developers to visualize and modify the syntactic flow of code execution directly within the AST Explorer interface. Users can toggle between the standard **Auto Layout (Read-Only)** view and the **Interactive Data Flow (Manual Connect)** mode, enabling free dragging of nodes, manual mapping of execution branches (dragging connection wires between ports), and visual simulation of custom code traversal.

---

## 2. Functional Specification

### 2.1 Mode Toggling
- A selector dropdown is added at the top-left of the AST Canvas:
  - **Auto Layout (Default)**: Restores the classic fixed code graph structure (`Program` -> `FunctionDeclaration` -> `BinaryExpression` -> `CallExpression`).
  - **Interactive Data Flow (Manual Connect)**: Enables node editing tools, manual port-to-port connections, and custom flow simulations.
- Action toolbar shown in **Interactive Data Flow** mode:
  - **Reset Connections**: Clears all custom paths, resetting the canvas to a clean state.
  - **Simulate Flow**: Starts a step-by-step traversal starting from the root node along user-defined connections, updating log traces dynamically.

### 2.2 Interactive Drag & Drop / Connections
- **Node Position Memory**: Dragging a node via its header reposition it dynamically, automatically updating any attached connection wires.
- **Port-to-Port Wiring**:
  - Dragging from an **Output Port** (right dot of a node) creates a temporary path following the mouse cursor.
  - Releasing the mouse over an **Input Port** (left dot of another node) establishes a persistent directional connection.
  - Connections from a node to itself are blocked.
  - An input port accepts one connection at a time.
- **Edge Deletion**: Double-clicking on any connection line instantly disconnects/deletes that edge.

### 2.3 Data Flow Direction & Animation
- **Visual Arrows**: SVG connection edges use an end-marker arrowhead (`#arrow`) pointing to the target port, visually indicating the data/control flow direction.
- **Marching Ants Animation**: Active paths carry a pulse flow (`.edge-path.active`) which animates SVG dashoffsets to show real-time signal propagation.
- **Flow Simulation**:
  - Clicking "Simulate Flow" traces execution starting from `node-start`.
  - It traverses node-to-node using the user's manual connections, highlighting the active path and node sequentially.
  - Logs are outputted in the command terminal to mirror custom compilation progress.

---

## 3. Technical Architecture

### 3.1 DOM Structure Changes
1. **Controls Overlay**: A floating container is placed inside `#ast-tree-canvas` for options & action buttons.
2. **SVG Marker**: A `<marker>` element is declared in `#svg-layer` to define the directional arrowhead.
3. **SVG Paths**: The SVG canvas has dynamically generated `<path>` elements based on the current state of connections.
4. **Unique Port Identifiers**: All `.port` items inside `.workflow-node` are given explicit matching `id` attributes and `data-port-type` parameters (e.g. `data-port-type="output"` for `.right` ports and `data-port-type="input"` for `.left` ports).

### 3.2 State Management
We introduce a local workspace state object to manage interactive flow:
```javascript
const AST_INTERACTIVE_STATE = {
  mode: 'auto', // 'auto' | 'manual'
  connections: [], // array of { fromNodeId: string, toNodeId: string }
  isWiring: false,
  wiringSourcePort: null,
  wiringSourceNodeId: null
};
```

---

## 4. Implementation Details

### Client-side (Vanilla JavaScript in `codev_dashboard.html`)
- **Port Event Listeners**:
  - `mousedown` on output ports: Set `isWiring = true`, track starting coordinates, show `#temp-edge`.
  - `mousemove` on canvas: If `isWiring`, update the temporary path string between the output port and the current mouse pointer coordinates.
  - `mouseup` on input ports: Create connection object, append to `connections`, clear temporary line, and redraw connections.
- **Path Render Pipeline**:
  - `updateEdges()`: Evaluates the mode. In `auto` mode, draws default hardcoded edges. In `manual` mode, draws paths for the `connections` array using a Bezier curve formula.
- **Interactive Simulation Engine**:
  - Resolves path routes recursively (BFS/DFS) from `node-start`.
  - Steps through each node with a delay, updating CSS classes and invoking `logTerminal`.

---

## 5. Verification Plan
- [ ] Toggle between Auto Layout and Interactive Flow. Confirm that lines reset and ports change state correctly.
- [ ] Drag nodes around and confirm connection lines redraw dynamically.
- [ ] Connect `node-start` output port to `node-agent` input port. Verify the SVG line has an arrow pointing to `node-agent`.
- [ ] Double-click an edge and verify it is removed.
- [ ] Click "Simulate Flow" and verify nodes light up and animate sequentially along the custom paths.
