<template>
  <view class="forecast-card">
    <view class="hourly-section">
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
      
      <scroll-view scroll-x class="hourly-scroll" :show-scrollbar="false">
        <view class="hourly-list">
          <view class="hourly-item" v-for="(hour, index) in displayHourlyData" :key="index">
            <text class="hour-time">{{ hour.isNow ? '现在' : hour.time }}</text>
            <text class="hour-icon">{{ getTabIcon(hour) }}</text>
            <text class="hour-value" :style="{ color: getValueColor(getCurrentValue(hour)) }">
              {{ getDisplayValue(hour) }}
            </text>
            <text class="hour-unit" v-if="getUnit() && activeTab !== 'uv'">{{ getUnit() }}</text>
            <text class="hour-extra" v-if="activeTab === 'temperature'">{{ getUvText(hour.uvIndex || 0) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="fifteen-section">
      <view class="section-header">
        <text class="section-title">15天预报</text>
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
          <scroll-view scroll-x class="chart-scroll" :show-scrollbar="false">
            <view class="trend-chart">
              <view class="chart-y-axis">
                <text class="y-label">{{ maxTemp }}°</text>
                <text class="y-label">{{ Math.round((maxTemp + minTemp) / 2) }}°</text>
                <text class="y-label">{{ minTemp }}°</text>
              </view>
              
              <view class="chart-area">
                <view class="chart-grid">
                  <view class="grid-line" v-for="i in 3" :key="i"></view>
                </view>
                
                <svg class="temp-chart" viewBox="0 0 1400 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="highTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color: #FF6B6B; stop-opacity: 0.25" />
                      <stop offset="100%" style="stop-color: #FF6B6B; stop-opacity: 0" />
                    </linearGradient>
                    <linearGradient id="lowTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color: #4ECDC4; stop-opacity: 0.25" />
                      <stop offset="100%" style="stop-color: #4ECDC4; stop-opacity: 0" />
                    </linearGradient>
                  </defs>
                  <path :d="highAreaPath" fill="url(#highTempGradient)" />
                  <polyline :points="highTempPoints" fill="none" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path :d="lowAreaPath" fill="url(#lowTempGradient)" />
                  <polyline :points="lowTempPoints" fill="none" stroke="#4ECDC4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
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
                    <text class="label-temp">{{ day.highTemp }}°</text>
                    <text class="label-temp-low">{{ day.lowTemp }}°</text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
          
          <view class="legend-row">
            <view class="legend-item">
              <view class="legend-dot high"></view>
              <text>最高温</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot low"></view>
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'

const store = useWeatherStore()
const { weather, hourlyData } = storeToRefs(store)

const activeTab = ref('temperature')
const viewMode = ref('trend')

const displayHourlyData = computed(() => {
  return hourlyData.value.map((item, index) => ({
    ...item,
    isNow: index === 0 && item.time === '现在'
  }))
})

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
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    
    let dateLabel = ''
    let weekLabel = ''
    
    if (i === 0) {
      dateLabel = '今天'
    } else if (i === 1) {
      dateLabel = '明天'
    } else {
      dateLabel = `${month}/${day}`
      weekLabel = weekDay
    }
    
    days.push({
      date: dateLabel,
      week: weekLabel,
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
    const x = (index / (forecastData.value.length - 1)) * 1400
    const y = 180 - ((day.highTemp - minTemp.value) / range) * 160
    return `${x},${y}`
  })
  return points.join(' ')
})

const lowTempPoints = computed(() => {
  const range = maxTemp.value - minTemp.value
  const points = forecastData.value.map((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1400
    const y = 180 - ((day.lowTemp - minTemp.value) / range) * 160
    return `${x},${y}`
  })
  return points.join(' ')
})

const highAreaPath = computed(() => {
  const range = maxTemp.value - minTemp.value
  let path = `M 0,180 `
  forecastData.value.forEach((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1400
    const y = 180 - ((day.highTemp - minTemp.value) / range) * 160
    path += `L ${x},${y} `
  })
  path += `L 1400,180 Z`
  return path
})

const lowAreaPath = computed(() => {
  const range = maxTemp.value - minTemp.value
  let path = `M 0,180 `
  forecastData.value.forEach((day, index) => {
    const x = (index / (forecastData.value.length - 1)) * 1400
    const y = 180 - ((day.lowTemp - minTemp.value) / range) * 160
    path += `L ${x},${y} `
  })
  path += `L 1400,180 Z`
  return path
})

function getPointTop(temp: number): number {
  const range = maxTemp.value - minTemp.value
  return 180 - ((temp - minTemp.value) / range) * 160
}

