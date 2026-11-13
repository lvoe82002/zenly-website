/**
 * 天气逻辑：高德 IP 定位 + 实况天气
 *
 * 对应原 index.html 中「天气逻辑」脚本。结果写入 #clockWeather，
 * 失败时先等问候语完整退场（greetingDone）再经顶部提示队列弹出失败气泡。
 */
import { greetingDone, enqueueTopTip, showSiteTip } from './useTipQueue'

const AMAP_KEY = 'a9d68f746db62b73a21db9416da2db97'
const TIMEOUT = 8000 // 单次请求最长等待 8 秒，超时直接判失败，避免一直卡在「正在定位…」

function fail(msg, detail) {
  const weatherEl = document.getElementById('clockWeather')
  if (weatherEl) weatherEl.textContent = msg || '天气数据获取失败'
  if (detail) console.warn('[天气] ' + msg + '：', detail)
  else console.warn('[天气] ' + msg)
  // 关键：先等问候语（早上好/下午好…）完整显示并退场后，再弹天气失败气泡
  waitGreetingThenTip(msg || '天气数据获取失败', 3000)
}

/** 等问候语退场后再弹顶部失败气泡（最多等 15 秒兜底） */
function waitGreetingThenTip(text, duration) {
  let tipShown = false
  function show() {
    if (tipShown) return
    tipShown = true
    enqueueTopTip(text, duration, 'close')
  }
  if (greetingDone.value) { show(); return }
  let waited = 0
  const timer = setInterval(() => {
    waited += 200
    if (greetingDone.value) {
      clearInterval(timer)
      show()
    } else if (waited >= 15000) {
      clearInterval(timer)
      show()
    }
  }, 200)
}

function getJSON(url) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null
  let timer = null
  if (ctrl) timer = setTimeout(() => { ctrl.abort() }, TIMEOUT)
  return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.json()
    })
    .then(data => {
      if (timer) clearTimeout(timer)
      return data
    }, err => {
      if (timer) clearTimeout(timer)
      throw err
    })
}

/** 拉取并渲染实况天气（幂等，可在组件挂载时调用一次） */
export function fetchWeather() {
  getJSON('https://restapi.amap.com/v3/ip?key=' + AMAP_KEY)
    .then(res => {
      // 高德的 status 是字符串："1" 成功，"0" 失败；不能用 !res.status 判断（"0" 也是真值）
      if (String(res.status) !== '1') {
        fail('天气信息获取失败', res.info || res)
        return
      }
      // 个别网络（如直辖市）city 字段为空数组，退而使用 province
      let city = Array.isArray(res.city) ? '' : (res.city || '')
      if (!city) city = Array.isArray(res.province) ? '' : (res.province || '')
      const adcode = Array.isArray(res.adcode) ? '' : (res.adcode || '')
      if (!adcode) {
        fail('天气信息获取失败', 'adcode 为空（当前网络出口 IP 无法被高德识别）')
        return
      }
      return getJSON('https://restapi.amap.com/v3/weather/weatherInfo?key=' + AMAP_KEY + '&city=' + adcode)
        .then(w => {
          if (String(w.status) !== '1') {
            fail('天气信息获取失败', w.info || w)
            return
          }
          const live = w.lives && w.lives[0]
          const weatherEl = document.getElementById('clockWeather')
          if (!live) {
            fail('天气信息获取失败', 'lives 为空')
            return
          }
          if (!weatherEl) return
          weatherEl.innerHTML = '<span>' + city + ' </span>'
            + '<span>' + live.weather + ' </span>'
            + '<span>' + live.temperature + '℃</span>'
            + '<span class="sm-hidden"> ' + live.winddirection + '风 </span>'
            + '<span class="sm-hidden">' + live.windpower + ' 级</span>'
        })
    })
    .catch(err => {
      // 超时（AbortError）、网络错误、JSON 解析错误都会走到这里
      const reason = (err && err.name === 'AbortError')
        ? '请求超时'
        : ((err && err.message) || '网络错误')
      fail('天气信息获取失败', reason)
    })
}
