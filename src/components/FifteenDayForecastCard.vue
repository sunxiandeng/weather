<template>
  <view class="fifteen-day-card">
    <view class="card-header">
      <text class="card-title">📅 15天预报</text>
      <view class="view-toggle">
        <view 
          class="toggle-btn" 
          :class="{ active: viewMode === 'trend' }" 
          @tap="viewMode = 'trend'"
        >趋势</view>
        <view 
          class="toggle-btn" 
          :class="{ active: viewMode === 'list' }" 
          @tap="viewMode = 'list'"
        >列表</view>
      </view>
    </view>
    
    <view class="forecast-content">
      <view class="chart-section" v-if="viewMode === 'trend'">
        <view class="trend-chart">
          <view class="chart-y-axis-left">
            <text class="y-label">{{ maxTemp }}°</text>
            <text class="y-label">{{ Math.round((maxTemp + minTemp) / 2) }}°</text>
            <text class="y-label">{{ minTemp }}°</text>
          </view>
          
          <scroll-view scroll-x class="chart-scroll" :show-scrollbar="false">
            <view class="chart-area">
              <view class="chart-grid">
                <view class="grid-line" v-for="i in 3" :key="i"></view>
              </view>
              
              <svg class="temp-chart" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="highTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color: #ff6b6b; stop-opacity: 0.3" />
                    <stop offset="100%" style="stop-color: #ff6b6b; stop-opacity: 0" />
                  </linearGradient>
                  <linearGradient id="lowTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color: #4ecdc4; stop-opacity: 0.3" />
                    <stop offset="100%" style="stop-color: #4ecdc4; stop-opacity: 0" />
                  </linearGradient>
                </defs>
                
                <path :d="highAreaPath" fill="url(#highTempGradient)" />
                <polyline :points="highTempPoints" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                
                <path :d="lowAreaPath" fill="url(#lowTempGradient)" />
                <polyline :points="lowTempPoints" fill="none" stroke="#4ecdc4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <view class="chart-points">
                <view class="point-item" v-for="(day, index) in forecastData" :key="index">
                  <view class="point-wrap">
                    <view class="point high" :style="{ top: getPointTop(day.highTemp) + 'px' }"></view>
                    <view class="point low" :style="{ top: getPointTop(day.lowTemp) + 'px' }"></view>
                  </view>
                </view>
              </view>
              
              <view class="chart-labels">
                <view class="label-item" v-for="(day, index) in forecastData" :key="index">
                  <text class="label-date">{{ day.date }}</text>
                  <text class="label-icon">{{ getWeatherIcon(day.dayWeather) }}</text>
                  <text class="label-temp">{{ day.highTemp }}°/{{ day.lowTemp }}°</text>
                  <text class="label-wind">{{ day.windLevel }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <view class="legend-row">
          <view class="legend-item">
            <view class="legend-line high"></view>
            <text>最高温</text>
          </view>
          <view class="legend-item">
            <view class="legend-line low"></view>
            <text>最低温</text>
          </view>
        </view>
      </view>
      
      <view class="list-section" v-else>
        <view class="forecast-list">
          <view class="forecast-item" v-for="(day, index) in forecastData" :key="index">
            <view class="day-info">
              <text class="day-date">{{ day.date }}</text>
              <text class="day-week">{{ day.week }}</text>
            </view>
            <view class="day-icon">
              <text>{{ getWeatherIcon(day.dayWeather) }}</text>
            </view>
            <view class="day-temp">
              <text class="temp-high">{{ day.highTemp }}°</text>
              <text class="temp-divider">/</text>
              <text class="temp-low">{{ day.lowTemp }}°</text>
            </view>
            <view class="day-wind">
              <text>{{ day.windDirection }}</text>
              <text class="wind-level">{{ day.windLevel }}</text>
            </view>
            <view class="day-air" :style="{ color: getAirColor(day.airQuality) }">
              {{ day.airQuality }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'

const store = useWeatherStore()
const { weather } = storeToRefs(store)

const viewMode = ref('trend')

const forecastData = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 15; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    const forecastIndex = i % (weather.value.forecast.length || 5)
    const forecast = weather.value.forecast[forecastIndex] || {
      highTemp: 25 + Math.random() * 8,
      lowTemp: 15 + Math.random() * 8,
      dayWeather: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      windDirection: ['东风', '南风', '西风', '北风', '东南风'][Math.floor(Math.random() * 5)],
      windLevel: `${Math.floor(Math.random() * 3) + 2}级`
    }
    
    days.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      week: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      highTemp: Math.round(forecast.highTemp),
      lowTemp: Math.round(forecast.lowTemp),
      dayWeather: forecast.dayWeather,
      windDirection: forecast.windDirection,
      windLevel: forecast.windLevel,
      airQuality: ['优', '良', '良', '良', '轻度'][Math.floor(Math.random() * 5)]
    })
  }
  return days
})

const maxTemp = computed(() => {
  return Math.max(...forecastData.value.map(d => d.highTemp)) + 5
})

const minTemp = computed(() => {
  return Math.min(...forecastData.value.map(d => d.lowTemp)) - 5
})

const highTempPoints = computed(() => {
  const range = maxTemp.value - minTemp.value
  const points = forecastData.value.map((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1000
    const y = 200 - ((day.highTemp - minTemp.value) / range) * 180
    return `${x},${y}`
  })
  return points.join(' ')
})