function getCurrentValue(hour: any): number {
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

function getDisplayValue(hour: any): string {
  const value = getCurrentValue(hour)
  if (activeTab.value === 'uv') {
    return getUvText(value)
  }
  if (activeTab.value === 'wind') {
    return getWindLevelText(Math.round(value / 3.6))
  }
  return Math.round(value).toString()
}

function getUnit(): string {
  switch (activeTab.value) {
    case 'temperature':
      return '°'
    case 'wind':
      return '级'
    case 'precipitation':
      return '%'
    case 'uv':
      return ''
    default:
      return ''
  }
}

function getTabIcon(hour: any): string {
  if (activeTab.value === 'temperature') return getWeatherIcon(hour.weather)
  if (activeTab.value === 'wind') return '💨'
  if (activeTab.value === 'precipitation') return '💧'
  return '☀️'
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

function getWindLevelText(power: number): string {
  if (power <= 1) return '1'
  if (power <= 3) return '2-3'
  if (power <= 5) return '4-5'
  return '6+'
}

function getAirColor(quality: string): string {
  if (quality === '优') return '#52c41a'
  if (quality === '良') return '#1890ff'
  if (quality === '轻度') return '#faad14'
  return '#ff4d4f'
}
</script>

<style lang="scss" scoped>
.forecast-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 0;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.hourly-section {
  padding: 32rpx;
  
  .tabs {
    display: flex;
    background: #f0f2f5;
    border-radius: 20rpx;
    padding: 6rpx;
    margin-bottom: 24rpx;
    
    .tab {
      flex: 1;
      padding: 16rpx 12rpx;
      text-align: center;
      font-size: 26rpx;
      color: #666;
      border-radius: 16rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: #fff;
        color: #1890ff;
        font-weight: 600;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
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
    padding: 16rpx 16rpx;
    background: #f8f9fa;
    border-radius: 20rpx;
    min-width: 90rpx;
    
    .hour-time {
      font-size: 22rpx;
      color: #999;
      margin-bottom: 12rpx;
    }
    
    .hour-icon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }
    
    .hour-value {
      font-size: 30rpx;
      font-weight: 600;
      margin-bottom: 4rpx;
    }
    
    .hour-unit {
      font-size: 20rpx;
      color: #999;
      margin-bottom: 8rpx;
    }
    
    .hour-extra {
      font-size: 18rpx;
      color: #999;
    }
  }
}

.fifteen-section {
  padding: 24rpx 32rpx;
  padding-top: 0;
  border-top: 1rpx solid #f0f2f5;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .view-toggle {
      display: flex;
      background: #f0f2f5;
      border-radius: 20rpx;
      padding: 4rpx;
      
      .toggle-btn {
        padding: 10rpx 28rpx;
        font-size: 24rpx;
        color: #666;
        border-radius: 16rpx;
        transition: all 0.3s ease;
        
        &.active {
          background: #fff;
          color: #1890ff;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
        }
      }
    }
  }
  
  .forecast-content {
    .chart-section {
      .chart-scroll {
        white-space: nowrap;
      }
      
      .trend-chart {
        display: flex;
        gap: 8rpx;
        
        .chart-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 10rpx 0;
          padding-bottom: 60rpx;
          width: 60rpx;
          flex-shrink: 0;
          
          .y-label {
            font-size: 20rpx;
            color: #999;
            text-align: right;
          }
        }
        
        .chart-area {
          position: relative;
          height: 260rpx;
          width: 2200rpx;
          
          .chart-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 60rpx;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            
            .grid-line {
              height: 1rpx;
              background: #f0f2f5;
            }
          }
          
          .temp-chart {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: calc(100% - 60rpx);
          }
          
          .chart-points {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 60rpx;
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
                width: 14rpx;
                height: 14rpx;
                border-radius: 50%;
                position: absolute;
                transform: translateX(-50%);
                border: 3rpx solid #fff;
                box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
                
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
            height: 60rpx;
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
                margin-bottom: 4rpx;
              }
              
              .label-temp {
                font-size: 18rpx;
                color: #ff6b6b;
                font-weight: 500;
              }
              
              .label-temp-low {
                font-size: 18rpx;
                color: #4ecdc4;
              }
            }
          }
        }
      }
      
      .legend-row {
        display: flex;
        justify-content: center;
        gap: 48rpx;
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1rpx solid #f0f2f5;
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 10rpx;
          font-size: 22rpx;
          color: #666;
          
          .legend-dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            
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
            width: 90rpx;
            
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
            width: 100rpx;
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
}
</style>
