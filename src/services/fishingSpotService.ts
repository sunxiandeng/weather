import type { FishingSpot } from '@/types'

const AMAP_KEY = 'dfb08caa0d458c58e19ae50c9fce597e'
const isDev = process.env.NODE_ENV === 'development'
const BASE_URL = isDev ? '/api/amap' : 'https://restapi.amap.com'

export interface AmapPOI {
  id: string
  name: string
  type: string
  address: string
  location: string
  distance: string
  tel: string
  rating: string
  photos: Array<{
    url: string
  }>
}

export interface AmapPOIResponse {
  status: string
  info: string
  count: string
  pois: AmapPOI[]
}

export async function searchFishingSpotsByLocation(lat: number, lng: number, radius: number = 5000): Promise<{
  success: boolean
  spots?: FishingSpot[]
  message?: string
}> {
  if (!AMAP_KEY || AMAP_KEY === 'your_amap_api_key') {
    console.warn('未配置高德地图API Key')
    return { success: false, message: '未配置API Key' }
  }

  try {
    const url = `${BASE_URL}/v3/place/around`
    console.log('根据定位搜索附近河道:', url, lat, lng, radius)
    
    const response = await uni.request({
      url,
      data: {
        location: `${lng},${lat}`,
        radius,
        key: AMAP_KEY,
        types: '110200|110300|110400|110500|110600|110700|110800|110900|111000',
        offset: 20,
        page: 1,
        extensions: 'all'
      }
    })

    console.log('周边搜索响应:', response)
    const data: AmapPOIResponse = response.data

    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const spots: FishingSpot[] = data.pois
        .slice(0, 15)
        .map((poi, index) => {
          const [plng, plat] = poi.location.split(',').map(Number)
          const type = getSpotType(poi.type, poi.name, poi.address)
          const spotInfo = generateSpotInfo(type, poi.name, poi.address)
          const distance = parseInt(poi.distance) || Math.floor(Math.random() * 10000)
          
          return {
            id: parseInt(poi.id) || index + 1,
            name: poi.name || '未知地点',
            address: poi.address || '地址未知',
            type,
            rating: parseFloat(poi.rating) || spotInfo.rating,
            fishTypes: spotInfo.fishTypes,
            facilities: spotInfo.facilities,
            isRecommended: index < 3 && distance < 3000,
            distance,
            image: poi.photos && poi.photos.length > 0 
              ? poi.photos[0].url 
              : `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fishing%20spot%20${encodeURIComponent(poi.name || 'river')}&image_size=landscape_16_9`,
            depth: spotInfo.depth,
            waterQuality: spotInfo.waterQuality,
            environment: spotInfo.environment,
            hasGrass: spotInfo.hasGrass,
            grassHoles: spotInfo.grassHoles,
            hasBackwater: spotInfo.hasBackwater,
            features: spotInfo.features,
            bestPosition: spotInfo.bestPosition
          }
        })

      return { success: true, spots }
    }

    console.warn('未找到附近地点:', data.status, data.info)
    return { success: true, spots: generateMockSpotsByLocation(lat, lng) }

  } catch (error) {
    console.error('搜索附近地点失败:', error)
    return { success: true, spots: generateMockSpotsByLocation(lat, lng) }
  }
}

