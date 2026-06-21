<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useScrimsStore } from '@/stores/scrims'
import { useCalendarStore } from '@/stores/calendar'
import { useTransferStore } from '@/stores/transfers'
import { useAnalyticsStore } from '@/stores/analytics'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'

const team = useTeamStore()
const scrims = useScrimsStore()
const calendar = useCalendarStore()
const transfers = useTransferStore()
const analytics = useAnalyticsStore()

const mobileOpen = ref(false)
const collapsed = ref(false)

onMounted(async () => {
  await Promise.all([
    team.load(),
    scrims.load(),
    calendar.load(),
    transfers.load(),
    analytics.load(),
  ])
})
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar :collapsed="collapsed" />

    <!-- 移动端抽屉 -->
    <Transition name="drawer">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-obsidian/70" @click="mobileOpen = false" />
        <div class="absolute left-0 top-0 h-full">
          <Sidebar :mobile-open="mobileOpen" @close-mobile="mobileOpen = false" />
        </div>
      </div>
    </Transition>

    <div class="flex flex-1 flex-col overflow-hidden">
      <TopBar :on-menu="() => (mobileOpen = true)" />
      <main class="flex-1 overflow-y-auto scrollbar-thin">
        <div class="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
