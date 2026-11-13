/**
 * 问候语（早上好/下午好…）与右键提示逻辑
 *
 * 对应原 index.html 中「模糊渐清」脚本里的 getGreeting / showWelcomeTip /
 * tryShowWelcomeAfterLoad 以及右键禁用提示部分。
 *
 * 问候语生命周期标记 greetingDone 供天气失败提示排队使用（见 useTipQueue / useWeather）。
 */
import { greetingDone } from './useTipQueue'

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) return '早上好'
  if (hour >= 9 && hour < 12) return '上午好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  if (hour >= 18 && hour < 22) return '晚上好'
  return '夜深了'
}

function siteTipVisible() {
  const t = document.querySelector('.float-tip-top.site-tip.show')
  return !!(t && getComputedStyle(t).display !== 'none')
}

export function showWelcomeTip() {
  const tip = document.getElementById('welcomeTip')
  const textEl = document.getElementById('welcomeTipText')
  if (!tip || !textEl) { greetingDone.value = true; return }
  const greeting = getGreeting()
  if (greeting === '早上好') {
    textEl.innerHTML = '<strong>早上好</strong> 欢迎来到我的主页'
  } else {
    textEl.textContent = greeting + ' 欢迎来到我的主页'
  }
  // 与天气失败等顶部提示互斥：若此刻已有 site-tip 正在显示，等其退场后再弹问候语，避免两个气泡重叠
  ;(function present() {
    if (siteTipVisible()) { setTimeout(present, 150); return }
    tip.classList.add('show')
    setTimeout(() => {
      tip.classList.add('float-tip-out')
      setTimeout(() => {
        tip.classList.remove('show', 'float-tip-out')
        greetingDone.value = true // 问候语已完全关闭，放行正在等待的天气失败提示
      }, 350)
    }, 3500)
  })()
}

/** 页面加载完成后决定是否弹问候语（同会话只弹一次；刷新总会弹） */
export function tryShowWelcomeAfterLoad() {
  const navEntry = performance.getEntriesByType('navigation')[0]
  if (!navEntry) { greetingDone.value = true; return }
  const type = navEntry.type
  if (type === 'reload') {
    sessionStorage.removeItem('welcomed')
    showWelcomeTip()
    sessionStorage.setItem('welcomed', '1')
    return
  }
  if (type === 'navigate' && !sessionStorage.getItem('welcomed')) {
    showWelcomeTip()
    sessionStorage.setItem('welcomed', '1')
    return
  }
  // 本次不会再弹问候语（本会话已问候过 / 非导航进入）：直接放行后续提示
  greetingDone.value = true
}

/** 右键禁用 + 「为了浏览体验，本站禁用右键」提示（仅绑定一次） */
let rightTipBound = false
export function initRightClickTip() {
  if (rightTipBound) return
  rightTipBound = true
  let rightTipTimer
  document.addEventListener('contextmenu', e => {
    e.preventDefault()
    const tip = document.getElementById('rightTipTop')
    if (tip) {
      tip.classList.remove('float-tip-out')
      tip.classList.add('show')
      clearTimeout(rightTipTimer)
      rightTipTimer = setTimeout(() => {
        tip.classList.add('float-tip-out')
        setTimeout(() => {
          tip.classList.remove('show', 'float-tip-out')
        }, 350)
      }, 2500)
    }
  })
}
