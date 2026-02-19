# RAG Status Lights — Vue 3 + AG Grid

**Repo:** https://github.com/jprendergastAP/RAG-Status-Traffic-Lights-for-Elevation

---

## What This Is

A reusable status-light pattern for AG Grid in Vue 3. Each row in the grid displays a coloured dot indicating project or initiative health. Built for the Elevation app (Vue 3 frontend, Laravel 10 backend).

---

## The Three Statuses

| Dot | Colour | Hex | Meaning |
|-----|--------|-----|---------|
| 🟢 | Green | `#2ecc71` | On Track |
| 🟡 | Yellow | `#f1c40f` | At Risk |
| 🔴 | Red | `#e74c3c` | Off Track |

The `status` field accepts either a **numeric** value (preferred) or a **string**:

| Numeric | String equivalents | Meaning |
|---------|--------------------|---------|
| `2` | `"GREEN"` | On Track |
| `1` | `"AMBER"`, `"YELLOW"` | At Risk |
| `0` | `"RED"` | Off Track |

The dot is the only visual indicator — no text label is shown in the Status column. The meaning is communicated by colour alone.

---

## Rendering Approach: Why We Use `cellClassRules` + CSS `::before`

This is the most important architectural decision in this implementation and the one developers are most likely to question, so it is worth explaining up front.

### The naive approach (do not use at scale)

The first instinct when building a custom status dot in AG Grid Vue is to write a Vue component and register it as a `cellRenderer`:

```js
// Looks clean, but expensive at scale
cellRenderer: MyDotComponent
```

This works and is easy to understand, but it has a real cost: AG Grid instantiates a full Vue component for every visible cell in the Status column. That means Vue's reactivity system, virtual DOM diffing, and component lifecycle hooks are all running per cell, per render cycle. For a grid with a few dozen rows this is fine. For hundreds or thousands of rows it adds up and you will notice frame drops when sorting, filtering, or scrolling fast.

### The fast approach (what we use)

Instead of a Vue component per cell, we use `cellClassRules` — a native AG Grid feature that simply toggles CSS class names on the cell element based on the cell value. The dot itself is drawn by a CSS `::before` pseudo-element. No Vue component, no extra DOM nodes, no framework overhead whatsoever.

```js
cellClassRules: {
  'ryg-cell':   () => true,        // always applied — centres the dot
  'ryg-red':    (p) => p.value === 0,
  'ryg-yellow': (p) => p.value === 1,
  'ryg-green':  (p) => p.value === 2,
}
```

```css
/* The dot is painted entirely by CSS — zero DOM nodes */
.ryg-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ryg-cell::before {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.ryg-red::before    { background: #e74c3c; }
.ryg-yellow::before { background: #f1c40f; }
.ryg-green::before  { background: #2ecc71; }
```

When AG Grid virtualises rows (removing off-screen rows from the DOM as the user scrolls), it only needs to toggle a class name on re-entry rather than mount and unmount a Vue component. The browser paints the dot in a single pass with no JavaScript involved at all.

The cell text is deliberately kept empty with `valueFormatter: () => ''`. The `valueGetter` still normalises the raw value to the internal `0/1/2` enum so that sorting and filtering work correctly against the numeric representation regardless of whether the API sends a number or a string.

### Performance comparison

| | Vue `cellRenderer` component | `cellClassRules` + CSS `::before` |
|---|---|---|
| DOM nodes per cell | 2–3 (component root + spans) | 0 extra (1 pseudo-element) |
| Framework work per cell | Vue instantiation + reactivity | None |
| Virtualisation cost | Mount/unmount component | Toggle a CSS class |
| Suitable for | Up to ~500 rows comfortably | Thousands of rows |

---

## Project Structure

```
rag-grid-vue/
├── src/
│   ├── main.js        # App entry point + AG Grid CSS imports
│   └── App.vue        # Grid definition, column defs, status CSS
├── vite.config.js     # Vite config with single-file build plugin
└── package.json
```

There is no separate cell renderer component file. The entire status dot is handled inside `App.vue` via `cellClassRules` and CSS.

---

## Dependencies

```json
{
  "dependencies": {
    "ag-grid-community": "^35.1.0",
    "ag-grid-vue3": "^35.1.0",
    "vue": "^3.5.25"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.2",
    "vite": "^7.3.1",
    "vite-plugin-singlefile": "^2.3.0"
  }
}
```

Install with:

```bash
npm install
```

---

## Setup

### 1. Scaffold (if starting fresh)

```bash
npm create vite@latest rag-grid-vue -- --template vue
cd rag-grid-vue
npm install
npm i ag-grid-community ag-grid-vue3
```

### 2. Run the dev server

```bash
npm run dev
```

### 3. Build a self-contained HTML file (for sharing / preview)

```bash
npm run build
# outputs dist/index.html with all JS and CSS inlined
```

---

## Complete Source

### `src/main.js`

AG Grid's base and theme CSS must be imported here before anything else.

