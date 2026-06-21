<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, Bell, Sun, Moon, ShieldCheck, ChevronDown } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useCalendarStore } from '@/stores/calendar'
import { useTheme } from '@/composables/useTheme'
import { ROLE_LABELS, TASK_TYPE_LABELS, type Role } from '@/data/types'
import { formatDate } from '@/lib/format'
import { useRouter } from 'vue-router'

defineProps<{ onMenu?: () => void }>()

const auth = useAuthStore()
const calendar = useCalendarStore()
const { isDark, toggleTheme } = useTheme()
const router = useRouter()

const roleOpen = ref(false)
const bellOpen = ref(false)
const roles: Role[] = ['coach', 'manager', 'analyst', 'player']

const reminders = computed(() => calendar.reminders.slice(0, 5))
function gotoTask() {
  bellOpen.value = false
  router.push('/calendar')
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-edge bg-obsidian/70 px-4 backdrop-blur-md"
  >
    <div class="flex items-center gap-3">
      <button class="btn-ghost !p-2 lg:hidden" @click="onMenu">
        <Menu :size="18" />
      </button>
      <div class="hidden items-center gap-2 font-mono text-xs text-muted sm:flex">
        <span class="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-acid" />
        LIVE · 作战指挥台已联机
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- 提醒中心 -->
      <div class="relative">
        <button
          class="relative btn-ghost !p-2"
          @click="bellOpen = !bellOpen"
          aria-label="提醒"
        >
          <Bell :size="18" />
          <span
            v-if="reminders.length"
            class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-obsidian"
          >
            {{ reminders.length }}
          </span>
        </button>
        <div
          v-if="bellOpen"
          class="absolute right-0 top-12 w-72 rounded-lg border border-edge bg-panel-2 p-2 shadow-panel"
          @click.stop
        >
          <p class="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
            日程提醒
          </p>
          <button
            v-for="t in reminders"
            :key="t.id"
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-panel"
            @click="gotoTask"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-acid" />
            <span class="flex-1">
              <span class="block font-semibold text-fg">{{ t.title }}</span>
              <span class="block text-muted">{{ TASK_TYPE_LABELS[t.type] }} · {{ formatDate(t.startAt, true) }}</span>
            </span>
          </button>
          <p v-if="!reminders.length" class="px-2 py-3 text-center text-xs text-muted">
            暂无提醒
          </p>
        </div>
      </div>

      <button class="btn-ghost !p-2" @click="toggleTheme" aria-label="主题">
        <Moon v-if="isDark" :size="18" />
        <Sun v-else :size="18" />
      </button>

      <!-- 角色切换 -->
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-md border border-edge bg-ink-800/70 px-2.5 py-1.5 text-xs font-semibold"
          @click="roleOpen = !roleOpen"
        >
          <ShieldCheck :size="14" class="text-acid" />
          <span class="hidden sm:inline">{{ ROLE_LABELS[auth.role] }}</span>
          <ChevronDown :size="14" class="text-muted" />
        </button>
        <div
          v-if="roleOpen"
          class="absolute right-0 top-12 w-40 rounded-lg border border-edge bg-panel-2 p-1 shadow-panel"
          @click.stop
        >
          <button
            v-for="r in roles"
            :key="r"
            class="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-panel"
            :class="auth.role === r ? 'text-acid' : 'text-muted hover:text-fg'"
            @click="(auth.setRole(r), (roleOpen = false))"
          >
            {{ ROLE_LABELS[r] }}
            <span v-if="auth.role === r" class="text-acid">●</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