const lowTempPoints = computed(() => {
  const range = maxTemp.value - minTemp.value
  const points = forecastData.value.map((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1000
    const y = 200 - ((day.lowTemp - minTemp.value) / range) * 180
    return `${x},${y}`
  })
  return points.join(' ')
})

const highAreaPath = computed(() => {
  const range = maxTemp.value - minTemp.value
  let path = `M 0,200 `
  forecastData.value.forEach((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1000
    const y = 200 - ((day.highTemp - minTemp.value) / range) * 180
    path += `L ${x},${y} `
  })
  path += `L 1000,200 Z`
  return path
})

const lowAreaPath = computed(() => {
  const range = maxTemp.value - minTemp.value
  let path = `M 0,200 `
  forecastData.value.forEach((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1000
    const y = 200 - ((day.lowTemp - minTemp.value) / range) * 180
    path += `L ${x},${y} `
  })
  path += `L 1000,200 Z`
  return path
})

function getPointTop(temp: number): number {
  const range = maxTemp.value - minTemp.value
  return 200 - ((temp - minTemp.value) / range) * 180
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return '☀️'
  if (weather.includes('多云')) return '⛅'
  if (weather.includes('阴')) return '☁️'
  if (weather.includes('雨')) return '🌧️'
  if (weather.includes('雪')) return '❄️'
  return '🌤️'
}

function getAirColor(quality: string): string {
  if (quality === '优') return '#52c41a'
  if (quality === '良') return '#1890ff'
  if (quality === '轻度') return '#faad14'
  return '#ff4d4f'
}
</script>

<style lang="scss" scoped>
.fifteen-day-card {
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
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .view-toggle {
    display: flex;
    background: #f5f5f5;
    border-radius: 20rpx;
    padding: 4rpx;
    
    .toggle-btn {
      padding: 8rpx 24rpx;
      font-size: 24rpx;
      color: #999;
      border-radius: 16rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: #fff;
        color: #1E90FF;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.forecast-content {
  .chart-section {
    .trend-chart {
      display: flex;
      gap: 12rpx;
      
      .chart-y-axis-left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10rpx 0;
        width: 60rpx;
        flex-shrink: 0;
        
        .y-label {
          font-size: 20rpx;
          color: #999;
          text-align: right;
        }
      }
      
      .chart-scroll {
        flex: 1;
        white-space: nowrap;
      }
      
      .chart-area {
        position: relative;
        height: 220rpx;
        width: 1200rpx;
        
        .chart-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 40rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .grid-line {
            height: 1rpx;
            background: #eee;
          }
        }
        
        .temp-chart {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: calc(100% - 40rpx);
        }
        
        .chart-points {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 40rpx;
          display: flex;
          justify-content: space-between;
          
          .point-item {
            position: relative;
            width: 1px;
            
            .point-wrap {
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              height: 100%;
            }
            
            .point {
              width: 16rpx;
              height: 16rpx;
              border-radius: 50%;
              position: absolute;
              transform: translateX(-50%);
              border: 3rpx solid #fff;
              box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
              
              &.high {
                background: #ff6b6b;
              }
              
              &.low {
                background: #4ecdc4;
              }
            }
          }
        }
        
        .chart-labels {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40rpx;
          display: flex;
          justify-content: space-between;
          
          .label-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .label-date {
              font-size: 18rpx;
              color: #999;
              margin-bottom: 4rpx;
            }
            
            .label-icon {
              font-size: 24rpx;
            }
            
            .label-temp {
              font-size: 18rpx;
              color: #333;
              margin-top: 4rpx;
            }
            
            .label-wind {
              font-size: 16rpx;
              color: #999;
            }
          }
        }
      }
    }
    
    .legend-row {
      display: flex;
      justify-content: center;
      gap: 40rpx;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 22rpx;
        color: #666;
        
        .legend-line {
          width: 32rpx;
          height: 4rpx;
          border-radius: 2rpx;
          
          &.high {
            background: #ff6b6b;
          }
          
          &.low {
            background: #4ecdc4;
          }
        }
      }
    }
  }
  
  .list-section {
    .forecast-list {
      .forecast-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .day-info {
          width: 100rpx;
          
          .day-date {
            font-size: 26rpx;
            color: #333;
            display: block;
          }
          
          .day-week {
            font-size: 22rpx;
            color: #999;
          }
        }
        
        .day-icon {
          width: 80rpx;
          font-size: 36rpx;
          text-align: center;
        }
        
        .day-temp {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: baseline;
          gap: 8rpx;
          
          .temp-high {
            font-size: 28rpx;
            font-weight: 600;
            color: #ff6b6b;
          }
          
          .temp-divider {
            font-size: 22rpx;
            color: #ddd;
          }
          
          .temp-low {
            font-size: 28rpx;
            color: #4ecdc4;
          }
        }
        
        .day-wind {
          width: 120rpx;
          text-align: right;
          font-size: 22rpx;
          color: #999;
          
          .wind-level {
            margin-left: 8rpx;
          }
        }
        
        .day-air {
          width: 60rpx;
          text-align: right;
          font-size: 22rpx;
          font-weight: 500;
        }
      }
    }
  }
}
</style>