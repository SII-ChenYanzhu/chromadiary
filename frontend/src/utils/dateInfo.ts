const LUNAR_DAY_NAMES = [
  '',
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
]

const SOLAR_FESTIVALS: Record<string, string[]> = {
  '01-01': ['元旦'],
  '02-14': ['情人节'],
  '03-08': ['国际妇女节'],
  '03-12': ['植树节'],
  '04-01': ['愚人节'],
  '04-22': ['世界地球日'],
  '05-01': ['劳动节'],
  '05-04': ['青年节'],
  '06-01': ['儿童节'],
  '09-10': ['教师节'],
  '10-01': ['国庆节'],
  '12-24': ['平安夜'],
  '12-25': ['圣诞节'],
}

const LUNAR_FESTIVALS: Record<string, string[]> = {
  '正月-1': ['春节'],
  '正月-15': ['元宵节'],
  '五月-5': ['端午节'],
  '七月-7': ['七夕'],
  '八月-15': ['中秋节'],
  '九月-9': ['重阳节'],
  '腊月-8': ['腊八节'],
  '腊月-23': ['北方小年'],
  '腊月-24': ['南方小年'],
}

const STATUTORY_HOLIDAY_NAMES = new Set([
  '元旦',
  '春节',
  '清明节',
  '劳动节',
  '端午节',
  '中秋节',
  '国庆节',
])

export type DateInfo = {
  lunarLabel: string
  festivals: string[]
}

function getQingmingDay(year: number) {
  if (year < 2000 || year > 2099) return null
  const y = year % 100
  return Math.floor(y * 0.2422 + 4.81) - Math.floor((y - 1) / 4)
}

export function getDateInfo(date: Date): DateInfo {
  const formatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
    month: 'long',
    day: 'numeric',
  })
  const parts = formatter.formatToParts(date)
  const lunarMonth = parts.find((part) => part.type === 'month')?.value ?? ''
  const lunarDay = Number(parts.find((part) => part.type === 'day')?.value ?? 0)
  const normalizedLunarMonth = lunarMonth.replace('闰', '')

  const lunarLabel = `${lunarMonth}${LUNAR_DAY_NAMES[lunarDay] ?? `${lunarDay}日`}`
  const solarKey = new Intl.DateTimeFormat('en-CA', {
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const festivals = [
    ...(SOLAR_FESTIVALS[solarKey] ?? []),
    ...(LUNAR_FESTIVALS[`${normalizedLunarMonth}-${lunarDay}`] ?? []),
  ]

  const qingmingDay = getQingmingDay(date.getFullYear())
  if (date.getMonth() === 3 && qingmingDay === date.getDate()) {
    festivals.push('清明节')
  }

  return {
    lunarLabel,
    festivals: Array.from(new Set(festivals)),
  }
}

export function getStatutoryHoliday(date: Date) {
  return getDateInfo(date).festivals.find((festival) => STATUTORY_HOLIDAY_NAMES.has(festival)) ?? null
}
