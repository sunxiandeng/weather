import type { WeatherData, HourlyForecast, FishingSpot } from '@/types'

export const mockWeatherData: WeatherData = {
  location: '北京市朝阳区',
  temperature: 26,
  feelsLike: 28,
  humidity: 65,
  windSpeed: 12,
  windDirection: '东南风',
  windLevel: '3级',
  weather: '晴转多云',
  weatherIcon: 'sunny',
  uvIndex: 6,
  visibility: 10,
  pressure: 1013,
  dewPoint: 18,
  sunrise: '05:23',
  sunset: '19:45',
  forecast: [
    { date: '今天', dayWeather: '晴', nightWeather: '多云', highTemp: 28, lowTemp: 18, windDirection: '东南风', windSpeed: 12, windLevel: '3级' },
    { date: '明天', dayWeather: '多云', nightWeather: '阴', highTemp: 26, lowTemp: 17, windDirection: '南风', windSpeed: 8, windLevel: '2级' },
    { date: '后天', dayWeather: '阴', nightWeather: '小雨', highTemp: 24, lowTemp: 16, windDirection: '西南风', windSpeed: 10, windLevel: '3级' },
    { date: '周四', dayWeather: '小雨', nightWeather: '晴', highTemp: 23, lowTemp: 15, windDirection: '北风', windSpeed: 15, windLevel: '4级' },
    { date: '周五', dayWeather: '晴', nightWeather: '晴', highTemp: 25, lowTemp: 16, windDirection: '东北风', windSpeed: 10, windLevel: '3级' }
  ]
}

export const mockHourlyData: HourlyForecast[] = [
  { time: '现在', temperature: 24, weather: '晴', weatherIcon: 'sunny', precipitation: 0, windSpeed: 10, uvIndex: 4 },
  { time: '16:00', temperature: 26, weather: '晴', weatherIcon: 'sunny', precipitation: 0, windSpeed: 12, uvIndex: 6 },
  { time: '17:00', temperature: 26, weather: '多云', weatherIcon: 'cloudy', precipitation: 0, windSpeed: 10, uvIndex: 5 },
  { time: '18:00', temperature: 25, weather: '多云', weatherIcon: 'cloudy', precipitation: 80, windSpeed: 8, uvIndex: 3 },
  { time: '19:00', temperature: 26, weather: '阴', weatherIcon: 'overcast', precipitation: 70, windSpeed: 8, uvIndex: 1 },
  { time: '20:00', temperature: 25, weather: '阴', weatherIcon: 'overcast', precipitation: 70, windSpeed: 6, uvIndex: 0 },
  { time: '21:00', temperature: 24, weather: '小雨', weatherIcon: 'rainy', precipitation: 60, windSpeed: 6, uvIndex: 0 },
  { time: '22:00', temperature: 24, weather: '小雨', weatherIcon: 'rainy', precipitation: 60, windSpeed: 5, uvIndex: 0 },
  { time: '23:00', temperature: 23, weather: '小雨', weatherIcon: 'rainy', precipitation: 40, windSpeed: 5, uvIndex: 0 }
]

export const mockFishingSpots: FishingSpot[] = [
  {
    id: 1,
    name: '清河垂钓园',
    address: '朝阳区清河北岸',
    type: 'river',
    rating: 4.8,
    fishTypes: ['鲫鱼', '鲤鱼', '草鱼'],
    facilities: ['停车场', '洗手间', '休息区'],
    isRecommended: true,
    distance: 2.5,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fishing%20spot%20by%20river%20with%20beautiful%20scenery&image_size=landscape_16_9'
  },
  {
    id: 2,
    name: '雁栖湖钓场',
    address: '怀柔区雁栖湖景区',
    type: 'lake',
    rating: 4.6,
    fishTypes: ['鲈鱼', '鳜鱼', '鲫鱼'],
    facilities: ['停车场', '餐饮', '渔具店'],
    isRecommended: true,
    distance: 35.2,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20lake%20fishing%20spot%20with%20mountains&image_size=landscape_16_9'
  },
  {
    id: 3,
    name: '十三陵水库',
    address: '昌平区十三陵镇',
    type: 'reservoir',
    rating: 4.9,
    fishTypes: ['鲤鱼', '草鱼', '鲢鱼', '鳙鱼'],
    facilities: ['停车场', '露营区', '洗手间'],
    isRecommended: true,
    distance: 42.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20reservoir%20fishing%20area%20scenic&image_size=landscape_16_9'
  },
  {
    id: 4,
    name: '潮白河野钓点',
    address: '通州区潮白河畔',
    type: 'river',
    rating: 4.2,
    fishTypes: ['鲫鱼', '白条', '鲶鱼'],
    facilities: [],
    isRecommended: false,
    distance: 28.5,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wild%20river%20fishing%20spot%20natural&image_size=landscape_16_9'
  },
  {
    id: 5,
    name: '金海湖垂钓中心',
    address: '平谷区金海湖镇',
    type: 'lake',
    rating: 4.7,
    fishTypes: ['鲤鱼', '草鱼', '鳊鱼'],
    facilities: ['停车场', '餐饮', '住宿', '渔具租赁'],
    isRecommended: true,
    distance: 78.3,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lake%20fishing%20center%20with%20facilities&image_size=landscape_16_9'
  }
]