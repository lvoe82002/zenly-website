/**
 * 高德 IP 定位 + 实况天气
 * 对应原 index.html 中「天气脚本」：
 * AMAP_KEY 请替换为自己的 Web 服务 Key。
 */
const AMAP_KEY = 'e0ffb418395e9c92b2b7e1fdbdcd03e1'

function updateWeatherUI(city, weather, temp) {
  const el = document.getElementById('clockWeather')
  if (!el) return
  const showTemp = temp ? ` ${temp}°C` : ''
  el.textContent = `${city} ${weather}${showTemp}`
  el.title = '天气信息来自高德'
}

function updateWeatherError(msg) {
  const el = document.getElementById('clockWeather')
  if (!el) return
  el.textContent = msg
}

export function fetchWeather() {
  fetch('https://restapi.amap.com/v3/ip?key=' + AMAP_KEY)
    .then(r => r.json())
    .then(ip => {
      if (ip.status !== '1' || !ip.adcode) throw new Error('ip')
      return fetch('https://restapi.amap.com/v3/weather/weatherInfo?key=' + AMAP_KEY + '&city=' + ip.adcode)
    })
    .then(r => r.json())
    .then(w => {
      if (w.status !== '1' || !w.lives || !w.lives.length) throw new Error('weather')
      const l = w.lives[0]
      updateWeatherUI(l.city, l.weather, l.temperature)
    })
    .catch(() => updateWeatherError('天气信息获取失败'))
}
