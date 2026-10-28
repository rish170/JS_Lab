# Practical - 12: Interactive Real-Time Workspace

## Experiment Title
To build an interactive real-time web application using JavaScript and jQuery, demonstrating DOM manipulation, event handling, localStorage, and AJAX integration.

---

## Overview
**Kanso Workspace** is an interactive, real-time task dispatch and productivity board. It demonstrates core modern frontend principles without reliance on heavy frameworks:

1. **AJAX Integration (`$.ajax`)**: Asynchronously retrieves initial tasks from `initialTasks.json` with network lifecycle callbacks (`beforeSend`, `success`, `error`, `complete`), dynamic status indicators, and offline fallback.
2. **Persistent Storage (`localStorage`)**: Persists all task data, dynamic view preferences (Kanban Board vs. List View), and real-time audit logs across browser sessions.
3. **Dynamic DOM Manipulation (jQuery)**:
   - Dynamic construction of task cards, metadata tags, and metric summaries (`$('<div>')`, `.append()`, `.html()`).
   - Smooth micro-interactions and transitions (`.fadeIn()`, `.fadeOut()`, `.slideDown()`, `.slideUp()`).
   - Real-time recalculation of sprint health progress bar and column item counters.
4. **Event Handling**:
   - Real-time instant search as user types (`input` event).
   - Delegated event handling for dynamic elements (`.btn-move-next`, `.btn-move-prev`, `.btn-delete`).
   - Keyboard shortcuts (`Escape` key modal closure).
   - Form submission and validation.
5. **Real-Time Telemetry**:
   - Continuous live digital clock with second-by-second updates.
   - Live activity stream logging all CRUD and storage actions in real time.
6. **Clean, Human-Centric Design**:
   - Zero synthetic "AI colors" (no neon purple-cyan gradients or glow halos).
   - Warm, tactile editorial color palette inspired by natural stone, ink typography, terracotta, ochre, and sage.

---

## File Structure
- `index.html` — Semantic HTML5 shell with metrics grid, toolbar, Kanban board, list container, and modal dialog.
- `style.css` — Modern, clutter-free CSS with responsive layout and bespoke natural design tokens.
- `script.js` — Complete application logic powered by jQuery and ES6.
- `initialTasks.json` — Mock backend seed data for the AJAX request.

---

## Running the Application
1. Open `Practical 12/index.html` in any modern web browser (Google Chrome, Edge, Firefox, Safari).
2. For full AJAX demonstration over HTTP, you can also serve the directory with any local static server:
   ```bash
   # Optional: run via Python, npx serve, or VS Code Live Server
   npx serve .
   # or
   python -m http.server 8080
   ```

