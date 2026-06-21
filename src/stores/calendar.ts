import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calendarTaskRepo } from '@/data/repositories'
import type { CalendarTask, TaskStatus } from '@/data/types'

export const useCalendarStore = defineStore('calendar', () => {
  const tasks = ref<CalendarTask[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    tasks.value = await calendarTaskRepo.list()
    loaded.value = true
    loading.value = false
  }

  const byDate = computed(
    () => (dateStr: string) =>
      tasks.value
        .filter((t) => t.startAt.slice(0, 10) === dateStr)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
  )

  const upcoming = computed(() =>
    [...tasks.value]
      .filter((t) => new Date(t.startAt).getTime() >= Date.now() - 86400000)
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .slice(0, 6),
  )

  const reminders = computed(() =>
    tasks.value.filter((t) => t.reminder && t.status !== 'done'),
  )

  async function save(t: CalendarTask) {
    const exists = tasks.value.some((x) => x.id === t.id)
    if (exists) {
      const updated = await calendarTaskRepo.update(t.id, t)
      if (updated) {
        const i = tasks.value.findIndex((x) => x.id === t.id)
        tasks.value[i] = updated
      }
    } else {
      tasks.value.push(await calendarTaskRepo.create(t))
    }
  }
  async function remove(id: string) {
    await calendarTaskRepo.remove(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }
  async function setStatus(id: string, status: TaskStatus) {
    const updated = await calendarTaskRepo.update(id, { status })
    if (updated) {
      const i = tasks.value.findIndex((t) => t.id === id)
      tasks.value[i] = updated
    }
  }

  return {
    tasks,
    loaded,
    loading,
    load,
    byDate,
    upcoming,
    reminders,
    save,
    remove,
    setStatus,
  }
})
