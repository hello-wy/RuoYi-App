<template>
  <view class="relation-groups">
    <RelationGroup title="一级邀请用户" :items="level1Invitees" :selected-user="selectedUser" @reward="$emit('reward', $event)" @remove="$emit('remove', $event)" />
    <RelationGroup title="二级邀请用户" :items="level2Invitees" :selected-user="selectedUser" @reward="$emit('reward', $event)" @remove="$emit('remove', $event)" />
  </view>
</template>

<script setup>
import RelationGroup from './RelationGroup.vue'

defineProps({
  selectedUser: { type: Object, required: true },
  level1Invitees: { type: Array, required: true },
  level2Invitees: { type: Array, required: true }
})
defineEmits(['reward', 'remove'])
</script>

<style lang="scss" scoped>
.relation-groups { display: flex; flex-direction: column; gap: 20rpx; }
</style>
