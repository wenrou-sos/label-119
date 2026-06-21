<script setup lang="ts">
import { ref, watch } from 'vue'
import { Save } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { POSITION_LABELS, type Player } from '@/data/types'

const props = defineProps<{ player: Player }>()
const team = useTeamStore()
const { canEdit } = usePermission()

const form = ref<Player>({ ...props.player })
watch(() => props.player, (p) => (form.value = { ...p }))

async function save() {
  await team.savePlayer({ ...form.value })
}
</script>

<template>
  <BaseCard title="基础信息" icon="🪪" accent="steel">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="label">选手 ID</label>
        <input v-model="form.handle" class="input" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">真实姓名</label>
        <input v-model="form.realName" class="input" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">年龄</label>
        <input v-model.number="form.age" type="number" class="input" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">游戏位置</label>
        <select v-model="form.position" class="input" :disabled="!canEdit">
          <option v-for="(v, k) in POSITION_LABELS" :key="k" :value="k">{{ v }}</option>
        </select>
      </div>
      <div>
        <label class="label">国籍</label>
        <input v-model="form.nationality" class="input" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">国家代码</label>
        <input v-model="form.countryCode" class="input" maxlength="3" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">入队日期</label>
        <input v-model="form.joinDate" type="date" class="input" :disabled="!canEdit" />
      </div>
      <div>
        <label class="label">状态</label>
        <select v-model="form.status" class="input" :disabled="!canEdit">
          <option value="active">主力</option>
          <option value="benched">替补</option>
          <option value="training">青训</option>
        </select>
      </div>
    </div>
    <div v-if="canEdit" class="mt-4 flex justify-end">
      <button class="btn-acid" @click="save"><Save :size="15" /> 保存修改</button>
    </div>
  </BaseCard>
</template>
