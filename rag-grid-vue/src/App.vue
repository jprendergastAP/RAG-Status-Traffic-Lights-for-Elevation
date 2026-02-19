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
