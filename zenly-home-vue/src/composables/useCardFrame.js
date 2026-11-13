/**
 * 卡片弹层与站内/站外跳转统一路由
 * 对应原 index.html 中 __go / __goHome / __openCard / __closeCard / 卡片 iframe 初始化脚本。
 * 站外链接：新标签打开（保持主页常驻）；站内页面：全屏 iframe 弹层。
 */
const INTERNAL_PREFIXES = ['https://breeyt.zenlydsp.top/', 'https://home.zenlydsp.top/']

let historyPushLock = false

function normalizePath(u) {
  try { return new URL(u, window.location.href) } catch (e) { return null }
}

function isInternal(url) {
  return INTERNAL_PREFIXES.some(p => url.startsWith(p))
}

/**
 * 统一跳转：站外新标签，站内弹层
 */
export function goTo(url) {
  if (isInternal(url)) {
    openCard(url)
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

/**
 * 起始页：清空弹层并回到第一页
 */
export function goHome() {
  const mask = document.getElementById('cardFrameMask')
  const frame = document.getElementById('cardFrame')
  if (mask && frame) {
    frame.src = ''
    mask.classList.remove('open')
    document.body.classList.remove('card-open')
    resumeEffects()
  }
  // 回到第一页
  const root = document.querySelector('.nav-pages')
  if (root) {
    const pages = root.querySelectorAll('.nav-page')
    const dots = root.querySelectorAll('.nav-dot')
    pages.forEach((p, i) => p.classList.toggle('is-active', i === 0))
    dots.forEach((d, i) => d.classList.toggle('is-active', i === 0))
    root.classList.add('at-first')
  }
}

/**
 * 站内页面：全屏 iframe 弹层打开
 */
export function openCard(url) {
  const mask = document.getElementById('cardFrameMask')
  const frame = document.getElementById('cardFrame')
  if (!mask || !frame) return
  pauseEffects()
  mask.classList.add('open')
  document.body.classList.add('card-open')
  frame.src = url
  // 支持浏览器后退关闭弹层
  if (!historyPushLock) {
    historyPushLock = true
    window.history.pushState({ cardOpen: true }, '')
    setTimeout(() => { historyPushLock = false }, 300)
  }
}

export function closeCard() {
  const mask = document.getElementById('cardFrameMask')
  const frame = document.getElementById('cardFrame')
  if (!mask || !frame) return
  frame.src = ''
  mask.classList.remove('open')
  document.body.classList.remove('card-open')
  resumeEffects()
}

/* ===== 特效暂停 / 恢复 ===== */
let paused = false
function pauseEffects() { paused = true }
function resumeEffects() { paused = false }
export function isEffectsPaused() { return paused }

/* ===== 历史后退关闭弹层 ===== */
export function initCardFrame() {
  window.addEventListener('popstate', () => {
    closeCard()
  })
}
