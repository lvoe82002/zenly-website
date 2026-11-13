/**
 * 全局设置状态单例：壁纸 / 特效 / 建站日期
 * 对应原 index.html 中「壁纸 API」「特效设置」「建站日期」脚本，
 * 全部改为模块级 reactive 状态 + localStorage 持久化。
 */
import { reactive } from 'vue'

export const settingsState = reactive({
  wallpaper: localStorage.getItem('zenly-wallpaper') || 'auto',
  effect: localStorage.getItem('zenly-effect') || 'none',
  dateShow: localStorage.getItem('zenly-dateshow') !== '0'
})

export const effectsState = reactive({
  snow: false,
  rain: false,
  thunder: false
})

export const WALLPAPER_OPTIONS = [
  { v: 'auto', label: '自动获取' },
  { v: 'bing', label: '必应每日一图' },
  { v: 'custom', label: '自定义壁纸' }
]

export const EFFECT_OPTIONS = [
  { v: 'none', label: '关闭' },
  { v: 'snow', label: '雪花' },
  { v: 'rain', label: '下雨' },
  { v: 'thunder', label: '打雷' }
]

/* ===== 壁纸 ===== */
export function getWallpaperUrl(kind) {
  if (kind === 'bing') {
    return 'https://bing.biturl.top/?resolution=1920&format=image&index=random&mkt=zh-CN'
  }
  if (kind === 'custom') {
    return localStorage.getItem('zenly-wallpaper-custom') || ''
  }
  return 'https://api.zenlydsp.top/wallpaper?t=' + Date.now()
}

export function applyWallpaper(v) {
  settingsState.wallpaper = v
  localStorage.setItem('zenly-wallpaper', v)
  const wall = document.getElementById('wallpaper-layer')
  const url = getWallpaperUrl(v)
  if (wall && url) {
    const img = new Image()
    img.onload = () => { wall.style.backgroundImage = `url("${url}")` }
    img.src = url
  }
}

export function applyEffect(v) {
  settingsState.effect = v
  localStorage.setItem('zenly-effect', v)
  effectsState.snow = v === 'snow'
  effectsState.rain = v === 'rain'
  effectsState.thunder = v === 'thunder'
}

export function applyDateShow(v) {
  settingsState.dateShow = !!v
  localStorage.setItem('zenly-dateshow', v ? '1' : '0')
}
