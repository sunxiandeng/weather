import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeatherData, HourlyForecast, FishingSpot, FishingCondition } from '@/types'
import { mockWeatherData, mockHourlyData, mockFishingSpots } from '@/data/weatherData'
import { analyzeFishingCondition } from '@/utils/fishingAnalysis'
import { getCurrentLocation, getWeatherByCity } from '@/services/weatherService'

export const useWeatherStore = defineStore('weather', () => {
  const weather = ref<WeatherData>(mockWeatherData)
  const hourlyData = ref<HourlyForecast[]>(mockHourlyData)
  const fishingSpots = ref<FishingSpot[]>(mockFishingSpots)
  const currentLocation = ref('北京')
  const currentLat = ref<number | null>(null)
  const currentLng = ref<number | null>(null)
  const isLoading = ref(false)
  const hasRealData = ref(false)
  const locationError = ref<string | null>(null)

  const fishingCondition = computed<FishingCondition>(() => {
    return analyzeFishingCondition(weather.value)
  })

  const recommendedSpots = computed(() => {
    return fishingSpots.value.filter(spot => spot.isRecommended)
  })

  async function fetchWeather(): Promise<{ success: boolean }> {
    isLoading.value = true
    locationError.value = null

    try {
      const locationResult = await getCurrentLocation()
      
      if (locationResult.success) {
        if (locationResult.lat && locationResult.lng) {
          currentLat.value = locationResult.lat
          currentLng.value = locationResult.lng
        }
        if (locationResult.city) {
          currentLocation.value = locationResult.city
          
          const weatherResult = await getWeatherByCity(locationResult.city)
          
          if (weatherResult.success && weatherResult.weather) {
            weather.value = weatherResult.weather
            hourlyData.value = weatherResult.hourlyData || mockHourlyData
            hasRealData.value = true
            isLoading.value = false
            return { success: true }
          } else {
            console.warn('获取真实天气失败，使用模拟数据:', weatherResult.message)
            locationError.value = '获取天气失败，请手动选择城市'
          }
        } else {
          console.warn('获取城市名失败，需要手动选择')
          locationError.value = '无法获取城市名，请手动选择城市'
        }
      } else {
        console.warn('获取位置失败，使用模拟数据:', locationResult.message)
        locationError.value = locationResult.message || '获取位置失败，请手动选择城市'
      }
    } catch (error) {
      console.error('获取天气数据异常:', error)
      locationError.value = '获取天气数据异常'
    }
    
    isLoading.value = false
    return { success: false }
  }

  async function fetchWeatherByCity(city: string): Promise<{ success: boolean }> {
    isLoading.value = true
    locationError.value = null

    try {
      const weatherResult = await getWeatherByCity(city)
      
      if (weatherResult.success && weatherResult.weather) {
        weather.value = weatherResult.weather
        hourlyData.value = weatherResult.hourlyData || mockHourlyData
        hasRealData.value = true
        currentLocation.value = weatherResult.weather.location || city
        isLoading.value = false
        return { success: true }
      } else {
        console.warn('获取天气失败:', weatherResult.message)
        locationError.value = weatherResult.message || '获取天气失败，请尝试其他城市'
      }
    } catch (error) {
      console.error('获取天气异常:', error)
      locationError.value = '获取天气异常'
    }
    
    isLoading.value = false
    return { success: false }
  }

  async function getLocation(): Promise<{ success: boolean }> {
    isLoading.value = true
    locationError.value = null

    try {
      const result = await getCurrentLocation()
      
      if (result.success && result.city) {
        currentLocation.value = result.city
        isLoading.value = false
        return { success: true }
      } else {
        console.warn('获取位置失败:', result.message)
        locationError.value = result.message || '获取位置失败'
      }
    } catch (error) {
      console.error('获取位置异常:', error)
      locationError.value = '获取位置异常'
    }
    
    isLoading.value = false
    return { success: false }
  }

  async function refreshWithRealData(): Promise<{ success: boolean }> {
    return await fetchWeather()
  }

  function selectLocation(location: string) {
    currentLocation.value = location
  }

  function setFishingSpots(spots: FishingSpot[]) {
    fishingSpots.value = spots
  }

  return {
    weather,
    hourlyData,
    fishingSpots,
    currentLocation,
    currentLat,
    currentLng,
    isLoading,
    hasRealData,
    locationError,
    fishingCondition,
    recommendedSpots,
    fetchWeather,
    fetchWeatherByCity,
    getLocation,
    refreshWithRealData,
    selectLocation,
    setFishingSpots
  }
})