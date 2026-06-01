<template>
  <view class="hourly-card">
    <view class="card-header">
      <text class="card-title">📊 逐小时预报</text>
      <view class="tabs">
        <view 
          class="tab" 
          :class="{ active: activeTab === 'temperature' }" 
          @tap="activeTab = 'temperature'"
        >气温</view>
        <view 
          class="tab" 
          :class="{ active: activeTab === 'wind' }" 
          @tap="activeTab = 'wind'"
        >风力</view>
        <view 
          class="tab" 
          :class="{ active: activeTab === 'precipitation' }" 
          @tap="activeTab = 'precipitation'"
        >降水量</view>
        <view 
          class="tab" 
          :class="{ active: activeTab === 'uv' }" 
          @tap="activeTab = 'uv'"
        >紫外线</view>
      </view>
    </view>
    
    <view class="chart-container">
      <view class="chart-y-axis">
        <text class="y-label">{{ maxValue }}</text>
        <text class="y-label">{{ Math.round((maxValue + minValue) / 2) }}</text>
        <text class="y-label">{{ minValue }}</text>
      </view>
      <view class="chart-area">
        <view class="chart-grid">
          <view class="grid-line" v-for="i in 3" :key="i"></view>
        </view>
        <svg class="chart-line" viewBox="0 0 600 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" :style="{ stopColor: getLineColor() }" />
              <stop offset="100%" :style="{ stopColor: getLineColor() }" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :style="{ stopColor: getLineColor(), stopOpacity: 0.3 }" />
              <stop offset="100%" :style="{ stopColor: getLineColor(), stopOpacity: 0 }" />
            </linearGradient>
          </defs>
          <path :d="areaPath" fill="url(#areaGradient)" />
          <polyline :points="linePoints" fill="none" stroke="url(#lineGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <view class="chart-points">
          <view class="point-item" v-for="(hour, index) in hourlyData" :key="index">
            <view 
              class="point" 
              :style="{ top: getPointTop(getCurrentValue(hour)) + 'px', background: getLineColor() }"
            ></view>
          </view>
        </view>
      </view>
    </view>
    
    <scroll-view scroll-x class="hourly-scroll" :show-scrollbar="false">
      <view class="hourly-list">
        <view class="hourly-item" v-for="(hour, index) in hourlyData" :key="index">
          <text class="hour-time">{{ index === 0 ? '现在' : hour.time }}</text>
          <text class="hour-icon" v-if="activeTab === 'temperature'">{{ getWeatherIcon(hour.weather) }}</text>
          <text class="hour-icon" v-else-if="activeTab === 'wind'">💨</text>
          <text class="hour-icon" v-else-if="activeTab === 'precipitation'">💧</text>
          <text class="hour-icon" v-else>☀️</text>
          <text class="hour-value" :style="{ color: getValueColor(getCurrentValue(hour)) }">
            {{ getDisplayValue(hour) }}
          </text>
          <text class="hour-unit">{{ getUnit() }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'

const store = useWeatherStore()
const { hourlyData } = storeToRefs(store)

const activeTab = ref('temperature')

const currentValues = computed(() => {
  return hourlyData.value.map(hour => getCurrentValue(hour))
})

const maxValue = computed(() => {
  const values = currentValues.value
  if (values.length === 0) return 30
  return Math.max(...values) + 5
})

const minValue = computed(() => {
  const values = currentValues.value
  if (values.length === 0) return 10
  return Math.min(...values) - 5
})

const linePoints = computed(() => {
  const range = maxValue.value - minValue.value
  const points = hourlyData.value.map((hour, index) => {
    const x = (index / (hourlyData.value.length - 1)) * 600
    const y = 150 - ((getCurrentValue(hour) - minValue.value) / range) * 130
    return `${x},${y}`
  })
  return points.join(' ')
})

const areaPath = computed(() => {
  const range = maxValue.value - minValue.value
  let path = `M 0,150 `
  hourlyData.value.forEach((hour, index) => {
    const x = (index / (hourlyData.value.length - 1)) * 600
    const y = 150 - ((getCurrentValue(hour) - minValue.value) / range) * 130
    path += `L ${x},${y} `
  })
  path += `L 600,150 Z`
  return path
})

function getCurrentValue(hour: typeof hourlyData.value[0]): number {
  switch (activeTab.value) {
    case 'temperature':
      return hour.temperature
    case 'wind':
      return hour.windSpeed || 0
    case 'precipitation':
      return hour.precipitation || 0
    case 'uv':
      return hour.uvIndex || 0
    default:
      return hour.temperature
  }
}

function getDisplayValue(hour: typeof hourlyData.value[0]): string {
  const value = getCurrentValue(hour)
  if (activeTab.value === 'uv') {
    return getUvText(value)
  }
  return Math.round(value).toString()
}

function getUnit(): string {
  switch (activeTab.value) {
    case 'temperature':
      return '°C'
    case 'wind':
      return 'km/h'
    case 'precipitation':
      return '%'
    case 'uv':
      return ''
    default:
      return ''
  }
}

function getPointTop(value: number): number {
  const range = maxValue.value - minValue.value
  return 150 - ((value - minValue.value) / range) * 130
}

function getLineColor(): string {
  switch (activeTab.value) {
    case 'temperature':
      return '#ff6b6b'
    case 'wind':
      return '#4ecdc4'
    case 'precipitation':
      return '#1E90FF'
    case 'uv':
      return '#ffd93d'
    default:
      return '#1E90FF'
  }
}

function getValueColor(value: number): string {
  if (activeTab.value === 'uv') {
    if (value <= 2) return '#52c41a'
    if (value <= 5) return '#1890ff'
    if (value <= 7) return '#faad14'
    return '#ff4d4f'
  }
  if (activeTab.value === 'temperature') {
    return value >= 30 ? '#ff6b6b' : '#333'
  }
  return '#333'
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return '☀️'
  if (weather.includes('多云')) return '⛅'
  if (weather.includes('阴')) return '☁️'
  if (weather.includes('雨')) return '🌧️'
  if (weather.includes('雪')) return '❄️'
  return '🌤️'
}

function getUvText(index: number): string {
  if (index <= 2) return '弱'
  if (index <= 5) return '中'
  if (index <= 7) return '强'
  return '极强'
}
</script>

<style lang="scss" scoped>
.hourly-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    flex-shrink: 0;
  }
  
  .tabs {
    display: flex;
    gap: 8rpx;
    
    .tab {
      padding: 6rpx 16rpx;
      font-size: 24rpx;
      color: #999;
      border-radius: 16rpx;
      background: #f5f5f5;
      transition: all 0.3s ease;
      
      &.active {
        background: #1E90FF;
        color: #fff;
        box-shadow: 0 2rpx 8rpx rgba(30, 144, 255, 0.3);
      }
    }
  }
}

.chart-container {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding: 16rpx 0;
  
  .chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 5rpx 0;
    width: 60rpx;
    
    .y-label {
      font-size: 20rpx;
      color: #999;
      text-align: right;
    }
  }
  
  .chart-area {
    flex: 1;
    height: 150rpx;
    position: relative;
    
    .chart-grid {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .grid-line {
        height: 1rpx;
        background: #eee;
      }
    }
    
    .chart-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .chart-points {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      
      .point-item {
        .point {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          position: absolute;
          transform: translateX(-50%);
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}

.hourly-scroll {
  white-space: nowrap;
}

.hourly-list {
  display: inline-flex;
  gap: 16rpx;
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 8rpx;
  width: 90rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  
  .hour-time {
    font-size: 22rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .hour-icon {
    font-size: 36rpx;
    margin-bottom: 8rpx;
  }
  
  .hour-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 4rpx;
  }
  
  .hour-unit {
    font-size: 20rpx;
    color: #999;
  }
}
</style>