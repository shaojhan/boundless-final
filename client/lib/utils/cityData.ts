import CityCountyData from '@/data/CityCountyData.json'

/** 台灣縣市名稱列表（已排除釣魚臺、南海島） */
export const cityData: string[] = CityCountyData.map((v) => v.CityName).filter(
  (v) => v !== '釣魚臺' && v !== '南海島',
)

/** 台灣所有行政區名稱列表（已排除釣魚臺、南海島） */
export const townData: string[] = CityCountyData.flatMap((city) =>
  city.AreaList.map((area) => area.AreaName),
).filter((name) => name !== '釣魚臺' && name !== '南海島')
