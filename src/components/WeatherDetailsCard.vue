<template>
  <view class="details-card">
    <view class="card-header">
      <text class="card-title">📋 详细天气</text>
    </view>
    
    <view class="details-grid">
      <view class="detail-item">
        <view class="detail-icon-wrap humidity">
          <text class="detail-icon">💧</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">湿度</text>
          <text class="detail-value">{{ weather.humidity }}%</text>
          <text class="detail-desc">{{ getHumidityDesc(weather.humidity) }}</text>
        </view>
      </view>
      
      <view class="detail-item">
        <view class="detail-icon-wrap uv">
          <text class="detail-icon">☀️</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">紫外线</text>
          <text class="detail-value">{{ getUvText(weather.uvIndex) }}</text>
          <text class="detail-desc">{{ getUvDesc(weather.uvIndex) }}</text>
        </view>
      </view>
      
      <view class="detail-item">
        <view class="detail-icon-wrap sunrise">
          <text class="detail-icon">🌅</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">日出</text>
          <text class="detail-value">{{ weather.sunrise }}</text>
          <text class="detail-desc">今日日出时间</text>
        </view>
      </view>
      
      <view class="detail-item">
        <view class="detail-icon-wrap sunset">
          <text class="detail-icon">🌇</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">日落</text>
          <text class="detail-value">{{ weather.sunset }}</text>
          <text class="detail-desc">今日日落时间</text>
        </view>
      </view>
      
      <view class="detail-item">
        <view class="detail-icon-wrap pressure">
          <text class="detail-icon">📊</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">气压</text>
          <text class="detail-value">{{ weather.pressure }} hPa</text>
          <text class="detail-desc">{{ getPressureDesc(weather.pressure) }}</text>
        </view>
      </view>
      
      <view class="detail-item">
        <view class="detail-icon-wrap visibility">
          <text class="detail-icon">👁️</text>
        </view>
        <view class="detail-content">
          <text class="detail-label">能见度</text>
          <text class="detail-value">{{ weather.visibility }} km</text>
          <text class="detail-desc">{{ getVisibilityDesc(weather.visibility) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'

const store = useWeatherStore()
const { weather } = storeToRefs(store)

function getHumidityDesc(humidity: number): string {
  if (humidity < 30) return '空气干燥'
  if (humidity < 60) return '湿度适中'
  if (humidity < 80) return '湿度较高'
  return '空气潮湿'
}

function getUvText(index: number): string {
  if (index <= 2) return '弱'
  if (index <= 4) return '中等'
  if (index <= 6) return '强'
  if (index <= 8) return '很强'
  return '极强'
}

function getUvDesc(index: number): string {
  if (index <= 2) return '无需防护'
  if (index <= 4) return '涂SPF15+'
  if (index <= 6) return '涂SPF30+'
  if (index <= 8) return '避免外出'
  return '尽量避免外出'
}

function getPressureDesc(pressure: number): string {
  if (pressure > 1013) return '气压偏高'
  if (pressure >= 1000) return '气压正常'
  if (pressure >= 990) return '气压偏低'
  return '气压很低'
}

function getVisibilityDesc(visibility: number): string {
  if (visibility >= 10) return '能见度极好'
  if (visibility >= 5) return '能见度良好'
  if (visibility >= 1) return '能见度一般'
  return '能见度较差'
}
</script>

<style lang="scss" scoped>
.details-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 24rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  
  .detail-icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.humidity {
      background: linear-gradient(135deg, #1E90FF, #87CEEB);
    }
    
    &.uv {
      background: linear-gradient(135deg, #FFD700, #FFA500);
    }
    
    &.sunrise {
      background: linear-gradient(135deg, #FFA07A, #FF7F50);
    }
    
    &.sunset {
      background: linear-gradient(135deg, #FF6347, #DC143C);
    }
    
    &.pressure {
      background: linear-gradient(135deg, #9370DB, #8A2BE2);
    }
    
    &.visibility {
      background: linear-gradient(135deg, #32CD32, #228B22);
    }
    
    .detail-icon {
      font-size: 40rpx;
    }
  }
  
  .detail-content {
    flex: 1;
    
    .detail-label {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 4rpx;
    }
    
    .detail-value {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4rpx;
    }
    
    .detail-desc {
      font-size: 20rpx;
      color: #666;
    }
  }
}
</style>