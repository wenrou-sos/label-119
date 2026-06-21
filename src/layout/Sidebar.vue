<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Swords,
  CalendarDays,
  BarChart3,
  ArrowLeftRight,
  Crosshair,
  type LucideIcon,
} from 'lucide-vue-next'

defineProps<{ collapsed?: boolean; mobileOpen?: boolean }>()
const emit = defineEmits<{ 'close-mobile': [] }>()

const route = useRoute()
interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: string
}
const nav: NavItem[] = [
  { to: '/', label: '指挥中心', icon: LayoutDashboard },
  { to: '/players', label: '队员管理', icon: Users },
  { to: '/scrims', label: '训练赛', icon: Swords },
  { to: '/calendar', label: '赛训日历', icon: CalendarDays },
  { to: '/analytics', label: '数据分析', icon: BarChart3 },
  { to: '/transfers', label: '转会管理', icon: ArrowLeftRight },
]

const isActive = computed(
  () => (to: string) =>
    to === '/' ? route.path === '/' : route.path.startsWith(to),
)
</script>

<template>
  <aside
    :class="
      cn(
        'flex h-full flex-col border-r border-edge bg-panel/60 backdrop-blur-md transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )
    "
  >
    <div class="flex items-center gap-2.5 border-b border-edge px-4 py-4">
      <div
        class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-acid/40 bg-acid/10 text-acid shadow-glow"
      >
        <Crosshair :size="18" :stroke-width="2.5" />
      </div>
      <div v-if="!collapsed" class="leading-tight">
        <p class="font-display text-sm font-bold tracking-wider text-fg">NEXUS</p>
        <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-acid/80">
          OPS · v14.10
        </p>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-2">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :class="
          cn(
            'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all',
            isActive(item.to)
              ? 'bg-acid/10 text-acid shadow-glow'
              : 'text-muted hover:bg-panel-2 hover:text-fg',
            collapsed && 'justify-center',
          )
        "
        @click="emit('close-mobile')"
      >
        <span
          v-if="isActive(item.to)"
          class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-acid"
        />
        <component :is="item.icon" :size="18" :stroke-width="2" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div v-if="!collapsed" class="border-t border-edge p-3">
      <div class="rounded-md border border-edge bg-ink-800/60 p-3">
        <p class="font-mono text-[10px] uppercase tracking-wider text-muted">
          训练周期
        </p>
        <p class="mt-0.5 font-display text-sm font-bold text-fg">Week 25 · 2026</p>
        <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-700">
          <div class="h-full w-3/5 rounded-full bg-gradient-to-r from-acid-soft to-acid" />
        </div>
      </div>
    </div>
  </aside>
</template>
