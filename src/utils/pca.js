import pcaData from '@/utils/pca-data.json'

export async function loadPcaData() {
  return pcaData
}

export async function findCityNodeByName(cityName) {
  const allCities = pcaData.flatMap(province => province.children || [])
  return allCities.find(city => city.text === cityName) || null
}

export function findDistrictNodeByCode(code) {
  if (!code) return null
  const targetCode = String(code)

  for (const province of pcaData) {
    const found = findDistrictInProvince(province, targetCode)
    if (found) return found
  }

  return null
}

function findDistrictInProvince(province, targetCode) {
  const cities = province.children || []

  for (const city of cities) {
    const districts = collectDistricts(city)
    const found = districts.find(district => String(district.value) === targetCode)
    if (found) return found
  }

  return null
}

function collectDistricts(city) {
  const children = city.children || []
  const hasNestedDistricts = children.some(child => child.children && child.children.length > 0)

  if (!hasNestedDistricts) return children

  return children.flatMap(child => child.children || [])
}
