<template>
  <view class="dict-tag-wrap">
    <template v-if="Array.isArray(computedValues)">
      <text
        v-for="(item, index) in computedValues"
        :key="index"
        class="dict-tag"
        :class="getTagClass(item)"
        :style="getTagStyle(item)"
      >{{ item.label }}</text>
    </template>
    <text
      v-else-if="singleItem"
      class="dict-tag"
      :class="getTagClass(singleItem)"
      :style="getTagStyle(singleItem)"
    >{{ singleItem.label }}</text>
  </view>
</template>

<script>
/**
 * DictTag 组件
 *
 * Props:
 *   options  - 字典数组，来自 this.dict.type.xxx
 *              格式：[{ label, value, elTagType, elTagClass }]
 *   value    - 当前值，可以是单个值（string/number）或数组
 *
 * Usage:
 *   <dict-tag :options="dict.type.sys_methods" :value="item.methods" />
 *   <dict-tag :options="dict.type.sys_methods" :value="['1','2']" />
 */
export default {
  name: 'DictTag',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      default: undefined
    }
  },
  computed: {
    // 多值情况：返回匹配 label 的数组
    computedValues() {
      if (!Array.isArray(this.value)) return null
      const result = []
      this.value.forEach(val => {
        const found = (this.options || []).find(
          opt => String(opt.value) === String(val)
        )
        if (found) result.push(found)
        else result.push({ label: val, value: val, elTagType: '', elTagClass: '' })
      })
      return result
    },
    // 单值情况
    singleItem() {
      if (Array.isArray(this.value)) return null
      if (this.value === undefined || this.value === null || this.value === '') return null
      const found = (this.options || []).find(
        opt => String(opt.value) === String(this.value)
      )
      return found || { label: this.value, value: this.value, elTagType: '', elTagClass: '' }
    }
  },
  methods: {
    getTagClass(item) {
      if (!item) return {}
      // elTagType 映射为内置样式
      const typeMap = {
        'primary':   'dict-tag--primary',
        'success':   'dict-tag--success',
        'warning':   'dict-tag--warning',
        'danger':    'dict-tag--danger',
        'info':      'dict-tag--info',
        '':          'dict-tag--default'
      }
      const typeClass = typeMap[item.elTagType] || 'dict-tag--default'
      return [typeClass, item.elTagClass || '']
    },
    getTagStyle(item) {
      return {}
    }
  }
}
</script>

<style scoped>
.dict-tag-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
  align-items: center;
}

.dict-tag {
  display: inline-flex;
  align-items: center;
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  line-height: 1.4;
}

/* 内置主题 */
.dict-tag--default {
  background-color: #F3F4F6;
  color: #555;
}
.dict-tag--primary {
  background-color: #EAF3FF;
  color: #3B82F6;
}
.dict-tag--success {
  background-color: #E6F9F0;
  color: #10B981;
}
.dict-tag--warning {
  background-color: #FFF7E6;
  color: #F59E0B;
}
.dict-tag--danger {
  background-color: #FFF0F0;
  color: #EF4444;
}
.dict-tag--info {
  background-color: #F0F4FF;
  color: #6366F1;
}
</style>
