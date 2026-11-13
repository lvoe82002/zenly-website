/**
 * 全局设置单例：壁纸 / 特效 / 建站日期开关
 *
 * 对应原 index.html 中「全局设置面板」脚本里的：
 * - window.__snowActive / __rainActive / __thunderMode → effectsState
 * - applyWallpaper / applyEffect / 建站日期开关
 *
 * 壁纸与特效同时被 LoadingScreen（初始壁纸）、SettingsPanel（设置项）、
 * WeatherEffects（canvas 渲染开关）、CardFrame（弹层期间暂停特效）共用，
 * 因此抽成模块级单例。
 */
import { reactive } from 'vue'

/** 壁纸类型 → 图片地址 */
export const WALLPAPERS = {
  default: 'https://t.mwm.moe/ycy/',
  daily: 'https://picsum.photos/1920/1080?random=1',
  scenery: 'https://picsum.photos/1920/1080?random=2',
  anime: 'https://t.mwm.moe/ycy/'
}

/** 设置面板「壁纸设置」单选项 */
export const WALLPAPER_OPTIONS = [
  { v: 'default', label: '默认壁纸' },
  { v: 'daily', label: '每日一图' },
  { v: 'scenery', label: '随机风景' },
  { v: 'anime', label: '随机动漫' }
]

/** 设置面板「特效设置」单选项 */
export const EFFECT_OPTIONS = [
  { v: 'snow', label: '雪花' },
  { v: 'rain', label: '下雨' },
  { v: 'thunder', label: '打雷' },
  { v: 'rainThunder', label: '下雨+打雷' },
  { v: 'all', label: '全部' },
  { v: 'none', label: '无' }
]

function readLS(key, fallback) {
  try { return localStorage.getItem(key) || fallback } catch (e) { return fallback }
}

/** 当前设置（持久化到 localStorage） */
export const settingsState = reactive({
  wallpaper: readLS('siteWallpaper', 'anime'),
  effect: readLS('siteEffect', 'rainThunder'),
  dateShow: readLS('siteDateShow', '1') === '1'
})

/** 特效运行开关（原 window.__snowActive / __rainActive / __thunderMode） */
export const effectsState = reactive({ snow: false, rain: false, thunder: false })

export function getWallpaperUrl(type) {
  return WALLPAPERS[type] || WALLPAPERS.default
}

/** 应用壁纸：更新 #wallpaper-layer 背景并持久化 */
export function applyWallpaper(type) {
  const url = getWallpaperUrl(type)
  settingsState.wallpaper = type
  const layer = document.getElementById('wallpaper-layer')
  if (layer) {
    layer.style.background = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + url + ') no-repeat center top'
    layer.style.backgroundSize = 'cover'
  }
  try { localStorage.setItem('siteWallpaper', type) } catch (e) {}
}

function setCanvasVisibility(id, show) {
  const el = document.getElementById(id)
  if (!el) return
  el.style.opacity = show ? '1' : '0'
  el.style.visibility = show ? 'visible' : 'hidden'
}

/** 应用特效：切换三个 canvas 可见性 + 更新运行开关并持久化 */
export function applyEffect(effect) {
  const all = effect === 'all'
  const snow = effect === 'snow' || all
  const rain = effect === 'rain' || effect === 'rainThunder' || all
  const thunder = effect === 'thunder' || effect === 'rainThunder' || all
  const rainVisible = rain || thunder

  setCanvasVisibility('snowFullScreen', snow)
  setCanvasVisibility('rainCanvas', rainVisible)
  setCanvasVisibility('lightningCanvas', thunder)

  effectsState.snow = snow
  effectsState.rain = rain
  effectsState.thunder = thunder

  settingsState.effect = effect
  try { localStorage.setItem('siteEffect', effect) } catch (e) {}
}

/** 应用建站日期显示开关（body.date-off） */
export function applyDateShow(show) {
  settingsState.dateShow = show
  document.body.classList.toggle('date-off', !show)
  try { localStorage.setItem('siteDateShow', show ? '1' : '0') } catch (e) {}
}
