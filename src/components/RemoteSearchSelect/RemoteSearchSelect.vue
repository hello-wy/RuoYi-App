<template>
  <view class="remote-search-select">
    <view class="input-row">
      <input class="input" :value="modelValue" :placeholder="placeholder" @input="onInput" @focus="onFocus" @blur="onBlur" />
      <view v-if="modelValue" class="clear" @click="clear"><uni-icons type="clear" size="16" color="#94a3b8" /></view>
    </view>
    <view v-if="visible" class="dropdown">
      <view v-if="loading" class="state">搜索中...</view>
      <scroll-view v-else-if="options.length" class="options" scroll-y>
        <view v-for="item in options" :key="item.value" class="option" @click="select(item)">{{ item.label }}</view>
      </scroll-view>
      <view v-else class="state">{{ emptyText }}</view>
    </view>
  </view>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  emptyText: { type: String, default: '暂无匹配结果' }
})
const emit = defineEmits(['update:modelValue', 'input', 'search', 'select', 'clear'])
const visible = ref(false)
let timer

function onInput(event) {
  const value = event.detail.value
  emit('update:modelValue', value)
  emit('input', value)
  clearTimeout(timer)
  timer = setTimeout(() => emit('search', value.trim()), 300)
}
function onFocus() {
  visible.value = true
  emit('search', props.modelValue.trim())
}
function onBlur() { setTimeout(() => { visible.value = false }, 200) }
function select(item) {
  clearTimeout(timer)
  emit('update:modelValue', item.label)
  emit('select', item)
  visible.value = false
}
function clear() {
  clearTimeout(timer)
  emit('update:modelValue', '')
  emit('clear')
  visible.value = true
  emit('search', '')
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style lang="scss" scoped>
.remote-search-select { position:relative; }.input-row { display:flex;align-items:center;min-height:72rpx;padding:0 18rpx;box-sizing:border-box;border:1rpx solid #e2e8f0;border-radius:10rpx;background:#f8fafc; }.input { flex:1;font-size:26rpx; }.clear { padding:8rpx; }.dropdown { position:absolute;z-index:10;top:calc(100% + 8rpx);right:0;left:0;border:1rpx solid #e2e8f0;border-radius:10rpx;background:#fff;box-shadow:0 8rpx 24rpx rgba(15,23,42,.12);overflow:hidden; }.options { max-height:400rpx; }.option,.state { padding:18rpx;color:#475569;font-size:25rpx; }.option { border-bottom:1rpx solid #f1f5f9; }.option:active { background:#f0fdfa; }.state { text-align:center;color:#94a3b8; }
</style>