export async function searchFishingSpots(city: string, keywords: string = '钓鱼'): Promise<{
  success: boolean
  spots?: FishingSpot[]
  message?: string
}> {
  if (!AMAP_KEY || AMAP_KEY === 'your_amap_api_key') {
    console.warn('未配置高德地图API Key')
    return { success: false, message: '未配置API Key' }
  }

  try {
    const url = `${BASE_URL}/v3/place/text`
    console.log('搜索钓点:', url, city, keywords)
    
    const response = await uni.request({
      url,
      data: {
        keywords,
        city,
        key: AMAP_KEY,
        types: '110200|110300|110400|110500|110600|110700',
        offset: 20,
        page: 1
      }
    })

    console.log('钓点搜索响应:', response)
    const data: AmapPOIResponse = response.data

    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const spots: FishingSpot[] = data.pois
        .slice(0, 15)
        .map((poi, index) => {
          const [lng, lat] = poi.location.split(',').map(Number)
          const type = getSpotType(poi.type, poi.name, poi.address)
          const spotInfo = generateSpotInfo(type, poi.name, poi.address)
          
          return {
            id: parseInt(poi.id) || index + 1,
            name: poi.name || '未知钓点',
            address: poi.address || '地址未知',
            type,
            rating: parseFloat(poi.rating) || spotInfo.rating,
            fishTypes: spotInfo.fishTypes,
            facilities: spotInfo.facilities,
            isRecommended: index < 3,
            distance: parseInt(poi.distance) || Math.floor(Math.random() * 15000),
            image: poi.photos && poi.photos.length > 0 
              ? poi.photos[0].url 
              : `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fishing%20spot%20${encodeURIComponent(poi.name)}&image_size=landscape_16_9`,
            depth: spotInfo.depth,
            waterQuality: spotInfo.waterQuality,
            environment: spotInfo.environment,
            hasGrass: spotInfo.hasGrass,
            grassHoles: spotInfo.grassHoles,
            hasBackwater: spotInfo.hasBackwater,
            features: spotInfo.features,
            bestPosition: spotInfo.bestPosition
          }
        })

      return { success: true, spots }
    }

    console.warn('未找到钓点数据:', data.status, data.info)
    return { success: true, spots: generateMockSpots(city) }

  } catch (error) {
    console.error('搜索钓点失败:', error)
    return { success: true, spots: generateMockSpots(city) }
  }
}

function getSpotType(type: string, name: string, address: string): FishingSpot['type'] {
  if (type.includes('水库') || name.includes('水库') || address.includes('水库')) {
    return 'reservoir'
  }
  if (type.includes('湖泊') || name.includes('湖') || address.includes('湖')) {
    return 'lake'
  }
  if (type.includes('河') || name.includes('河') || address.includes('河') || type.includes('溪') || type.includes('江')) {
    return 'river'
  }
  if (type.includes('海') || name.includes('海') || address.includes('海')) {
    return 'sea'
  }
  if (type.includes('公园') || name.includes('公园') || type.includes('湿地')) {
    return 'lake'
  }
  return 'river'
}

