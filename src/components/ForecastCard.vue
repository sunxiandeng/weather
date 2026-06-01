<template>
  <view class="forecast-card">
    <view class="card-header">
      <text class="card-title">📅 未来天气与鱼情</text>
      <text class="card-subtitle">查看未来五天天气及钓鱼建议</text>
    </view>
    
    <view class="forecast-list">
      <view 
        class="forecast-item" 
        v-for="(day, index) in weather.forecast" 
        :key="index"
        @tap="showDetail(index)"
      >
        <view class="forecast-main">
          <text class="day-name">{{ day.date }}</text>
          <text class="weather-icon">{{ getWeatherIcon(day.dayWeather) }}</text>
          <view class="temp-range">
            <text class="high-temp">{{ day.highTemp }}°</text>
            <text class="low-temp">{{ day.lowTemp }}°</text>
          </view>
          <view 
            class="fishing-badge" 
            :style="{ background: getLevelColor(getCondition(index).level) }"
          >
            {{ getLevelText(getCondition(index).level) }}
          </view>
        </view>
        
        <view class="forecast-detail" v-if="expandedIndex === index">
          <view class="detail-row">
            <text class="detail-label">天气：</text>
            <text class="detail-value">{{ day.dayWeather }}转{{ day.nightWeather }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">风向：</text>
            <text class="detail-value">{{ day.windDirection }} {{ day.windLevel }} {{ Math.round(day.windSpeed) }}km/h</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">温差：</text>
            <text class="detail-value">{{ day.highTemp - day.lowTemp }}°C</text>
          </view>
          <view class="detail-divider"></view>
          <view class="fishing-analysis">
            <view class="analysis-title">🐟 鱼情分析</view>
            <text class="analysis-desc">{{ getCondition(index).description }}</text>
            <view class="analysis-time" v-if="getCondition(index).bestTime.length > 0">
              <text class="time-label">最佳时段：</text>
              <text class="time-values">{{ getCondition(index).bestTime.join('、') }}</text>
            </view>
            <view class="analysis-fish" v-if="getCondition(index).suitableFish.length > 0">
              <text class="fish-label">适宜鱼种：</text>
              <text class="fish-values">{{ getCondition(index).suitableFish.join('、') }}</text>
            </view>
          </view>
        </view>
        
        <text class="expand-icon">{{ expandedIndex === index ? '▼' : '▶' }}</text>
      </view>
    </view>
    
    <view class="legend">
      <view class="legend-item">
        <view class="legend-dot excellent"></view>
        <text>极佳</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot good"></view>
        <text>适宜</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot normal"></view>
        <text>一般</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot poor"></view>
        <text>不适宜</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'
import { analyzeForecastFishingCondition, getLevelColor, getLevelText } from '@/utils/fishingAnalysis'
import type { FishingCondition } from '@/types'

const store = useWeatherStore()
const { weather } = storeToRefs(store)

const expandedIndex = ref<number | null>(null)

const conditions = ref<FishingCondition[]>([])

function getCondition(index: number): FishingCondition {
  if (!conditions.value[index]) {
    conditions.value[index] = analyzeForecastFishingCondition(weather.value.forecast[index])
  }
  return conditions.value[index]
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return '☀️'
  if (weather.includes('云')) return '☁️'
  if (weather.includes('阴')) return '⛅'
  if (weather.includes('雨')) return '🌧️'
  if (weather.includes('雪')) return '❄️'
  return '🌤️'
}

function showDetail(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>

<style lang="scss" scoped>
.forecast-card {
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
      display: block;
    }
    
    .card-subtitle {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
      display: block;
    }
  }
  
  .forecast-list {
    .forecast-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .forecast-main {
        display: flex;
        align-items: center;
        
        .day-name {
          width: 100rpx;
          font-size: 26rpx;
          color: #666;
        }
        
        .weather-icon {
          width: 60rpx;
          font-size: 36rpx;
          text-align: center;
        }
        
        .temp-range {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          margin-right: 24rpx;
          
          .high-temp {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
          }
          
          .low-temp {
            font-size: 28rpx;
            color: #999;
            margin-left: 12rpx;
          }
        }
        
        .fishing-badge {
          font-size: 24rpx;
          color: #fff;
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
          font-weight: 500;
        }
      }
      
      .forecast-detail {
        margin-top: 20rpx;
        padding: 20rpx;
        background: #f8f9fa;
        border-radius: 16rpx;
        
        .detail-row {
          display: flex;
          margin-bottom: 12rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .detail-label {
            font-size: 24rpx;
            color: #999;
            width: 80rpx;
          }
          
          .detail-value {
            font-size: 24rpx;
            color: #333;
          }
        }
        
        .detail-divider {
          height: 1rpx;
          background: #e9ecef;
          margin: 16rpx 0;
        }
        
        .fishing-analysis {
          .analysis-title {
            font-size: 26rpx;
            font-weight: 600;
            color: #333;
            margin-bottom: 12rpx;
            display: block;
          }
          
          .analysis-desc {
            font-size: 24rpx;
            color: #666;
            line-height: 1.5;
            display: block;
            margin-bottom: 12rpx;
          }
          
          .analysis-time, .analysis-fish {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 8rpx;
            
            .time-label, .fish-label {
              font-size: 22rpx;
              color: #999;
            }
            
            .time-values, .fish-values {
              font-size: 22rpx;
              color: #1E90FF;
            }
          }
        }
      }
      
      .expand-icon {
        font-size: 20rpx;
        color: #999;
        float: right;
        margin-top: -40rpx;
      }
    }
  }
  
  .legend {
    display: flex;
    justify-content: center;
    gap: 32rpx;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 22rpx;
      color: #666;
      
      .legend-dot {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        
        &.excellent { background: #52c41a; }
        &.good { background: #1890ff; }
        &.normal { background: #faad14; }
        &.poor { background: #ff4d4f; }
      }
    }
  }
}
</style>