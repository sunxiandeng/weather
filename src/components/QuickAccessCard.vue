<template>
  <view class="quick-access-card">
    <view class="card-header">
      <text class="card-title">🚀 快捷操作</text>
    </view>
    
    <view class="access-grid">
      <view class="access-item" @click="goToLocations">
        <text class="access-icon">📍</text>
        <text class="access-label">附近钓点</text>
      </view>
      <view class="access-item">
        <text class="access-icon">📝</text>
        <text class="access-label">钓鱼日记</text>
      </view>
      <view class="access-item">
        <text class="access-icon">🎒</text>
        <text class="access-label">渔具清单</text>
      </view>
      <view class="access-item">
        <text class="access-icon">💬</text>
        <text class="access-label">钓友交流</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goToLocations() {
  uni.navigateTo({
    url: '/pages/locations/locations'
  })
}
</script>

<style lang="scss" scoped>
.quick-access-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  
  .card-header {
    margin-bottom: 24rpx;
    
    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .access-grid {
    display: flex;
    justify-content: space-around;
    
    .access-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;
      
      .access-icon {
        font-size: 48rpx;
        margin-bottom: 12rpx;
      }
      
      .access-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>