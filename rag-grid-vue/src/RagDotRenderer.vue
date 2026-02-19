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
