# RAG Status Lights — Vue 3 + AG Grid

**Repo:** https://github.com/jprendergastAP/RAG-Status-Traffic-Lights-for-Elevation

---

## What This Is

A reusable status-light component for AG Grid in Vue 3. Each row in the grid displays a coloured dot with a text label indicating project or initiative health. Built for the Elevation app (Vue 3 frontend, Laravel 10 backend).

---

## The Three Statuses

| Dot | Colour | Hex | Label |
|-----|--------|-----|-------|
| 🟢 | Green | `#2ecc71` | On Track |
| 🟡 | Yellow | `#f1c40f` | At Risk |
| 🔴 | Red | `#e74c3c` | Off Track |

The `status` field accepts either a **numeric** value (preferred) or a **string**:

| Numeric | String equivalents |
|---------|-------------------|
| `2` | `"GREEN"` |
| `1` | `"AMBER"`, `"YELLOW"` |
| `0` | `"RED"` |

---

## Project Structure

```
rag-grid-vue/
├── src/
│   ├── main.js               # App entry point + AG Grid CSS imports
│   ├── App.vue               # Grid definition, row data, column defs
│   └── RagDotRenderer.vue    # Vue cell renderer component
├── vite.config.js            # Vite config with single-file build plugin
└── package.json
```

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

## Source Files

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

Defines the grid, columns, and sample row data. The `RagDotRenderer` Vue component is passed directly to `cellRenderer`.

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <div class="pill">Vue 3 + AG Grid, Status lights</div>
      <button class="btn" @click="randomizeStatuses">Randomize</button>
    </div>

    <AgGridVue
      class="ag-theme-quartz grid"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :modules="modules"
      :animateRows="true"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule } from 'ag-grid-community'
import RagDotRenderer from './RagDotRenderer.vue'

// AG Grid v31+ requires modules to be declared — without this the grid is blank
const modules = [AllCommunityModule]

// Numeric enum: 0=RED, 1=YELLOW/AMBER, 2=GREEN
const rowData = ref([
  { description: 'Initiative A', textAttr: 'On track',  status: 2 },
  { description: 'Initiative B', textAttr: 'Some risk', status: 1 },
  { description: 'Initiative C', textAttr: 'Blocked',   status: 0 },
])

const columnDefs = ref([
  { headerName: 'Description', field: 'description', flex: 2, minWidth: 220 },
  { headerName: 'Text',        field: 'textAttr',    flex: 2, minWidth: 220 },
  {
    headerName: 'Status',
    field: 'status',
    width: 140,
    sortable: true,
    filter: true,
    cellRenderer: RagDotRenderer,
  },
])

const defaultColDef = ref({ resizable: true })

function randomizeStatuses() {
  const options = [0, 1, 2]
  rowData.value = rowData.value.map(r => ({
    ...r,
    status: options[Math.floor(Math.random() * options.length)],
  }))
}
</script>

<style>
.page {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  padding: 16px;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 13px;
}
.btn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}
.btn:hover { background: #f9fafb; }
.grid {
  height: 360px;
  width: 900px;
}
</style>
```

---

### `src/RagDotRenderer.vue`

The Vue component that renders the coloured dot and text label inside each Status cell.

```vue
<template>
  <span style="display: inline-flex; align-items: center; gap: 7px; height: 100%;">
    <span
      :style="{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        display: 'inline-block',
        background: dotColor,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }"
    ></span>
    <span style="font-size: 12px; opacity: 0.8;">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  params: { type: Object, required: true },
})

function norm(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  const s = String(v).toUpperCase()
  if (s === 'GREEN')                   return 2
  if (s === 'AMBER' || s === 'YELLOW') return 1
  if (s === 'RED')                     return 0
  return null
}

const code = computed(() => norm(props.params.value))

const dotColor = computed(() => {
  if (code.value === 2) return '#2ecc71'  // green
  if (code.value === 1) return '#f1c40f'  // yellow / amber
  if (code.value === 0) return '#e74c3c'  // red
  return '#bdc3c7'
})

const label = computed(() => {
  if (code.value === 2) return 'On Track'
  if (code.value === 1) return 'At Risk'
  if (code.value === 0) return 'Off Track'
  return ''
})
</script>
```

---

### `vite.config.js`

The `viteSingleFile` plugin inlines all JS and CSS into a single `index.html`, which is needed when opening the build directly from the filesystem (no local server required).

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

From AG Grid v31 onwards, every grid feature is opt-in. Without registering `AllCommunityModule`, the grid mounts but renders a completely blank box — no columns, no rows, no error.

```js
import { AllCommunityModule } from 'ag-grid-community'
// ...
const modules = [AllCommunityModule]
// passed as :modules="modules" on <AgGridVue>
```

### `frameworkComponents` was removed in AG Grid v28

The tutorial code in many articles still references `frameworkComponents` for registering Vue cell renderers. This API was removed in v28. In v35, pass the component object directly:

```js
// Old (broken in v35)
cellRenderer: 'RagDotRenderer',
frameworkComponents: { RagDotRenderer }

// Correct for v35
cellRenderer: RagDotRenderer   // the imported component object
```

### Do not use `<style scoped>` in cell renderer components

AG Grid mounts Vue cell renderer components in its own DOM context. Scoped CSS generates a unique `data-v-xxxxxxxx` attribute that Vue expects to match on its own rendered elements — but AG Grid's mount point sits outside that scope, so the styles are silently ignored and the dot renders invisible.

The fix is to use inline `:style` bindings instead of scoped CSS classes.

### Vite builds use `type="module"` scripts, which block over `file://`

A standard `npm run build` produces an `index.html` that loads JavaScript as ES modules. Browsers block cross-origin ES module loading over the `file://` protocol, so double-clicking the built file shows a blank page. Two ways around this: run a local HTTP server (`python -m http.server`), or use `vite-plugin-singlefile` to inline everything into one self-contained file.

---

## Integrating Into Elevation

When wiring this into the Elevation codebase (Vue 3, Laravel 10):

1. Copy `RagDotRenderer.vue` into the relevant Elevation component folder.
2. Import and register `AllCommunityModule` wherever your AG Grid instance is set up (if not already done globally).
3. Set `cellRenderer: RagDotRenderer` on the Status column definition.
4. Map your API response field to the `status` column. The renderer accepts numeric (`0/1/2`) or string (`RED/AMBER/GREEN`) values. A Laravel API Resource can emit either format.

---

*Documentation generated February 2026.*
