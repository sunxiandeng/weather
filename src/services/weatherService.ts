import type { WeatherData, HourlyForecast } from '@/types'

const AMAP_KEY = 'dfb08caa0d458c58e19ae50c9fce597e'
const isDev = process.env.NODE_ENV === 'development'
const BASE_URL = isDev ? '/api/amap' : 'https://restapi.amap.com'

function isKeyValid(): boolean {
  return !!AMAP_KEY && AMAP_KEY !== 'your_amap_api_key'
}

export interface AmapLocation {
  status: string
  info: string
  infocode: string
  regeocode: {
    formatted_address: string
    addressComponent: {
      city: string
      district: string
      province: string
    }
  }
  position: {
    lat: string
    lng: string
  }
}

export interface AmapWeather {
  status: string
  count: string
  info: string
  infocode: string
  lives: Array<{
    province: string
    city: string
    adcode: string
    weather: string
    temperature: string
    winddirection: string
    windpower: string
    humidity: string
    reporttime: string
  }>
  forecasts: Array<{
    city: string
    adcode: string
    province: string
    reporttime: string
    casts: Array<{
      date: string
      week: string
      dayweather: string
      nightweather: string
      daytemp: string
      nighttemp: string
      daywind: string
      nightwind: string
      daypower: string
      nightpower: string
    }>
  }>
}

export interface AmapGeoCode {
  status: string
  info: string
  infocode: string
  geocodes: Array<{
    formatted_address: string
    province: string
    city: string
    district: string
    adcode: string
  }>
}

const CITY_ADCODE_MAP: Record<string, string> = {
  '北京': '110101',
  '上海': '310101',
  '广州': '440103',
  '深圳': '440303',
  '杭州': '330102',
  '成都': '510104',
  '重庆': '500105',
  '武汉': '420102',
  '西安': '610102',
  '南京': '320102',
  '天津': '120101',
  '苏州': '320505',
  '郑州': '410103',
  '长沙': '430102',
  '青岛': '370202',
  '沈阳': '210102',
  '大连': '210202',
  '宁波': '330203',
  '厦门': '350203',
  '合肥': '340102'
}