```js
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

---

### `src/App.vue`

The complete implementation. All rendering logic lives in the column definition and the `<style>` block — no external component file needed.

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <div class="pill">AG Grid Vue 3, RYG status dots, fast</div>
      <button class="btn" @click="randomizeStatuses">Randomize</button>
    </div>

    <AgGridVue
      class="ag-theme-quartz grid"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :modules="modules"
      :animateRows="false"
      :rowBuffer="50"
      :suppressColumnVirtualisation="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule } from 'ag-grid-community'

// Required for AG Grid v31+ — without this the grid renders blank
const modules = [AllCommunityModule]

/*
STRICT ENUM
0 = RED    (Off Track)
1 = YELLOW (At Risk)
2 = GREEN  (On Track)
*/

const rowData = ref([
  { description: 'Initiative A', textAttr: 'On track',  status: 2 },
  { description: 'Initiative B', textAttr: 'At risk',   status: 1 },
  { description: 'Initiative C', textAttr: 'Blocked',   status: 0 },
  { description: 'Initiative D', textAttr: 'On track',  status: 2 },
  { description: 'Initiative E', textAttr: 'At risk',   status: 1 },
])

// Accepts numeric (0/1/2) or string ("RED"/"YELLOW"/"GREEN") from the API
function toStatusCode(v) {
  if (v === 0 || v === 'RED')    return 0
  if (v === 1 || v === 'YELLOW') return 1
  if (v === 2 || v === 'GREEN')  return 2
  return null
}

const columnDefs = ref([
  { headerName: 'Description', field: 'description', flex: 2, minWidth: 220 },
  { headerName: 'Text',        field: 'textAttr',    flex: 2, minWidth: 220 },

  // Dot-only status column — no text, no Vue component, no extra DOM nodes
  {
    headerName: 'Status',
    field: 'status',
    width: 80,
    sortable: true,
    filter: true,
    valueGetter:    (p) => toStatusCode(p.data?.status),
    valueFormatter: () => '',   // cell text empty — dot drawn by CSS ::before
    cellClassRules: {
      'ryg-cell':   () => true,
      'ryg-red':    (p) => p.value === 0,
      'ryg-yellow': (p) => p.value === 1,
      'ryg-green':  (p) => p.value === 2,
    },
  },
])

const defaultColDef = {
  resizable: true,
}

function randomizeStatuses() {
  const values = [0, 1, 2]
  rowData.value = rowData.value.map((row) => ({
    ...row,
    status: values[Math.floor(Math.random() * values.length)],
  }))
}
</script>

<style>
.page {
  padding: 20px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

.toolbar {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.pill {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
}

.btn {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: white;
}

.btn:hover { background: #f9fafb; }

.grid {
  height: 420px;
  width: 900px;
}

/* -------------------------------------------------------
   STATUS DOT — dot only, no text
   Rendered via CSS ::before pseudo-element.
   No extra DOM nodes. AG Grid only toggles a class name.
   ------------------------------------------------------- */

.ryg-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ryg-cell::before {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.ryg-red::before    { background: #e74c3c; }
.ryg-yellow::before { background: #f1c40f; }
.ryg-green::before  { background: #2ecc71; }
</style>
```

---

### `vite.config.js`

The `viteSingleFile` plugin inlines all JS and CSS into one `index.html`. This is only needed for the preview build — in Elevation the normal Vite build pipeline applies.

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  base: './',
})
```

---

## Key Gotchas (Lessons Learned)

### AG Grid v31+ requires explicit module registration

From AG Grid v31 onwards, every grid feature is opt-in. Without registering `AllCommunityModule`, the grid mounts but renders a completely blank box — no columns, no rows, no error in the console.

```js
import { AllCommunityModule } from 'ag-grid-community'

const modules = [AllCommunityModule]
// passed as :modules="modules" on <AgGridVue>
```

### `frameworkComponents` was removed in AG Grid v28

Many tutorials and older articles still reference `frameworkComponents` for registering Vue cell renderers. This API was removed in v28. In v35, if you do use a component renderer, pass the imported object directly:

```js
// Old — broken in v35
cellRenderer: 'RagDotRenderer',
frameworkComponents: { RagDotRenderer }

// Correct for v35
cellRenderer: RagDotRenderer
```

### Do not use `<style scoped>` inside cell renderer components

AG Grid mounts Vue cell renderer components outside the parent component's scope. Scoped CSS generates a `data-v-xxxxxxxx` attribute that only matches elements rendered by that exact component instance — AG Grid's cell mount point does not carry that attribute, so scoped styles are silently ignored. Use inline `:style` bindings if you ever do need a component renderer.

### Vite builds use `type="module"` scripts, which fail over `file://`

A standard `npm run build` produces an `index.html` that loads JavaScript as ES modules. Browsers block ES module loading over the `file://` protocol, so double-clicking the built file shows a blank page. Two solutions: run a local HTTP server (`python -m http.server`), or use `vite-plugin-singlefile` to inline everything into one file.

---

## Integrating Into Elevation

When wiring this into the Elevation codebase (Vue 3, Laravel 10):

1. Import `AllCommunityModule` and add it to the `:modules` prop wherever the AG Grid instance is defined — or register it globally once at app startup.
2. Add `valueGetter`, `valueFormatter`, and `cellClassRules` to the Status column definition exactly as shown in `App.vue` above.
3. Add the `.ryg-*` CSS rules to the relevant component's `<style>` block. Do not use `scoped` — AG Grid cells sit outside the component's scope boundary, so scoped styles will not reach them.
4. Map your Laravel API response field to the `status` column. `toStatusCode()` handles both numeric and string inputs, so a Laravel API Resource can return either format without any changes to the frontend.

---

*Documentation generated February 2026.*