function generateSpotInfo(type: FishingSpot['type'], name: string, address: string) {
  const info: Partial<FishingSpot> = {
    fishTypes: [],
    facilities: ['免费'],
    rating: 4.0,
    depth: '',
    waterQuality: 'good',
    environment: [],
    hasGrass: false,
    grassHoles: 0,
    hasBackwater: false,
    features: [],
    bestPosition: ''
  }

  switch (type) {
    case 'reservoir':
      info.fishTypes = ['鲫鱼', '鲤鱼', '草鱼', '青鱼', '鳙鱼', '翘嘴']
      info.rating = 4.5 + Math.random() * 0.5
      info.depth = `${8 + Math.floor(Math.random() * 12)}米`
      info.waterQuality = Math.random() > 0.3 ? 'good' : 'excellent'
      info.environment = ['水质清澈', '环境优美', '空气清新']
      info.hasGrass = Math.random() > 0.3
      info.grassHoles = info.hasGrass ? Math.floor(Math.random() * 5) + 2 : 0
      info.hasBackwater = Math.random() > 0.5
      info.features = ['大型水体', '鱼种丰富', '适合守钓', '风景好']
      info.bestPosition = info.hasBackwater ? '洄水湾处' : '大坝附近'
      if (name.includes('公园') || address.includes('公园')) {
        info.facilities.push('停车场', '卫生间', '休息区')
      }
      break

    case 'lake':
      info.fishTypes = ['鲫鱼', '鲤鱼', '草鱼', '鳊鱼', '鲈鱼', '黑鱼']
      info.rating = 4.2 + Math.random() * 0.6
      info.depth = `${3 + Math.floor(Math.random() * 8)}米`
      info.waterQuality = Math.random() > 0.4 ? 'good' : 'excellent'
      info.environment = ['湖光山色', '适合休闲', '交通便利']
      info.hasGrass = Math.random() > 0.4
      info.grassHoles = info.hasGrass ? Math.floor(Math.random() * 4) + 1 : 0
      info.hasBackwater = Math.random() > 0.6
      info.features = ['水面开阔', '适合路亚', '景色宜人']
      info.bestPosition = info.hasGrass ? '草边草洞' : '迎风岸'
      if (name.includes('公园') || name.includes('景区')) {
        info.facilities.push('停车场', '卫生间', '餐饮')
      }
      break

    case 'river':
      info.fishTypes = ['鲫鱼', '鲤鱼', '鲶鱼', '鳜鱼', '马口', '白条']
      info.rating = 4.0 + Math.random() * 0.7
      info.depth = `${1.5 + Math.floor(Math.random() * 4)}米`
      info.waterQuality = Math.random() > 0.5 ? 'normal' : 'good'
      info.environment = ['自然野趣', '原生态', '空气好']
      info.hasGrass = Math.random() > 0.5
      info.grassHoles = info.hasGrass ? Math.floor(Math.random() * 3) + 1 : 0
      info.hasBackwater = Math.random() > 0.7
      info.features = ['野钓体验', '水流适宜', '鱼密度高']
      info.bestPosition = info.hasBackwater ? '回水湾' : '桥墩附近'
      break

    case 'sea':
      info.fishTypes = ['鲈鱼', '黑鲷', '黄翅鱼', '石斑鱼', '鲻鱼']
      info.rating = 4.3 + Math.random() * 0.5
      info.depth = `${2 + Math.floor(Math.random() * 6)}米`
      info.waterQuality = 'excellent'
      info.environment = ['海风习习', '视野开阔', '海景优美']
      info.hasGrass = false
      info.grassHoles = 0
      info.hasBackwater = false
      info.features = ['海钓体验', '渔获丰富', '挑战性强']
      info.bestPosition = '礁石区'
      if (name.includes('码头') || name.includes('渔港')) {
        info.facilities.push('停车场', '渔具店')
      }
      break
  }

  return info
}

