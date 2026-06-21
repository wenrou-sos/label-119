import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role } from '@/data/types'

export const useAuthStore = defineStore('auth', () => {
  const role = ref<Role>('coach')
  const currentPlayerId = ref<string>('p3')

  function setRole(r: Role) {
    role.value = r
  }
  function setCurrentPlayer(id: string) {
    currentPlayerId.value = id
  }

  const canSeeSensitive = computed(
    () => role.value === 'coach' || role.value === 'manager',
  )
  const canEdit = computed(() => role.value === 'coach' || role.value === 'manager')

  return { role, currentPlayerId, setRole, setCurrentPlayer, canSeeSensitive, canEdit }
})
