<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-alert v-if="tip" :title="tip" type="info" :closable="false" show-icon style="margin-bottom: 14px" />
    <el-form label-width="80px">
      <el-form-item label="处理动作">
        <el-radio-group v-model="action">
          <el-radio-button v-for="a in actions" :key="a.value" :value="a.value">{{ a.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="处理意见">
        <el-input v-model="opinion" type="textarea" :rows="3" :placeholder="placeholder" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="confirm">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '审核处理' },
  // [{value,label,type}]
  actions: { type: Array, default: () => [{ value: 'pass', label: '通过' }] },
  defaultAction: { type: String, default: '' },
  tip: { type: String, default: '' },
  placeholder: { type: String, default: '请填写处理意见' }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const action = ref('')
const opinion = ref('')
const loading = ref(false)

watch(() => props.modelValue, (v) => {
  if (v) {
    action.value = props.defaultAction || props.actions[0]?.value
    opinion.value = ''
  }
})

const confirmText = computed(() => props.actions.find((a) => a.value === action.value)?.label || '确定')

const confirm = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    emit('confirm', { action: action.value, opinion: opinion.value })
    visible.value = false
  }, 500)
}
</script>
