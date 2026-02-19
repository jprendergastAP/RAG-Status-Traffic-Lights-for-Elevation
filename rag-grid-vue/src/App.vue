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
    valueFormatter: () => '',   // cell text empty — dot is drawn by CSS ::before
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
