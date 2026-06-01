export interface WeatherData {
  location: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: string
  windLevel: string
  weather: string
  weatherIcon: string
  uvIndex: number
  visibility: number
  pressure: number
  dewPoint: number
  sunrise: string
  sunset: string
  forecast: ForecastDay[]
}

export interface ForecastDay {
  date: string
  dayWeather: string
  nightWeather: string
  highTemp: number
  lowTemp: number
  windDirection: string
  windSpeed: number
  windLevel: string
}

export interface FishingSpot {
  id: number
  name: string
  address: string
  type: 'river' | 'lake' | 'reservoir' | 'sea'
  rating: number
  fishTypes: string[]
  facilities: string[]
  isRecommended: boolean
  distance: number
  image: string
  depth?: string
  waterQuality?: 'excellent' | 'good' | 'normal' | 'poor'
  environment?: string[]
  hasGrass?: boolean
  grassHoles?: number
  hasBackwater?: boolean
  features?: string[]
  bestPosition?: string
}

export interface FishingCondition {
  level: 'excellent' | 'good' | 'normal' | 'poor'
  description: string
  suggestion: string
  bestTime: string[]
  suitableFish: string[]
  factors?: {
    pressure: number
    temperature: number
    dailyTempDiff: number
    windDirection: string
    weather: string
  }
}

export interface HourlyForecast {
  time: string
  temperature: number
  weather: string
  weatherIcon: string
  precipitation: number
  windSpeed: number
  uvIndex?: number
}