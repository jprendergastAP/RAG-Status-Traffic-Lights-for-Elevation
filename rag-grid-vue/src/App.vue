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
0 = RED   → Off Track
1 = YELLOW → At Risk
2 = GREEN  → On Track
*/

const rowData = ref([
  { description: 'Initiative A', textAttr: 'On track',  status: 2 },
  { description: 'Initiative B', textAttr: 'At risk',   status: 1 },
  { description: 'Initiative C', textAttr: 'Blocked',   status: 0 },
  { description: 'Initiative D', textAttr: 'On track',  status: 2 },
  { description: 'Initiative E', textAttr: 'At risk',   status: 1 },
])

function toStatusCode(v) {
  if (v === 0 || v === 'RED')    return 0
  if (v === 1 || v === 'YELLOW') return 1
  if (v === 2 || v === 'GREEN')  return 2
  return null
}

function toStatusLabel(code) {
  if (code === 2) return 'On Track'
  if (code === 1) return 'At Risk'
  if (code === 0) return 'Off Track'
  return ''
}

const columnDefs = ref([
  { headerName: 'Description', field: 'description', flex: 2, minWidth: 220 },
  { headerName: 'Text',        field: 'textAttr',    flex: 2, minWidth: 220 },

  // Ultra-fast status dot: no framework renderer, no extra DOM nodes
  {
    headerName: 'Status',
    field: 'status',
    width: 140,
    sortable: true,
    filter: true,

    // Normalize to 0/1/2 even if backend sends strings
    valueGetter: (p) => toStatusCode(p.data?.status),

    // Dot drawn via CSS ::before; label text from the cell value
    valueFormatter: (p) => toStatusLabel(p.value),

    // Add CSS classes based on the normalized value
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

.btn:hover {
  background: #f9fafb;
}

.grid {
  height: 420px;
  width: 900px;
}

/* FAST STATUS DOT — rendered via CSS pseudo-element, no extra DOM nodes */

.ryg-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ryg-cell::before {
  content: "";
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.ryg-red::before    { background: #e74c3c; }
.ryg-yellow::before { background: #f1c40f; }
.ryg-green::before  { background: #2ecc71; }
</style>
