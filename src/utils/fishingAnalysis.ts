import type { WeatherData, FishingCondition, ForecastDay } from '@/types'

interface WeatherFactors {
  pressure: number
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  weather: string
  dailyTempDiff: number
}

function estimatePressure(weather: string, temperature: number, humidity: number): number {
  if (weather.includes('晴')) {
    return 1010 + Math.random() * 10
  } else if (weather.includes('云') || weather.includes('阴')) {
    return 1000 + Math.random() * 10
  } else if (weather.includes('雨')) {
    return 995 + Math.random() * 5
  }
  return 1000 + Math.random() * 15
}

function getWindBenefit(windDirection: string, windSpeed: number): number {
  const goodWinds = ['北风', '东北风', '西北风']
  const badWinds = ['东风', '东南风', '南风']
  
  if (windSpeed > 20) return 0.5
  if (windSpeed < 2) return -0.3
  
  if (goodWinds.some(w => windDirection.includes(w))) return 0.3
  if (badWinds.some(w => windDirection.includes(w))) return -0.2
  return 0
}

function getTemperatureScore(temp: number): number {
  const fishOptimalRanges = [
    { fish: '鲫鱼', min: 15, max: 25 },
    { fish: '鲤鱼', min: 18, max: 28 },
    { fish: '草鱼', min: 20, max: 30 }
  ]
  
  let score = 0
  for (const fish of fishOptimalRanges) {
    if (temp >= fish.min && temp <= fish.max) {
      score += 0.4
    } else if (Math.abs(temp - (fish.min + fish.max) / 2) < 8) {
      score += 0.2
    }
  }
  return Math.min(score, 1)
}

function getPressureScore(pressure: number): number {
  if (pressure > 1005) return 1
  if (pressure >= 995 && pressure <= 1005) return 0.6
  return 0.2
}

function getTempDiffScore(diff: number): number {
  if (diff < 5) return 1
  if (diff <= 8) return 0.6
  return 0.3
}

function getWeatherTypeScore(weather: string, temp: number): number {
  if (weather.includes('雷') || weather.includes('暴')) return 0.1
  
  if (weather.includes('雨')) {
    return temp >= 18 && temp <= 30 ? 0.8 : 0.5
  }
  
  if (weather.includes('阴')) {
    return 0.9
  }
  
  if (weather.includes('晴')) {
    if (temp >= 10 && temp <= 25) return 0.85
    if (temp > 32) return 0.5
    if (temp < 10) return 0.6
    return 0.8
  }
  
  return 0.7
}

export function analyzeFishingCondition(weather: WeatherData): FishingCondition {
  const pressure = estimatePressure(weather.weather, weather.temperature, weather.humidity)
  const dailyTempDiff = 5 + Math.random() * 5
  
  const factors: WeatherFactors = {
    pressure,
    temperature: weather.temperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    windDirection: weather.windDirection,
    weather: weather.weather,
    dailyTempDiff
  }
  
  return calculateFishingCondition(factors)
}

export function analyzeForecastFishingCondition(forecast: ForecastDay): FishingCondition {
  const pressure = estimatePressure(forecast.dayWeather, (forecast.highTemp + forecast.lowTemp) / 2, 60)
  const dailyTempDiff = forecast.highTemp - forecast.lowTemp
  
  const factors: WeatherFactors = {
    pressure,
    temperature: (forecast.highTemp + forecast.lowTemp) / 2,
    humidity: 60,
    windSpeed: forecast.windSpeed,
    windDirection: forecast.windDirection,
    weather: forecast.dayWeather,
    dailyTempDiff
  }
  
  return calculateFishingCondition(factors)
}

function calculateFishingCondition(factors: WeatherFactors): FishingCondition {
  const pressureScore = getPressureScore(factors.pressure)
  const tempScore = getTemperatureScore(factors.temperature)
  const tempDiffScore = getTempDiffScore(factors.dailyTempDiff)
  const weatherScore = getWeatherTypeScore(factors.weather, factors.temperature)
  const windBenefit = getWindBenefit(factors.windDirection, factors.windSpeed)
  
  const finalScore = (pressureScore * 0.3 + tempScore * 0.25 + tempDiffScore * 0.2 + weatherScore * 0.25) + windBenefit
  const clampedScore = Math.max(0.1, Math.min(1, finalScore))
  
  let level: FishingCondition['level']
  if (clampedScore >= 0.85) level = 'excellent'
  else if (clampedScore >= 0.65) level = 'good'
  else if (clampedScore >= 0.45) level = 'normal'
  else level = 'poor'
  
  const { description, suggestion, bestTime, suitableFish } = generateAnalysis(factors, clampedScore)
  
  return {
    level,
    description,
    suggestion,
    bestTime,
    suitableFish,
    factors: {
      pressure: Math.round(factors.pressure),
      temperature: Math.round(factors.temperature),
      dailyTempDiff: Math.round(factors.dailyTempDiff),
      windDirection: factors.windDirection,
      weather: factors.weather
    }
  }
}

