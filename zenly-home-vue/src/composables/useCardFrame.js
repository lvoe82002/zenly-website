/**
 * 卡片全屏弹层 + 统一跳转路由
 *
 * 对应原 index.html 中「卡片全屏弹层」脚本：
 * - window.__openCard(href)  → openCard()
 * - window.__go(href)        → goTo()
 * - window.__goHome()        → goHome()
 * - window.__closeCard()     → closeCard()
 *
 * 卡片页在 iframe 内打开，主页常驻不卸载、音乐不中断；
 * 站外链接由 goTo 新标签打开，同样不卸载主页。
 *
 * 弹层 DOM（#cardFrameMask / #cardFrame）由 CardFrame.vue 渲染，
 * 本模块只负责按 id 操作，保证被多个组件（NavCards 等）直接调用。
 */
import { effectsState } from './useSettings'
import { showSiteTip } from './useTipQueue'

const MOBILE_LAYOUT_W = 980

let cardOpen = false
let historyPushed = false
let savedEffects = null
let baseHistLen = 0
let initialized = false

/**
 * 卡片页均未写 viewport meta，手机浏览器独立打开时按 980px 虚拟宽度缩放渲染。
 * iframe 内必须复刻同样的 980 布局再等比缩回屏幕宽度，保证手机端卡片大小与独立打开完全一致。
 */
function applyFrameSize() {
  const frame = document.getElementById('cardFrame')
  if (!frame) return
  const vw = window.innerWidth, vh = window.innerHeight
  if (vw <= 768) {
    const scale = vw / MOBILE_LAYOUT_W
    frame.style.inset = 'auto'
    frame.style.left = '0'; frame.style.top = '0'
    frame.style.width = MOBILE_LAYOUT_W + 'px'
    frame.style.height = (vh / scale) + 'px'
    frame.style.transformOrigin = '0 0'
    frame.style.transform = 'scale(' + scale + ')'
  } else {
    frame.style.inset = ''; frame.style.left = ''; frame.style.top = ''
    frame.style.width = ''; frame.style.height = ''
    frame.style.transform = ''; frame.style.transformOrigin = ''
  }
}

/** 弹层打开期间暂停主页特效（雪花/下雨/打雷），关闭后恢复 */
function pauseParentEffects() {
  savedEffects = { snow: effectsState.snow, rain: effectsState.rain, thunder: effectsState.thunder }
  effectsState.snow = false
  effectsState.rain = false
  effectsState.thunder = false
}

function resumeParentEffects() {
  if (!savedEffects) return
  effectsState.snow = savedEffects.snow
  effectsState.rain = savedEffects.rain
  effectsState.thunder = savedEffects.thunder
  savedEffects = null
}

/** 用全屏 iframe 弹层打开站内页面 */
export function openCard(href) {
  if (!href) return
  const mask = document.getElementById('cardFrameMask')
  const frame = document.getElementById('cardFrame')
  if (!mask || !frame) return

  document.body.classList.remove('mobile-menu-open')
  if (!cardOpen) {
    cardOpen = true
    document.body.classList.add('card-open') // 隐藏主页自定义光标，交给 iframe 内子页面的光标
    try { baseHistLen = history.length } catch (e) { baseHistLen = 0 }
    pauseParentEffects()
    applyFrameSize()
    mask.classList.add('show') // 点下同一刻直接显示弹层，不做「先黑再淡入」
    try { history.pushState({ nxCard: true }, '', href); historyPushed = true } catch (e) { historyPushed = false }
  }
  if (frame.getAttribute('src') !== href) frame.src = href
}

function isExternalUrl(u) { return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(u) }

let goTimer = null

/**
 * 统一跳转路由（所有网站列表按钮共用）：点击即进入，无「正在跳转」过渡页、无延时
 * 1) 站外 http(s) 链接：在点击手势内直接新开标签进入目标站点，不卸载主页，音乐继续播放；
 * 2) 站内相对页面：直接用全屏 iframe 弹层打开（openCard），音乐零中断。
 */
export function goTo(href) {
  if (!href) return
  if (goTimer) { clearTimeout(goTimer); goTimer = null }
  if (isExternalUrl(href)) {
    let win = null
    try { win = window.open(href, '_blank') } catch (e) { win = null }
    if (!win) {
      showSiteTip('新窗口被浏览器拦截，请允许弹出窗口后重试', 3000, 'close')
    }
  } else {
    openCard(href)
  }
}

/** 起始页：整页刷新（点击即重新加载当前主页） */
export function goHome() {
  location.reload()
}

function hideCard() {
  if (!cardOpen) return
  cardOpen = false
  document.body.classList.remove('card-open') // 恢复主页光标能力（仍等下一次 mousemove 才显示）
  const pc = document.getElementById('cursor')
  if (pc) pc.classList.add('hidden')
  historyPushed = false
  baseHistLen = 0
  resumeParentEffects()
  const mask = document.getElementById('cardFrameMask')
  if (mask) mask.classList.remove('show')
  const frame = document.getElementById('cardFrame')
  setTimeout(() => {
    if (!cardOpen && frame) frame.src = 'about:blank'
  }, 260)
}

export function closeCard() {
  // 联合历史长度差值 = pushState + iframe 内全部跳转层数，一次性退回主页
  if (historyPushed) {
    let steps = 1
    try { steps = Math.max(1, history.length - baseHistLen) } catch (e) {}
    historyPushed = false
    try { history.go(-steps); return } catch (e) {}
  }
  hideCard()
}

/** 绑定 popstate / message / pageshow（bfcache）监听，由 CardFrame.vue 挂载时调用一次 */
export function initCardFrame() {
  if (initialized) return
  initialized = true

  window.addEventListener('resize', () => { if (cardOpen) applyFrameSize() })
  window.addEventListener('orientationchange', () => setTimeout(() => { if (cardOpen) applyFrameSize() }, 200))

  window.addEventListener('popstate', e => {
    // 回到主页条目（state 不再是 nxCard）时关闭弹层；iframe 内部回退不会触发父窗口 popstate
    if (cardOpen && !(e.state && e.state.nxCard)) hideCard()
  })

  window.addEventListener('message', ev => {
    const d = ev.data
    if (!d || typeof d !== 'object') return
    if (d.type === 'nx-close-card') closeCard()
  })

  // 从外部整页链接返回（bfcache 恢复）时，部分手机内页浏览器不会自动重绘会白一下：
  // 仅在「历史恢复(persisted)」时确保页面清晰可见并触发一次合成层重绘；首次正常加载完全不干预。
  window.addEventListener('pageshow', ev => {
    if (!ev.persisted) return
    try {
      const box = document.getElementById('loading-box')
      if (box) box.remove()
      document.body.classList.add('loading', 'page-clear')
      document.body.classList.remove('pre-blur')
      const wp = document.getElementById('wallpaper-layer')
      requestAnimationFrame(() => {
        if (!wp) return
        wp.style.transform = 'translateZ(0) scale(1.001)'
        requestAnimationFrame(() => { wp.style.transform = '' })
      })
    } catch (e) {}
  })
}
