import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import PlayersListPage from '@/pages/players/PlayersListPage.vue'
import PlayerDetailPage from '@/pages/players/PlayerDetailPage.vue'
import ScrimsPage from '@/pages/scrims/ScrimsPage.vue'
import CalendarPage from '@/pages/calendar/CalendarPage.vue'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage.vue'
import TransfersPage from '@/pages/transfers/TransfersPage.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'dashboard', component: DashboardPage },
      { path: 'players', name: 'players', component: PlayersListPage },
      {
        path: 'players/:id',
        name: 'player-detail',
        component: PlayerDetailPage,
      },
      { path: 'scrims', name: 'scrims', component: ScrimsPage },
      { path: 'calendar', name: 'calendar', component: CalendarPage },
      { path: 'analytics', name: 'analytics', component: AnalyticsPage },
      { path: 'transfers', name: 'transfers', component: TransfersPage },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