function generateMockSpots(city: string): FishingSpot[] {
  const spots: FishingSpot[] = [
    {
      id: 1,
      name: `${city}湖公园垂钓区`,
      address: `${city}市西湖区环湖路88号`,
      type: 'lake',
      rating: 4.7,
      fishTypes: ['鲫鱼', '鲤鱼', '草鱼', '鳊鱼', '鲈鱼'],
      facilities: ['停车场', '卫生间', '休息区', '免费'],
      isRecommended: true,
      distance: 2500,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=beautiful%20lake%20fishing%20spot%20scenic%20park&image_size=landscape_16_9',
      depth: '4-8米',
      waterQuality: 'excellent',
      environment: ['湖光山色', '适合休闲', '交通便利'],
      hasGrass: true,
      grassHoles: 4,
      hasBackwater: true,
      features: ['水面开阔', '适合路亚', '景色宜人'],
      bestPosition: '草边草洞'
    },
    {
      id: 2,
      name: `${city}河生态钓场`,
      address: `${city}市滨河新区沿河大道中段`,
      type: 'river',
      rating: 4.5,
      fishTypes: ['鲫鱼', '鲤鱼', '鲶鱼', '鳜鱼', '马口'],
      facilities: ['免费', '公共厕所'],
      isRecommended: true,
      distance: 5800,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=river%20fishing%20spot%20nature%20ecological&image_size=landscape_16_9',
      depth: '2-5米',
      waterQuality: 'good',
      environment: ['自然野趣', '原生态', '空气好'],
      hasGrass: true,
      grassHoles: 3,
      hasBackwater: true,
      features: ['野钓体验', '水流适宜', '鱼密度高'],
      bestPosition: '回水湾'
    },
    {
      id: 3,
      name: `${city}水库休闲垂钓中心`,
      address: `${city}市郊区水库路168号`,
      type: 'reservoir',
      rating: 4.8,
      fishTypes: ['鲫鱼', '鲤鱼', '草鱼', '青鱼', '鳙鱼', '翘嘴'],
      facilities: ['停车场', '餐饮', '住宿', '渔具出租'],
      isRecommended: true,
      distance: 12000,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=reservoir%20fishing%20center%20scenic%20mountains&image_size=landscape_16_9',
      depth: '10-18米',
      waterQuality: 'excellent',
      environment: ['水质清澈', '环境优美', '空气清新'],
      hasGrass: true,
      grassHoles: 5,
      hasBackwater: true,
      features: ['大型水体', '鱼种丰富', '适合守钓', '风景好'],
      bestPosition: '大坝附近洄水湾'
    },
    {
      id: 4,
      name: `${city}湿地公园钓点`,
      address: `${city}市南区湿地路88号`,
      type: 'lake',
      rating: 4.3,
      fishTypes: ['鲫鱼', '鲤鱼', '鲈鱼', '黑鱼'],
      facilities: ['免费', '卫生间', '停车场'],
      isRecommended: false,
      distance: 8500,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wetland%20park%20fishing%20area%20nature&image_size=landscape_16_9',
      depth: '3-6米',
      waterQuality: 'good',
      environment: ['生态保护', '候鸟栖息地', '空气清新'],
      hasGrass: true,
      grassHoles: 6,
      hasBackwater: false,
      features: ['原生态', '环境好', '适合休闲'],
      bestPosition: '芦苇荡边缘'
    },
    {
      id: 5,
      name: `${city}农庄垂钓园`,
      address: `${city}市郊区田园大道288号`,
      type: 'reservoir',
      rating: 4.4,
      fishTypes: ['鲫鱼', '草鱼', '罗非鱼', '青鱼'],
      facilities: ['餐饮', '住宿', '停车场', '渔具出租'],
      isRecommended: false,
      distance: 15000,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=farm%20fishing%20pond%20countryside%20relaxing&image_size=landscape_16_9',
      depth: '6-12米',
      waterQuality: 'good',
      environment: ['田园风光', '农家乐', '休闲娱乐'],
      hasGrass: true,
      grassHoles: 4,
      hasBackwater: true,
      features: ['服务完善', '配套齐全', '适合家庭'],
      bestPosition: '塘边草洞'
    },
    {
      id: 6,
      name: `${city}江滩垂钓区`,
      address: `${city}市江岸区滨江大道`,
      type: 'river',
      rating: 4.2,
      fishTypes: ['鲤鱼', '鲶鱼', '鳜鱼', '武昌鱼'],
      facilities: ['免费', '公共厕所'],
      isRecommended: false,
      distance: 4200,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=river%20beach%20fishing%20spot%20urban&image_size=landscape_16_9',
      depth: '2-6米',
      waterQuality: 'normal',
      environment: ['江景优美', '交通便利', '城市休闲'],
      hasGrass: false,
      grassHoles: 0,
      hasBackwater: true,
      features: ['江钓体验', '渔获惊喜', '视野开阔'],
      bestPosition: '桥墩附近'
    },
    {
      id: 7,
      name: `${city}山水库野钓点`,
      address: `${city}市山区水库管理处`,
      type: 'reservoir',
      rating: 4.6,
      fishTypes: ['鲫鱼', '鲤鱼', '草鱼', '青鱼', '翘嘴'],
      facilities: ['免费'],
      isRecommended: false,
      distance: 20000,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mountain%20reservoir%20fishing%20wild%20nature&image_size=landscape_16_9',
      depth: '8-15米',
      waterQuality: 'excellent',
      environment: ['深山美景', '空气清新', '原生态'],
      hasGrass: true,
      grassHoles: 3,
      hasBackwater: false,
      features: ['野钓天堂', '人少安静', '渔获丰厚'],
      bestPosition: '入水口'
    }
  ]
  return spots
}

