<template>
  <view class="page-container">
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索钓点、河道、水域" 
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
      </view>
      <view class="refresh-btn" @tap="refreshSpots">
        <text class="refresh-icon">🔄</text>
      </view>
    </view>
    
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'all' }"
        @click="setFilter('all')"
      >
        <text>全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'recommended' }"
        @click="setFilter('recommended')"
      >
        <text>推荐</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'river' }"
        @click="setFilter('river')"
      >
        <text>河流</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'lake' }"
        @click="setFilter('lake')"
      >
        <text>湖泊</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'reservoir' }"
        @click="setFilter('reservoir')"
      >
        <text>水库</text>
      </view>
    </view>
    
    <view class="spot-list" v-if="!isLoading">
      <view 
        class="spot-card" 
        v-for="spot in filteredSpots" 
        :key="spot.id"
        @click="showSpotDetail(spot)"
      >
        <image class="spot-image" :src="spot.image" mode="aspectFill" />
        <view class="spot-info">
          <view class="spot-header">
            <text class="spot-name">{{ spot.name }}</text>
            <view class="spot-badges">
              <text class="distance-badge">{{ formatDistance(spot.distance) }}</text>
              <text class="recommend-badge" v-if="spot.isRecommended">推荐</text>
            </view>
          </view>
          <text class="spot-address">{{ spot.address }}</text>
          <view class="spot-tags">
            <view class="type-tag">{{ getTypeText(spot.type) }}</view>
            <view class="rating-tag">
              <text>⭐</text>
              <text>{{ spot.rating.toFixed(1) }}</text>
            </view>
            <view class="water-quality-tag" :style="{ background: getWaterQualityColor(spot.waterQuality) }">
              {{ getWaterQualityText(spot.waterQuality) }}
            </view>
          </view>
          <view class="spot-details">
            <text class="detail-item">💧 {{ spot.depth || '水深未知' }}</text>
            <text class="detail-item" v-if="spot.hasGrass">🌿 有草区({{ spot.grassHoles }}个草洞)</text>
            <text class="detail-item" v-if="spot.hasBackwater">🌀 洄水湾</text>
          </view>
          <view class="fish-types">
            <text class="fish-label">鱼种：</text>
            <text class="fish-names">{{ spot.fishTypes.slice(0, 4).join('、') }}{{ spot.fishTypes.length > 4 ? '...' : '' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="loading-container" v-if="isLoading">
      <view class="loading-ring"></view>
      <text class="loading-text">正在搜索附近钓点...</text>
    </view>
    
    <view class="empty-state" v-if="!isLoading && filteredSpots.length === 0">
      <text class="empty-icon">🌊</text>
      <text class="empty-text">暂无匹配的钓点</text>
      <text class="empty-hint">试试搜索河道、湖泊、公园等关键词</text>
    </view>
    
    <view class="footer">
      <text class="footer-text">🎣 发现更多垂钓好去处</text>
    </view>
    
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedSpot?.name }}</text>
          <view class="modal-close" @click="closeModal">✕</view>
        </view>
        <scroll-view scroll-y class="modal-body">
          <image class="modal-image" :src="selectedSpot?.image" mode="aspectFill" />
          
          <view class="modal-section">
            <text class="section-title">📍 基本信息</text>
            <view class="info-grid">
              <view class="info-item">
                <text class="info-label">地址</text>
                <text class="info-value">{{ selectedSpot?.address }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">类型</text>
                <text class="info-value">{{ getTypeText(selectedSpot?.type || '') }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">距离</text>
                <text class="info-value">{{ formatDistance(selectedSpot?.distance || 0) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">评分</text>
                <text class="info-value">⭐ {{ selectedSpot?.rating.toFixed(1) }}</text>
              </view>
            </view>
          </view>
          
          <view class="modal-section">
            <text class="section-title">💧 水域信息</text>
            <view class="info-grid">
              <view class="info-item">
                <text class="info-label">水深</text>
                <text class="info-value">{{ selectedSpot?.depth || '未知' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">水质</text>
                <text class="info-value" :style="{ color: getWaterQualityColor(selectedSpot?.waterQuality) }">
                  {{ getWaterQualityText(selectedSpot?.waterQuality) }}
                </text>
              </view>
              <view class="info-item">
                <text class="info-label">草区/草洞</text>
                <text class="info-value">{{ selectedSpot?.hasGrass ? `有草区，${selectedSpot?.grassHoles}个草洞` : '无草区' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">洄水湾</text>
                <text class="info-value">{{ selectedSpot?.hasBackwater ? '有' : '无' }}</text>
              </view>
            </view>
          </view>
          
          <view class="modal-section">
            <text class="section-title">🐟 鱼情信息</text>
            <view class="tag-grid">
              <text class="tag-item" v-for="fish in selectedSpot?.fishTypes" :key="fish">{{ fish }}</text>
            </view>
          </view>
          
          <view class="modal-section">
            <text class="section-title">🏞️ 环境特点</text>
            <view class="tag-grid">
              <text class="tag-item" v-for="feature in selectedSpot?.environment" :key="feature">{{ feature }}</text>
            </view>
          </view>
          
          <view class="modal-section">
            <text class="section-title">🎯 推荐钓位</text>
            <view class="recommend-box">
              <text class="recommend-text">{{ selectedSpot?.bestPosition || '无特别推荐' }}</text>
            </view>
          </view>
          
          <view class="modal-section">
            <text class="section-title">🏠 配套设施</text>
            <view class="tag-grid">
              <text class="tag-item" v-for="facility in selectedSpot?.facilities" :key="facility">{{ facility }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="footer-btn primary" @click="navigateToSpot">导航前往</view>
          <view class="footer-btn secondary" @click="closeModal">关闭</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { searchFishingSpots, searchFishingSpotsByLocation, getWaterQualityText, getWaterQualityColor } from '@/services/fishingSpotService'
import type { FishingSpot } from '@/types'

const store = useWeatherStore()
const searchKeyword = ref('')
const currentFilter = ref('all')
const isLoading = ref(false)
const showModal = ref(false)
const selectedSpot = ref<FishingSpot | null>(null)

const filteredSpots = computed(() => {
  let spots = store.fishingSpots
  
  if (currentFilter.value === 'recommended') {
    spots = spots.filter(spot => spot.isRecommended)
  } else if (currentFilter.value !== 'all') {
    spots = spots.filter(spot => spot.type === currentFilter.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    spots = spots.filter(spot => 
      spot.name.toLowerCase().includes(keyword) || 
      spot.address.toLowerCase().includes(keyword)
    )
  }
  
  return spots
})

function setFilter(filter: string) {
  currentFilter.value = filter
}

function handleSearch() {
  refreshSpots()
}

function formatDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`
  }
  return `${distance}m`
}

async function refreshSpots() {
  isLoading.value = true
  const city = store.currentLocation || '北京'
  
  if (store.currentLat && store.currentLng) {
    const result = await searchFishingSpotsByLocation(store.currentLat, store.currentLng, 5000)
    if (result.success && result.spots) {
      store.setFishingSpots(result.spots)
      isLoading.value = false
      return
    }
  }
  
  const result = await searchFishingSpots(city, searchKeyword.value || '钓鱼')
  if (result.success && result.spots) {
    store.setFishingSpots(result.spots)
  }
  isLoading.value = false
}

function getTypeText(type: string): string {
  const types: Record<string, string> = {
    river: '河流',
    lake: '湖泊',
    reservoir: '水库',
    sea: '海洋'
  }
  return types[type] || type
}

function showSpotDetail(spot: FishingSpot) {
  selectedSpot.value = spot
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedSpot.value = null
}

function navigateToSpot() {
  uni.showToast({
    title: '导航功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  refreshSpots()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  gap: 16rpx;
  
  .search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 40rpx;
    padding: 0 24rpx;
    
    .search-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
    }
  }
  
  .refresh-btn {
    width: 80rpx;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .refresh-icon {
      font-size: 32rpx;
    }
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
  overflow-x: auto;
  
  .filter-item {
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    background: #f5f5f5;
    margin-right: 16rpx;
    white-space: nowrap;
    
    text {
      font-size: 26rpx;
      color: #666;
    }
    
    &.active {
      background: #1E90FF;
      
      text {
        color: #fff;
      }
    }
  }
}

.spot-list {
  padding: 24rpx;
  
  .spot-card {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    
    .spot-image {
      width: 280rpx;
      height: 220rpx;
    }
    
    .spot-info {
      flex: 1;
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      min-width: 0;
      
      .spot-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8rpx;
        
        .spot-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .spot-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4rpx;
          
          .distance-badge {
            font-size: 22rpx;
            color: #1E90FF;
          }
          
          .recommend-badge {
            font-size: 20rpx;
            color: #388e3c;
            background: #e8f5e9;
            padding: 2rpx 8rpx;
            border-radius: 6rpx;
          }
        }
      }
      
      .spot-address {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 12rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .spot-tags {
        display: flex;
        gap: 8rpx;
        margin-bottom: 12rpx;
        flex-wrap: wrap;
        
        .type-tag {
          padding: 4rpx 12rpx;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 8rpx;
          font-size: 22rpx;
        }
        
        .rating-tag {
          display: flex;
          align-items: center;
          padding: 4rpx 12rpx;
          background: #fff8e1;
          color: #e65100;
          border-radius: 8rpx;
          font-size: 22rpx;
        }
        
        .water-quality-tag {
          padding: 4rpx 12rpx;
          color: #fff;
          border-radius: 8rpx;
          font-size: 22rpx;
        }
      }
      
      .spot-details {
        display: flex;
        gap: 16rpx;
        margin-bottom: 8rpx;
        flex-wrap: wrap;
        
        .detail-item {
          font-size: 22rpx;
          color: #666;
        }
      }
      
      .fish-types {
        display: flex;
        align-items: center;
        
        .fish-label {
          font-size: 22rpx;
          color: #999;
        }
        
        .fish-names {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  .loading-ring {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid rgba(30, 144, 255, 0.2);
    border-top-color: #1E90FF;
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
  }
  
  .loading-text {
    font-size: 26rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  
  .empty-hint {
    font-size: 24rpx;
    color: #bbb;
  }
}

.footer {
  text-align: center;
  padding: 32rpx;
  
  .footer-text {
    font-size: 24rpx;
    color: #999;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  
  .modal-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    color: #999;
  }
}

.modal-body {
  flex: 1;
  padding: 32rpx;
  
  .modal-image {
    width: 100%;
    height: 320rpx;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
  }
  
  .modal-section {
    margin-bottom: 32rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12rpx 20rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        
        .info-label {
          font-size: 26rpx;
          color: #999;
        }
        
        .info-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
    
    .tag-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      
      .tag-item {
        padding: 8rpx 20rpx;
        background: #e3f2fd;
        color: #1976d2;
        border-radius: 20rpx;
        font-size: 24rpx;
      }
    }
    
    .recommend-box {
      background: #fff8e1;
      padding: 20rpx;
      border-radius: 12rpx;
      
      .recommend-text {
        font-size: 26rpx;
        color: #e65100;
      }
    }
  }
}

.modal-footer {
  display: flex;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 20rpx;
  
  .footer-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    
    &.primary {
      background: #1E90FF;
      color: #fff;
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #666;
    }
  }
}
</style>