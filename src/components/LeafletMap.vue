<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

export interface MapMarker {
  lat: number
  lng: number
  title: string
  label?: string
  tone?: 'acid' | 'ember' | 'steel' | 'violetx'
}

const props = withDefaults(
  defineProps<{
    markers: MapMarker[]
    center?: [number, number]
    zoom?: number
    height?: number
    className?: string
  }>(),
  {
    center: (): [number, number] => [30, 110],
    zoom: 2,
    height: 320,
  },
)

const el = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const layer = L.layerGroup()
let tiles: L.TileLayer | null = null

const toneColor: Record<string, string> = {
  acid: '#b6ff3a',
  ember: '#ff6b35',
  steel: '#38bdf8',
  violetx: '#a78bfa',
}

function draw() {
  if (!map) return
  layer.clearLayers()
  for (const m of props.markers) {
    const color = toneColor[m.tone ?? 'acid']
    const marker = L.circleMarker([m.lat, m.lng], {
      radius: 8,
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.35,
    })
    marker.bindPopup(
      `<div style="font-weight:600;color:#e6e9ef">${m.title}</div>${
        m.label ? `<div style="color:#8b93a7;margin-top:2px">${m.label}</div>` : ''
      }`,
    )
    marker.addTo(layer)
  }
  layer.addTo(map)
  if (props.markers.length) {
    const bounds = L.latLngBounds(props.markers.map((m) => [m.lat, m.lng]))
    map.fitBounds(bounds.pad(0.3), { maxZoom: 6, animate: false })
  }
}

onMounted(() => {
  if (!el.value) return
  map = L.map(el.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: true,
    attributionControl: true,
    worldCopyJump: true,
  })
  tiles = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    },
  ).addTo(map)
  draw()
})

watch(() => props.markers, draw, { deep: true })

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div :class="cn('overflow-hidden rounded-lg border border-edge', className)">
    <div ref="el" :style="{ height: height + 'px', width: '100%' }" />
  </div>
</template>
