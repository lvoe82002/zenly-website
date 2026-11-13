/**
 * 问候语 / 右键提示
 * 对应原 index.html 中「问候语」与「右键提示」脚本。
 */
import { enqueueTopTip } from './useTipQueue'

const welcomeTextEl = () => document.getElementById('welcomeTipText')

function greetText(h) {
  if (h < 6) return '夜深了 注意休息哦'
  if (h < 9) return '早上好 欢迎来到我的主页'
  if (h < 12) return '上午好 欢迎来到我的主页'
  if (h < 14) return '中午好 欢迎来到我的主页'
  if (h < 18) return '下午好 欢迎来到我的主页'
  return '晚上好 欢迎来到我的主页'
}

/**
 * 页面揭幕（loading）完成后由 LoadingScreen 调用：
 * 延迟 1.2s 展示问候语，并把右键提示入队（互斥显示）。
 */
export function tryShowWelcomeAfterLoad() {
  const el = welcomeTextEl()
  if (el) el.textContent = greetText(new Date().getHours())
  setTimeout(() => {
    const tip = document.getElementById('welcomeTip')
    if (tip) {
      tip.classList.add('show')
      setTimeout(() => {
        tip.classList.add('float-tip-out')
        setTimeout(() => tip.classList.remove('show', 'float-tip-out'), 600)
      }, 3200)
      setTimeout(() => {
        enqueueTopTip('为了浏览体验，本站禁用右键', { duration: 2800 })
      }, 4200)
    }
  }, 1200)
}

/**
 * 右键提示：点按鼠标右键时显示「禁用右键」气泡
 */
export function initRightClickTip() {
  document.addEventListener('mousedown', e => {
    if (e.button !== 2) return
    const tip = document.getElementById('rightTipTop')
    if (!tip) return
    tip.classList.add('show')
    setTimeout(() => tip.classList.remove('show'), 1800)
  })
}
