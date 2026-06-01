<template>
  <view class="city-picker-mask" v-if="visible" @tap="close">
    <view class="city-picker-container" @tap.stop>
      <view class="city-picker-header">
        <text class="city-picker-title">选择城市</text>
        <text class="city-picker-close" @tap="close">✕</text>
      </view>
      
      <view class="city-search">
        <input 
          class="city-search-input" 
          v-model="searchText" 
          placeholder="搜索城市"
          @input="onSearch"
        />
      </view>
      
      <scroll-view class="city-picker-content" scroll-y>
        <view class="city-section" v-if="!searchText">
          <view class="city-section-title">热门城市</view>
          <view class="city-grid">
            <view 
              class="city-item" 
              v-for="city in hotCities" 
              :key="city" 
              @tap="selectCity(city)"
            >
              {{ city }}
            </view>
          </view>
        </view>
        
        <view class="city-section" v-if="!searchText">
          <view 
            class="province-group" 
            v-for="(cityList, province) in citiesByProvince" 
            :key="province"
          >
            <view class="city-section-title">{{ province }}</view>
            <view class="city-list">
              <view 
                class="city-item-full" 
                v-for="city in cityList" 
                :key="city" 
                @tap="selectCity(city)"
              >
                {{ city }}
              </view>
            </view>
          </view>
        </view>
        
        <view class="city-section" v-if="searchText && filteredCities.length > 0">
          <view class="city-section-title">搜索结果</view>
          <view class="city-list">
            <view 
              class="city-item-full" 
              v-for="city in filteredCities" 
              :key="city" 
              @tap="selectCity(city)"
            >
              {{ city }}
            </view>
          </view>
        </view>
        
        <view class="city-empty" v-if="searchText && filteredCities.length === 0">
          <text class="city-empty-icon">🔍</text>
          <text class="city-empty-text">未找到该城市</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HOT_CITIES, CITIES_BY_PROVINCE } from '@/data/cities'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'select', city: string): void
}>()

const searchText = ref('')
const hotCities = ref(HOT_CITIES)
const citiesByProvince = ref(CITIES_BY_PROVINCE)

const filteredCities = computed(() => {
  if (!searchText.value) return []
  
  const text = searchText.value.toLowerCase()
  const results: string[] = []
  
  for (const city of hotCities.value) {
    if (city.toLowerCase().includes(text)) {
      results.push(city)
    }
  }
  
  for (const province in citiesByProvince.value) {
    for (const city of citiesByProvince.value[province]) {
      if (city.toLowerCase().includes(text) && !results.includes(city)) {
        results.push(city)
      }
    }
  }
  
  return results.slice(0, 20)
})

function close() {
  searchText.value = ''
  emit('update:visible', false)
}

function selectCity(city: string) {
  emit('select', city)
  close()
}

function onSearch() {
}
</script>

<style lang="scss" scoped>
.city-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.city-picker-container {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.city-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.city-picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.city-picker-close {
  font-size: 40rpx;
  color: #999;
  padding: 8rpx;
}

.city-search {
  padding: 24rpx 32rpx;
}

.city-search-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.city-picker-content {
  flex: 1;
  padding: 0 32rpx 32rpx;
}

.city-section {
  margin-bottom: 32rpx;
}

.city-section-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.city-item {
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 16rpx 8rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;
}

.province-group {
  margin-bottom: 24rpx;
}

.city-list {
  display: flex;
  flex-direction: column;
}

.city-item-full {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;
  color: #333;
}

.city-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.city-empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.city-empty-text {
  font-size: 26rpx;
  color: #999;
}
</style>