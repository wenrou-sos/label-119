<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; width?: string }>(),
  { width: 'max-w-lg' },
)
const emit = defineEmits<{ close: []; confirm: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(
  () => props.open,
  (v) => {
    if (typeof document === 'undefined') return
    if (v) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" @click="emit('close')" />
        <div
          :class="['panel relative w-full overflow-visible border-ink-300 p-0', width]"
        >
          <header class="flex items-center justify-between border-b border-edge px-5 py-3">
            <h3 class="font-display text-base font-semibold text-fg">{{ title }}</h3>
            <button class="text-muted transition hover:text-fg" @click="emit('close')">
              <X :size="18" />
            </button>
          </header>
          <div class="max-h-[70vh] overflow-y-auto scrollbar-thin p-5">
            <slot />
          </div>
          <footer
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 border-t border-edge px-5 py-3"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
