<template>
  <view class="fishing-card">
    <view class="card-header">
      <text class="card-title">🐟 今日鱼情</text>
      <view class="condition-badge" :style="{ backgroundColor: levelColor }">
        <text class="badge-text">{{ levelText }}</text>
      </view>
    </view>
    
    <view class="condition-content">
      <text class="condition-desc">{{ condition.description }}</text>
      <text class="condition-suggestion">{{ condition.suggestion }}</text>
    </view>
    
    <view class="factors-row" v-if="condition.factors">
      <view class="factor-item">
        <view class="factor-icon-wrap">
          <text class="factor-icon">📊</text>
        </view>
        <text class="factor-label">气压</text>
        <text class="factor-value" :class="{ high: condition.factors.pressure > 1005, low: condition.factors.pressure < 995 }">
          {{ condition.factors.pressure }}hPa
        </text>
      </view>
      <view class="factor-item">
        <view class="factor-icon-wrap">
          <text class="factor-icon">🌡️</text>
        </view>
        <text class="factor-label">温差</text>
        <text class="factor-value" :class="{ high: condition.factors.dailyTempDiff > 8 }">
          {{ condition.factors.dailyTempDiff }}°C
        </text>
      </view>
      <view class="factor-item">
        <view class="factor-icon-wrap">
          <text class="factor-icon">💨</text>
        </view>
        <text class="factor-label">风向</text>
        <text class="factor-value">{{ condition.factors.windDirection }}</text>
      </view>
    </view>
    
    <view class="best-time" v-if="condition.bestTime.length > 0">
      <view class="section-header">
        <text class="section-icon">🎯</text>
        <text class="section-title">最佳出钓时间</text>
      </view>
      <view class="time-tags">
        <view class="time-tag" v-for="(time, index) in condition.bestTime" :key="index">
          {{ time }}
        </view>
      </view>
    </view>
    
    <view class="suitable-fish" v-if="condition.suitableFish.length > 0">
      <view class="section-header">
        <text class="section-icon">🐠</text>
        <text class="section-title">适宜垂钓鱼种</text>
      </view>
      <view class="fish-tags">
        <view class="fish-tag" v-for="(fish, index) in condition.suitableFish" :key="index">
          {{ fish }}
        </view>
      </view>
    </view>
    
    <view class="strategy-card" v-if="strategy.position">
      <view class="section-header">
        <text class="section-icon">📋</text>
        <text class="section-title">作钓策略</text>
      </view>
      <view class="strategy-grid">
        <view class="strategy-item">
          <text class="strategy-icon">📍</text>
          <view class="strategy-info">
            <text class="strategy-label">钓位</text>
            <text class="strategy-value">{{ strategy.position }}</text>
          </view>
        </view>
        <view class="strategy-item">
          <text class="strategy-icon">🌊</text>
          <view class="strategy-info">
            <text class="strategy-label">水深</text>
            <text class="strategy-value">{{ strategy.depth }}</text>
          </view>
        </view>
        <view class="strategy-item">
          <text class="strategy-icon">🪣</text>
          <view class="strategy-info">
            <text class="strategy-label">饵料</text>
            <text class="strategy-value">{{ strategy.bait }}</text>
          </view>
        </view>
        <view class="strategy-item">
          <text class="strategy-icon">🎣</text>
          <view class="strategy-info">
            <text class="strategy-label">调漂</text>
            <text class="strategy-value">{{ strategy.drift }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { getLevelColor, getLevelText, generateFishingStrategy } from '@/utils/fishingAnalysis'

const store = useWeatherStore()
const condition = computed(() => store.fishingCondition)

const levelColor = computed(() => getLevelColor(condition.value.level))
const levelText = computed(() => getLevelText(condition.value.level))

const strategy = computed(() => generateFishingStrategy(condition.value))
</script>

<style lang="scss" scoped>
.fishing-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
  
  .card-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  
  .condition-badge {
    padding: 10rpx 24rpx;
    border-radius: 24rpx;
    
    .badge-text {
      font-size: 28rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

.condition-content {
  margin-bottom: 28rpx;
  
  .condition-desc {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
    line-height: 1.3;
  }
  
  .condition-suggestion {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.factors-row {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20rpx;
  margin-bottom: 28rpx;
  
  .factor-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .factor-icon-wrap {
      width: 64rpx;
      height: 64rpx;
      background: #fff;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    }
    
    .factor-icon {
      font-size: 32rpx;
    }
    
    .factor-label {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 6rpx;
    }
    
    .factor-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      
      &.high { color: #52c41a; }
      &.low { color: #ff4d4f; }
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  .section-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }
  
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }
}

.best-time {
  margin-bottom: 28rpx;
  
  .time-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  
  .time-tag {
    padding: 12rpx 28rpx;
    background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
    color: #e65100;
    border-radius: 28rpx;
    font-size: 26rpx;
    font-weight: 500;
    border: 1rpx solid #ffe082;
  }
}

.suitable-fish {
  margin-bottom: 28rpx;
  
  .fish-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  
  .fish-tag {
    padding: 12rpx 28rpx;
    background: linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%);
    color: #1565c0;
    border-radius: 28rpx;
    font-size: 26rpx;
    font-weight: 500;
    border: 1rpx solid #b3d7ff;
  }
}

.strategy-card {
  padding: 24rpx;
  background: linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%);
  border-radius: 20rpx;
  
  .strategy-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    margin-top: 16rpx;
  }
  
  .strategy-item {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    background: #fff;
    padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    
    .strategy-icon {
      font-size: 40rpx;
      flex-shrink: 0;
    }
    
    .strategy-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;
    }
    
    .strategy-label {
      font-size: 24rpx;
      color: #999;
    }
    
    .strategy-value {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
    }
  }
}
</style>