export async function getCurrentLocation(): Promise<{ 
  success: boolean 
  message?: string
  lat?: number
  lng?: number 
  address?: string 
  city?: string
}> {
  return new Promise((resolve) => {
    const isH5 = typeof window !== 'undefined'
    
    if (isH5 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('定位成功:', position.coords.latitude, position.coords.longitude)
          try {
            const addressResult = await getAddressByLocation(position.coords.latitude, position.coords.longitude)
            console.log('逆地理编码结果:', addressResult)
            if (addressResult.success) {
              resolve({
                success: true,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: addressResult.address,
                city: addressResult.city
              })
            } else {
              resolve({
                success: true,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: null,
                city: null
              })
            }
          } catch (error) {
            console.error('逆地理编码异常:', error)
            resolve({
              success: true,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: null,
              city: null
            })
          }
        },
        (error) => {
          console.error('浏览器定位失败:', error.message)
          resolve({
            success: false,
            message: error.message || '浏览器定位失败，请手动选择城市'
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      uni.getLocation({
        type: 'gcj02',
        success: async (res) => {
          console.log('uni定位成功:', res.latitude, res.longitude)
          try {
            const addressResult = await getAddressByLocation(res.latitude, res.longitude)
            console.log('逆地理编码结果:', addressResult)
            if (addressResult.success) {
              resolve({
                success: true,
                lat: res.latitude,
                lng: res.longitude,
                address: addressResult.address,
                city: addressResult.city
              })
            } else {
              resolve({
                success: true,
                lat: res.latitude,
                lng: res.longitude,
                address: null,
                city: null
              })
            }
          } catch (error) {
            console.error('逆地理编码异常:', error)
            resolve({
              success: true,
              lat: res.latitude,
              lng: res.longitude,
              address: null,
              city: null
            })
          }
        },
        fail: (err) => {
          console.error('获取位置失败:', err)
          resolve({
            success: false,
            message: err.errMsg || '获取位置失败，请手动选择城市'
          })
        }
      })
    }
  })
}

export async function getAddressByLocation(lat: number, lng: number): Promise<{
  success: boolean
  address?: string
  city?: string
}> {
  if (!isKeyValid()) {
    console.warn('API Key无效')
    return { success: false }
  }
  
  try {
    const url = `${BASE_URL}/v3/geocode/regeo`
    console.log('请求逆地理编码:', url)
    const response = await uni.request({
      url,
      data: {
        location: `${lng},${lat}`,
        key: AMAP_KEY,
        extensions: 'all'
      }
    })
    
    console.log('逆地理编码响应:', response)
    const data: AmapLocation = response.data
    
    if (data.status === '1' && data.regeocode) {
      return {
        success: true,
        address: data.regeocode.formatted_address,
        city: data.regeocode.addressComponent.city || data.regeocode.addressComponent.province
      }
    }
    console.warn('逆地理编码返回状态异常:', data.status, data.info)
    return { success: false }
  } catch (error) {
    console.error('逆地理编码失败:', error)
    return { success: false }
  }
}

export async function getWeatherByCity(city: string): Promise<{
  success: boolean
  weather?: WeatherData
  hourlyData?: HourlyForecast[]
  message?: string
}> {
  if (!isKeyValid()) {
    console.warn('未配置高德地图API Key，使用模拟数据')
    return { success: false, message: '未配置API Key' }
  }
  
  try {
    console.log('获取天气，城市:', city)
    
    let cityCode = city
    
    if (!/^\d{6}$/.test(city)) {
      if (CITY_ADCODE_MAP[city]) {
        cityCode = CITY_ADCODE_MAP[city]
      } else {
        const geoResult = await getAdcodeByCity(city)
        if (geoResult.success && geoResult.adcode) {
          cityCode = geoResult.adcode
        } else {
          return { success: false, message: '无法获取城市编码' }
        }
      }
    }
    
    const url = `${BASE_URL}/v3/weather/weatherInfo`
    console.log('请求天气:', url, '城市编码:', cityCode)
    const response = await uni.request({
      url,
      data: {
        city: cityCode,
        key: AMAP_KEY,
        extensions: 'all'
      }
    })
    
    console.log('天气响应:', response)
    const data: AmapWeather = response.data
    
    if (data.status === '1') {
      let live = null
      let forecastData = []
      
      if (data.forecasts && data.forecasts.length > 0) {
        forecastData = data.forecasts[0].casts || []
      }
      
      if (data.lives && data.lives.length > 0) {
        live = data.lives[0]
      } else if (forecastData.length > 0) {
        const firstCast = forecastData[0]
        const humidity = Math.round(Math.random() * 30 + 40)
        live = {
          province: data.forecasts[0].province,
          city: data.forecasts[0].city,
          adcode: data.forecasts[0].adcode,
          weather: firstCast.dayweather,
          temperature: firstCast.daytemp,
          winddirection: firstCast.daywind || firstCast.nightwind || '东风',
          windpower: firstCast.daypower || '3',
          humidity: humidity.toString(),
          reporttime: data.forecasts[0].reporttime
        }
      }
      
      if (live) {
        if (!forecastData || forecastData.length === 0) {
          forecastData = data.forecasts && data.forecasts.length > 0 ? data.forecasts[0].casts : []
        }
        
        const temp = parseInt(live.temperature) || 25
        const hum = parseInt(live.humidity) || 50
        const windPower = parseWindPower(live.windpower) || 3
        const windSpeedKm = windPower * 3.6
        
        const feelsLike = calculateFeelsLike(temp, hum, windSpeedKm)
        
        const weatherData: WeatherData = {
          location: live.city || city,
          temperature: temp,
          feelsLike,
          humidity: hum,
          windSpeed: windSpeedKm,
          windDirection: live.winddirection || '东风',
          windLevel: getWindLevel(windSpeedKm / 3.6),
          weather: live.weather || '晴',
          weatherIcon: getWeatherIcon(live.weather || '晴'),
          uvIndex: estimateUvIndex(live.weather || '晴'),
          visibility: 10,
          pressure: 1013,
          dewPoint: Math.round(temp - (100 - hum) / 5),
          sunrise: '05:30',
          sunset: '19:30',
          forecast: forecastData.slice(0, 5).map((cast, index) => {
            const dayPower = cast.daypower || cast.nightpower || '3'
            const dayWindPower = parseWindPower(dayPower) || 3
            const dateStr = cast.date
            const date = new Date(dateStr)
            const month = date.getMonth() + 1
            const day = date.getDate()
            const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
            
            let dateLabel = ''
            if (index === 0) {
              dateLabel = '今天'
            } else if (index === 1) {
              dateLabel = '明天'
            } else if (index === 2) {
              dateLabel = '后天'
            } else {
              dateLabel = `${month}/${day}`
            }
            
            return {
              date: dateLabel,
              dayWeather: cast.dayweather,
              nightWeather: cast.nightweather,
              highTemp: parseInt(cast.daytemp),
              lowTemp: parseInt(cast.nighttemp),
              windDirection: cast.daywind || cast.nightwind || '东风',
              windSpeed: dayWindPower * 3.6,
              windLevel: getWindLevel(dayWindPower)
            }
          })
        }
        
        return {
          success: true,
          weather: weatherData,
          hourlyData: generateHourlyData(weatherData)
        }
      }
    }
    
    console.warn('天气返回状态异常:', data.status, data.info)
    return { success: false, message: '获取天气数据失败' }
  } catch (error) {
    console.error('获取天气失败:', error)
    return { success: false, message: '获取天气数据失败' }
  }
}

async function getAdcodeByCity(city: string): Promise<{
  success: boolean
  adcode?: string
}> {
  try {
    const url = `${BASE_URL}/v3/geocode/geo`
    console.log('请求地理编码:', url, city)
    const response = await uni.request({
      url,
      data: {
        address: city,
        key: AMAP_KEY
      }
    })
    
    console.log('地理编码响应:', response)
    const data: AmapGeoCode = response.data
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      return {
        success: true,
        adcode: data.geocodes[0].adcode
      }
    }
    console.warn('地理编码返回状态异常:', data.status, data.info)
    return { success: false }
  } catch (error) {
    console.error('地理编码失败:', error)
    return { success: false }
  }
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return 'sunny'
  if (weather.includes('云')) return 'cloudy'
  if (weather.includes('阴')) return 'overcast'
  if (weather.includes('雨')) return 'rainy'
  if (weather.includes('雪')) return 'snowy'
  if (weather.includes('雷')) return 'thunder'
  return 'sunny'
}

function generateHourlyData(weather: WeatherData): HourlyForecast[] {
  const hourlyData: HourlyForecast[] = []
  const baseTemp = weather.temperature
  const weatherDesc = weather.weather
  
  const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
  const temps = [baseTemp - 5, baseTemp - 2, baseTemp + 2, baseTemp + 3, baseTemp, baseTemp - 3]
  
  times.forEach((time, index) => {
    hourlyData.push({
      time,
      temperature: temps[index],
      weather: index < 3 ? weatherDesc : (index === 5 ? '阴' : weatherDesc),
      weatherIcon: getWeatherIcon(weatherDesc),
      precipitation: weatherDesc.includes('雨') ? 20 : 0,
      windSpeed: weather.windSpeed
    })
  })
  
  return hourlyData
}

function calculateFeelsLike(temp: number, humidity: number, windSpeed: number): number {
  let feelsLike = temp
  
  if (temp >= 25) {
    feelsLike = temp + (humidity - 50) * 0.1 + (windSpeed < 5 ? 2 : 0)
  } else if (temp < 15) {
    feelsLike = temp - windSpeed * 0.1
  }
  
  return Math.round(feelsLike)
}

function getWindLevel(windPower: number): string {
  const levels = [
    { min: 0, max: 0.2, level: '0级' },
    { min: 0.3, max: 1.5, level: '1级' },
    { min: 1.6, max: 3.3, level: '2级' },
    { min: 3.4, max: 5.4, level: '3级' },
    { min: 5.5, max: 7.9, level: '4级' },
    { min: 8.0, max: 10.7, level: '5级' },
    { min: 10.8, max: 13.8, level: '6级' },
    { min: 13.9, max: 17.1, level: '7级' },
    { min: 17.2, max: 20.7, level: '8级' },
    { min: 20.8, max: 24.4, level: '9级' },
    { min: 24.5, max: 28.4, level: '10级' },
    { min: 28.5, max: 32.6, level: '11级' },
    { min: 32.7, max: 100, level: '12级' }
  ]
  
  for (const item of levels) {
    if (windPower >= item.min && windPower <= item.max) {
      return item.level
    }
  }
  return '微风'
}

function estimateUvIndex(weather: string): number {
  if (weather.includes('晴')) return 6
  if (weather.includes('云')) return 4
  if (weather.includes('阴')) return 2
  if (weather.includes('雨')) return 1
  return 3
}

function parseWindPower(windPower: string): number | null {
  if (!windPower) return null
  const match = windPower.match(/(\d+)-(\d+)/)
  if (match) {
    return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
  }
  const num = parseInt(windPower)
  return isNaN(num) ? null : num
}