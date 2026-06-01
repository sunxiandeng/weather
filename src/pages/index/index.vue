<template>
  <view class="page-wrapper">
    <scroll-view 
      class="content-scroll" 
      scroll-y 
      :scroll-with-animation="true"
      :enhanced="true"
      :show-scrollbar="false"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      :refresher-background="'#f5f5f5'"
    >
      <template v-if="isFirstLoad && isLoading">
        <view class="loading-container">
          <view class="loading-spinner">
            <view class="loading-ring"></view>
            <text class="loading-icon">🎣</text>
          </view>
          <text class="loading-title">正在获取位置</text>
          <text class="loading-subtitle">{{ loadingTip }}</text>
        </view>
      </template>
      
      <template v-else>
        <view class="error-card" v-if="locationError">
          <view class="error-content">
            <text class="error-icon">⚠️</text>
            <view class="error-text-wrap">
              <text class="error-title">{{ locationError }}</text>
              <text class="error-action" @tap="showCityModal = true">点击手动选择城市 →</text>
            </view>
          </view>
        </view>
        
        <view class="cards-container">
          <WeatherCard />
          <FishingConditionCard />
          <WeatherForecastCard />
          <ForecastCard />
          <WeatherDetailsCard />
          <QuickAccessCard />
        </view>
        
        <view class="bottom-spacing"></view>
      </template>
    </scroll-view>
    
    <view class="city-modal" v-if="showCityModal" @tap="showCityModal = false">
      <view class="city-modal-content" @tap.stop>
        <view class="city-modal-header">
          <text class="city-modal-title">选择城市</text>
          <text class="city-modal-close" @tap="showCityModal = false">✕</text>
        </view>
        
        <view class="city-modal-body">
          <view class="search-box">
            <text class="search-icon">🔍</text>
            <input 
              class="search-input" 
              v-model="cityInput" 
              placeholder="搜索城市"
              :placeholder-style="{ color: '#999' }"
              @confirm="handleCitySearch"
            />
          </view>
          
          <view class="hot-cities">
            <text class="hot-title">热门城市</text>
            <view class="hot-grid">
              <view 
                class="hot-item" 
                v-for="city in hotCities" 
                :key="city" 
                @tap="selectCity(city)"
              >
                {{ city }}
              </view>
            </view>
          </view>
        </view>
        
        <view class="city-modal-footer">
          <button class="confirm-btn" @tap="handleCitySearch">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'
import WeatherCard from '@/components/WeatherCard.vue'
import FishingConditionCard from '@/components/FishingConditionCard.vue'
import WeatherForecastCard from '@/components/WeatherForecastCard.vue'
import WeatherDetailsCard from '@/components/WeatherDetailsCard.vue'
import QuickAccessCard from '@/components/QuickAccessCard.vue'
import ForecastCard from '@/components/ForecastCard.vue'

const store = useWeatherStore()
const { isLoading, locationError } = storeToRefs(store)

const isRefreshing = ref(false)
const isFirstLoad = ref(true)
const platform = ref('h5')
const showCityModal = ref(false)
const cityInput = ref('')

const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京', '天津', '苏州']

const loadingTip = computed(() => {
  return platform.value === 'h5' 
    ? '请在浏览器中允许位置权限' 
    : '请在设置中允许位置权限'
})

onLoad(() => {
  platform.value = uni.getSystemInfoSync().uniPlatform || 'h5'
  initApp()
})

onMounted(() => {
  if (isFirstLoad.value) {
    initApp()
  }
})

async function initApp() {
  try {
    await store.fetchWeather()
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    isFirstLoad.value = false
  }
}

async function onRefresh() {
  isRefreshing.value = true
  cityInput.value = ''
  await store.fetchWeather()
  setTimeout(() => {
    isRefreshing.value = false
  }, 800)
}

async function handleCitySearch() {
  if (!cityInput.value.trim()) {
    uni.showToast({ title: '请输入城市名', icon: 'none' })
    return
  }
  await selectCity(cityInput.value.trim())
}

async function selectCity(city: string) {
  showCityModal.value = false
  uni.showLoading({ title: '获取天气中...', mask: true })
  
  try {
    const result = await store.fetchWeatherByCity(city)
    if (result.success) {
      uni.showToast({ title: '获取成功', icon: 'success' })
    } else {
      uni.showToast({ title: '获取失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '获取失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    cityInput.value = ''
  }
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  min-height: 100vh;
  background: #f5f5f5;
}

.content-scroll {
  min-height: 100vh;
  padding: 16rpx 24rpx;
  padding-top: calc(30rpx + var(--status-bar-height, 44px));
  padding-bottom: 30rpx;
  box-sizing: border-box;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40rpx;
}

.loading-spinner {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  
  .loading-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 6rpx solid rgba(30, 144, 255, 0.2);
    border-top-color: #1E90FF;
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
  }
  
  .loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 60rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.loading-subtitle {
  font-size: 26rpx;
  color: #999;
}

.error-card {
  background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #ffe082;
  
  .error-content {
    display: flex;
    align-items: center;
  }
  
  .error-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }
  
  .error-text-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  
  .error-title {
    font-size: 28rpx;
    color: #e65100;
  }
  
  .error-action {
    font-size: 26rpx;
    color: #1E90FF;
    font-weight: 500;
  }
}

.bottom-spacing {
  height: 40rpx;
}

.city-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.city-modal-content {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.city-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .city-modal-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
  
  .city-modal-close {
    font-size: 44rpx;
    color: #999;
    padding: 8rpx;
    line-height: 1;
  }
}

.city-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
  height: 88rpx;
  margin-bottom: 32rpx;
  
  .search-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
  }
  
  .search-input {
    flex: 1;
    font-size: 30rpx;
    background: transparent;
  }
}

.hot-cities {
  .hot-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .hot-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .hot-item {
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
    border-radius: 28rpx;
    padding: 16rpx 32rpx;
    font-size: 28rpx;
    color: #1E90FF;
    border: 1rpx solid #b3d7ff;
  }
}

.city-modal-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  
  .confirm-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%);
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(30, 144, 255, 0.3);
  }
}



@media screen and (max-width: 320px) {
  .content-scroll {
    padding: 16rpx;
    padding-top: calc(100rpx + var(--status-bar-height, 44px));
  }
  
  .hot-item {
    padding: 12rpx 24rpx;
    font-size: 26rpx;
  }
}
</style>