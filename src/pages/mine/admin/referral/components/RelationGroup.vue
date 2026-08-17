<template>
  <view class="group-card">
    <view class="group-head"><text class="group-title">{{ title }}</text><text class="group-count">{{ items.length }} 人</text></view>
    <view v-if="items.length === 0" class="empty-state">暂无{{ title }}</view>
    <view v-else class="relation-list">
      <view v-for="item in items" :key="item.id" class="relation-card">
        <view class="relation-main">
          <view class="user-block"><text class="user-role-label">受邀用户</text><text class="user-name">{{ item.userName || '微信用户' }}</text><text class="user-phone">{{ item.phone || '无手机号' }}</text></view>
          <view class="connector"><text class="connector-arrow">←</text><text class="connector-code">{{ item.inviteCode }}</text></view>
          <view class="user-block"><text class="user-role-label">直接邀请人</text><text class="user-name">{{ item.inviterUserName || '微信用户' }}</text><text class="user-phone">{{ item.inviterPhone || '无手机号' }}</text></view>
        </view>
        <view class="relation-footer"><text class="bind-time">绑定时间：{{ item.createTime }}</text><text class="reward-status" :class="isPendingReward(item) ? 'pending' : 'rewarded'">{{ rewardText(item) }}</text></view>
        <view v-if="isPendingReward(item)" class="relation-actions"><button class="reward-btn" size="mini" @click="$emit('reward', item)">审核发奖</button><button class="remove-btn" size="mini" @click="$emit('remove', item)">删除绑定</button></view>
        <text v-else-if="item.rewardTime" class="reward-time">发放时间：{{ item.rewardTime }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({ title: { type: String, required: true }, items: { type: Array, required: true } })
defineEmits(['reward', 'remove'])

function isPendingReward(item) { return !item.rewardStatus || item.rewardStatus === 'PENDING' }
function rewardText(item) { return isPendingReward(item) ? '待审核' : `已发放 ¥${item.rewardAmount}` }
</script>

<style lang="scss" scoped>
.group-card { background: #fff; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .02); }
.group-head, .relation-footer { display: flex; justify-content: space-between; align-items: center; gap: 12rpx; }
.group-head { margin-bottom: 20rpx; }.group-title { font-size: 30rpx; font-weight: 700; color: #1e293b; }.group-count, .bind-time, .reward-time { font-size: 22rpx; color: #94a3b8; }
.empty-state { padding: 36rpx; text-align: center; color: #94a3b8; font-size: 24rpx; }.relation-list { display: flex; flex-direction: column; gap: 16rpx; }
.relation-card { padding: 20rpx; background: #f8fafc; border-radius: 12rpx; }.relation-main { display: flex; align-items: stretch; gap: 12rpx; margin-bottom: 16rpx; }.user-block { flex: 1; display: flex; flex-direction: column; padding: 16rpx; background: #fff; border: 1px solid #f1f5f9; border-radius: 8rpx; min-width: 0; }
.user-role-label { margin-bottom: 8rpx; font-size: 20rpx; font-weight: 700; color: #64748b; }.user-name { margin-bottom: 4rpx; font-size: 28rpx; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.user-phone { font-size: 22rpx; color: #64748b; }
.connector { width: 100rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }.connector-arrow { font-size: 32rpx; color: #f59e0b; font-weight: 700; }.connector-code { max-width: 100rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 20rpx; color: #f59e0b; background: #fef3c7; padding: 2rpx 8rpx; border-radius: 4rpx; }
.relation-footer { border-top: 1px dashed #e2e8f0; padding-top: 12rpx; }.reward-status { font-size: 22rpx; }.pending { color: #d97706; }.rewarded { color: #16a34a; }.relation-actions { display: flex; justify-content: flex-end; gap: 12rpx; margin-top: 16rpx; }.reward-btn, .remove-btn { margin: 0; color: #fff; font-size: 22rpx; }.reward-btn { background: #0f9d8f; }.remove-btn { background: #dc2626; }.reward-time { display: block; margin-top: 10rpx; }
</style>