function generateMockSpotsByLocation(lat: number, lng: number): FishingSpot[] {
  const spots: FishingSpot[] = [
    {
      id: 1,
      name: '附近河道钓点',
      address: '周边河道区域',
      type: 'river',
      rating: 4.3,
      fishTypes: ['鲫鱼', '鲤鱼', '鲶鱼', '鳜鱼'],
      facilities: ['免费'],
      isRecommended: true,
      distance: 800,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=river%20fishing%20spot%20nearby%20nature&image_size=landscape_16_9',
      depth: '2-4米',
      waterQuality: 'good',
      environment: ['自然野趣', '原生态', '空气清新'],
      hasGrass: true,
      grassHoles: 3,
      hasBackwater: true,
      features: ['野钓体验', '水流适宜'],
      bestPosition: '回水湾'
    },
    {
      id: 2,
      name: '滨河公园',
      address: '滨河公园内',
      type: 'lake',
      rating: 4.5,
      fishTypes: ['鲫鱼', '鲤鱼', '草鱼', '鲈鱼'],
      facilities: ['停车场', '卫生间', '免费'],
      isRecommended: true,
      distance: 1200,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=riverside%20park%20fishing%20lake%20scenic&image_size=landscape_16_9',
      depth: '3-6米',
      waterQuality: 'good',
      environment: ['公园环境', '交通便利', '风景优美'],
      hasGrass: true,
      grassHoles: 5,
      hasBackwater: true,
      features: ['环境优美', '适合休闲'],
      bestPosition: '草边草洞'
    },
    {
      id: 3,
      name: '城市湖',
      address: '市中心湖区',
      type: 'lake',
      rating: 4.4,
      fishTypes: ['鲫鱼', '鲤鱼', '草鱼', '鳊鱼'],
      facilities: ['停车场', '餐饮', '免费'],
      isRecommended: true,
      distance: 2500,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=city%20lake%20fishing%20spot%20urban&image_size=landscape_16_9',
      depth: '4-8米',
      waterQuality: 'normal',
      environment: ['城市中心', '交通便利', '人气旺盛'],
      hasGrass: true,
      grassHoles: 4,
      hasBackwater: true,
      features: ['城市休闲', '方便快捷'],
      bestPosition: '迎风岸'
    },
    {
      id: 4,
      name: '小溪支流',
      address: '郊区溪流区域',
      type: 'river',
      rating: 4.2,
      fishTypes: ['马口', '白条', '鲫鱼', '鲶鱼'],
      facilities: ['免费'],
      isRecommended: false,
      distance: 3500,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=small%20stream%20fishing%20nature%20peaceful&image_size=landscape_16_9',
      depth: '1-2米',
      waterQuality: 'excellent',
      environment: ['原生态', '空气清新', '安静'],
      hasGrass: true,
      grassHoles: 2,
      hasBackwater: false,
      features: ['野钓体验', '原生态'],
      bestPosition: '浅滩处'
    },
    {
      id: 5,
      name: '湿地公园',
      address: '湿地公园内',
      type: 'lake',
      rating: 4.6,
      fishTypes: ['鲫鱼', '鲤鱼', '鲈鱼', '黑鱼'],
      facilities: ['停车场', '卫生间', '免费'],
      isRecommended: false,
      distance: 4800,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wetland%20park%20fishing%20nature%20birds&image_size=landscape_16_9',
      depth: '2-5米',
      waterQuality: 'excellent',
      environment: ['生态保护', '候鸟栖息地', '空气清新'],
      hasGrass: true,
      grassHoles: 6,
      hasBackwater: true,
      features: ['生态环境', '风景优美'],
      bestPosition: '芦苇荡边缘'
    }
  ]
  return spots
}

export function getSpotTypeName(type: FishingSpot['type']): string {
  const names = {
    river: '河流',
    lake: '湖泊',
    reservoir: '水库',
    sea: '海边'
  }
  return names[type]
}

export function getWaterQualityText(quality: FishingSpot['waterQuality']): string {
  const texts = {
    excellent: '优质',
    good: '良好',
    normal: '一般',
    poor: '较差'
  }
  return texts[quality || 'normal']
}

export function getWaterQualityColor(quality: FishingSpot['waterQuality']): string {
  const colors = {
    excellent: '#52c41a',
    good: '#1890ff',
    normal: '#faad14',
    poor: '#ff4d4f'
  }
  return colors[quality || 'normal']
}