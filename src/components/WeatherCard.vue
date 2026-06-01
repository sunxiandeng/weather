<template>
  <view class="weather-card">
    <view class="weather-header">
      <view class="location" @tap="openCityPicker">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ currentLocation }}</text>
        <text class="location-arrow">›</text>
      </view>
      <view class="weather-main">
        <view class="temp-section">
          <text class="temp-value">{{ weather.temperature }}</text>
          <text class="temp-unit">°C</text>
        </view>
        <view class="weather-info">
          <text class="weather-desc">{{ weather.weather }}</text>
          <text class="feels-like">体感 {{ weather.feelsLike }}°C</text>
        </view>
      </view>
    </view>
    
    <view class="weather-details">
      <view class="detail-item">
        <text class="detail-icon">💧</text>
        <view class="detail-content">
          <text class="detail-label">湿度</text>
          <text class="detail-value">{{ weather.humidity }}%</text>
        </view>
      </view>
      <view class="detail-item">
        <text class="detail-icon">🌬️</text>
        <view class="detail-content">
          <text class="detail-label">风向</text>
          <text class="detail-value">{{ weather.windDirection }} {{ weather.windLevel }}</text>
        </view>
      </view>
      <view class="detail-item">
        <text class="detail-icon">💨</text>
        <view class="detail-content">
          <text class="detail-label">风速</text>
          <text class="detail-value">{{ Math.round(weather.windSpeed) }}km/h</text>
        </view>
      </view>
      <view class="detail-item">
        <text class="detail-icon">☀️</text>
        <view class="detail-content">
          <text class="detail-label">紫外线</text>
          <text class="detail-value">{{ getUvText(weather.uvIndex) }}</text>
        </view>
      </view>
    </view>

    <view class="sun-times">
      <view class="sun-item">
        <text class="sun-icon">🌅</text>
        <view class="sun-content">
          <text class="sun-label">日出</text>
          <text class="sun-time">{{ weather.sunrise }}</text>
        </view>
      </view>
      <view class="sun-divider"></view>
      <view class="sun-item">
        <text class="sun-icon">🌇</text>
        <view class="sun-content">
          <text class="sun-label">日落</text>
          <text class="sun-time">{{ weather.sunset }}</text>
        </view>
      </view>
    </view>
  </view>
  
  <CityPicker 
    :visible="showCityPicker" 
    @update:visible="showCityPicker = $event"
    @select="onCitySelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'
import CityPicker from './CityPicker.vue'

const store = useWeatherStore()
const { weather, currentLocation, isLoading } = storeToRefs(store)
const showCityPicker = ref(false)

function getUvText(index: number): string {
  if (index <= 2) return '低'
  if (index <= 5) return '中等'
  if (index <= 7) return '高'
  if (index <= 10) return '很高'
  return '极高'
}

function openCityPicker() {
  showCityPicker.value = true
}

async function onCitySelect(city: string) {
  store.selectLocation(city)
  const result = await store.fetchWeatherByCity(city)
  if (!result.success) {
    uni.showToast({
      title: '获取天气失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.weather-card {
  background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%);
  border-radius: 32rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(30, 144, 255, 0.3);
}

.weather-header {
  .location {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    .location-icon {
      font-size: 40rpx;
      margin-right: 12rpx;
    }
    
    .location-text {
      font-size: 34rpx;
      font-weight: 600;
      flex: 1;
    }
    
    .location-arrow {
      font-size: 44rpx;
      opacity: 0.8;
    }
  }
  
  .weather-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 40rpx;
    
    .temp-section {
      display: flex;
      align-items: flex-start;
      
      .temp-value {
        font-size: 180rpx;
        font-weight: 200;
        line-height: 0.9;
        letter-spacing: -8rpx;
      }
      
      .temp-unit {
        font-size: 40rpx;
        margin-top: 24rpx;
        opacity: 0.9;
      }
    }
    
    .weather-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      
      .weather-desc {
        font-size: 48rpx;
        font-weight: 500;
        margin-bottom: 12rpx;
      }
      
      .feels-like {
        font-size: 28rpx;
        opacity: 0.85;
      }
    }
  }
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding-bottom: 32rpx;
  margin-bottom: 32rpx;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.15);
  
  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 8rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    
    .detail-icon {
      font-size: 44rpx;
      margin-bottom: 12rpx;
    }
    
    .detail-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;
    }
    
    .detail-label {
      font-size: 24rpx;
      opacity: 0.8;
    }
    
    .detail-value {
      font-size: 28rpx;
      font-weight: 600;
    }
  }
}

.sun-times {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 0;
  
  .sun-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .sun-icon {
      font-size: 48rpx;
    }
    
    .sun-content {
      display: flex;
      flex-direction: column;
      gap: 4rpx;
    }
    
    .sun-label {
      font-size: 26rpx;
      opacity: 0.8;
    }
    
    .sun-time {
      font-size: 32rpx;
      font-weight: 600;
    }
  }
  
  .sun-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>