function generateAnalysis(factors: WeatherFactors, score: number): Omit<FishingCondition, 'level'> {
  const { pressure, temperature, dailyTempDiff, windDirection, weather, windSpeed } = factors
  
  let description = ''
  let suggestion = ''
  let bestTime: string[] = []
  let suitableFish: string[] = []
  
  if (weather.includes('雷') || weather.includes('暴')) {
    description = '天气恶劣，不适宜钓鱼'
    suggestion = '雷雨天气危险，禁止出钓，在家休息等待好天气'
    bestTime = []
    suitableFish = []
  } else if (score >= 0.85) {
    description = '今日非常适合钓鱼'
    suggestion = '气压高、溶氧足、水温适宜，鱼儿活性极高，是出钓的黄金时机，建议主攻下风浅滩'
    
    if (pressure > 1005 && dailyTempDiff < 5) {
      bestTime = ['全天', '早晨6-9点', '傍晚16-20点']
    } else {
      bestTime = ['早晨6-9点', '傍晚16-20点']
    }
    
    if (temperature >= 18 && temperature <= 28) {
      suitableFish = ['鲫鱼', '鲤鱼', '草鱼', '鲈鱼', '鳊鱼']
    } else if (temperature < 18) {
      suitableFish = ['鲫鱼', '鲤鱼']
    } else {
      suitableFish = ['草鱼', '鲤鱼', '鲶鱼']
    }
  } else if (score >= 0.65) {
    description = '今日适合钓鱼'
    suggestion = '天气条件较好，可以出钓'
    
    if (pressure < 1000) {
      suggestion += '，注意鱼口可能较轻'
    }
    if (dailyTempDiff > 8) {
      suggestion += '，中午时段鱼口可能较差'
    }
    if (windSpeed > 15) {
      suggestion += '，注意风浪影响抛竿'
    }
    
    if (temperature > 30 || dailyTempDiff > 8) {
      bestTime = ['早晨6-8点', '傍晚18-20点']
    } else {
      bestTime = ['早晨', '傍晚']
    }
    
    suitableFish = temperature >= 20 ? ['鲫鱼', '鲤鱼', '草鱼'] : ['鲫鱼', '鲤鱼']
  } else if (score >= 0.45) {
    description = '今日钓鱼条件一般'
    suggestion = '可以尝试出钓，但需把握时机'
    
    if (pressure < 995) {
      suggestion += '，气压偏低，建议钓浅钓浮'
    }
    if (temperature > 32) {
      suggestion += '，中午高温，只钓早晚'
    }
    if (temperature < 10) {
      suggestion += '，水温较低，选择向阳浅滩'
    }
    
    if (temperature > 32 || temperature < 10) {
      bestTime = ['中午11-14点']
    } else {
      bestTime = ['早晨', '傍晚']
    }
    
    suitableFish = temperature < 15 ? ['鲫鱼'] : ['鲫鱼', '鲤鱼']
  } else {
    description = '今日不适宜钓鱼'
    suggestion = '天气条件较差，鱼口不佳'
    
    if (pressure < 995) {
      suggestion += '，低压缺氧，鱼难开口'
    }
    if (dailyTempDiff > 10) {
      suggestion += '，温差过大，鱼起伏停口'
    }
    
    bestTime = []
    suitableFish = []
  }
  
  if (weather.includes('雨') && !weather.includes('暴')) {
    suggestion += '，雨后1-2小时是黄金时段'
    if (!bestTime.includes('雨后')) bestTime.push('雨后1-2小时')
  }
  
  if (['北风', '东北风', '西北风'].some(w => windDirection.includes(w))) {
    suggestion += '，北风天溶氧高，主攻下风位'
  }
  
  return { description, suggestion, bestTime, suitableFish }
}

export function getLevelColor(level: FishingCondition['level']): string {
  const colors = {
    excellent: '#52c41a',
    good: '#1890ff',
    normal: '#faad14',
    poor: '#ff4d4f'
  }
  return colors[level]
}

export function getLevelText(level: FishingCondition['level']): string {
  const texts = {
    excellent: '极佳',
    good: '适宜',
    normal: '一般',
    poor: '不适宜'
  }
  return texts[level]
}

export function generateFishingStrategy(condition: FishingCondition): {
  position: string
  depth: string
  bait: string
  drift: string
} {
  const { level, factors } = condition
  
  let position = ''
  let depth = ''
  let bait = ''
  let drift = ''
  
  if (level === 'poor') {
    position = '不建议出钓'
    depth = '-'
    bait = '-'
    drift = '-'
  } else {
    if (factors) {
      if (['北风', '东北风', '西北风'].some(w => factors.windDirection?.includes(w))) {
        position = '下风位、入水口、水草区'
      } else if (factors.windDirection?.includes('南')) {
        position = '阴凉处、深水区、背风位'
      } else {
        position = '深浅交界处、水草边缘'
      }
      
      if (factors.temperature && factors.temperature < 15) {
        depth = '1.5-3米，向阳浅滩'
        bait = '腥味饵料，红虫、蚯蚓'
        drift = '调平水或稍钝'
      } else if (factors.temperature && factors.temperature > 30) {
        depth = '3-5米，深水阴凉处'
        bait = '清淡饵料，谷物香、果香'
        drift = '调灵，小钩细线'
      } else {
        depth = '2-4米，深浅交界处'
        bait = '腥香结合，根据目标鱼调整'
        drift = '调4目钓2-3目'
      }
      
      if (factors.weather?.includes('雨')) {
        bait = '偏腥饵料，增加穿透力'
      }
    } else {
      position = '深浅交界处、水草区'
      depth = '2-4米'
      bait = '腥香结合'
      drift = '调4目钓2-3目'
    }
  }
  
  return { position, depth, bait, drift }
}