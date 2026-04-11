export async function loadPcaData() {
  const module = await import('@/utils/pca-data.json')
  return module.default || module
}

export async function findCityNodeByName(cityName) {
  const pcaData = await loadPcaData()
  const allCities = pcaData.flatMap(province => province.children || [])
  return allCities.find(city => city.text === cityName) || null
}
