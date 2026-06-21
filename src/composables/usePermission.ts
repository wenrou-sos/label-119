import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()
  const canSeeSensitive = computed(() => auth.canSeeSensitive)
  const canEdit = computed(() => auth.canEdit)

  function maskMoney(v: number | undefined): string {
    return canSeeSensitive.value && v != null
      ? `¥${v.toLocaleString('zh-CN')}`
      : '****'
  }
  function maskText(v: string | undefined): string {
    return canSeeSensitive.value ? (v ?? '') : '（权限受限）'
  }

  return { canSeeSensitive, canEdit, maskMoney, maskText }
}
