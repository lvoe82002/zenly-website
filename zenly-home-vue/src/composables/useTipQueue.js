/**
 * 顶部提醒气泡（site-tip）单例状态 + 串行队列
 *
 * 对应原 index.html 中的「通用顶部提醒气泡」脚本：
 * - window.showSiteTip('文案', 停留毫秒, 图标)  → showSiteTip()
 * - window.enqueueTopTip('文案', 停留毫秒, 图标) → enqueueTopTip()
 * - window.__greetingDone（问候语生命周期标记）   → greetingDone
 *
 * 同一时刻只允许一个顶部气泡可见；天气失败提示进队列排队，
 * 等问候语或其他气泡完全退场后再弹出，保证互不重叠。
 */
import { reactive } from 'vue'

/** 由 TopTip.vue 渲染的 site-tip 气泡状态 */
export const siteTip = reactive({
  text: '',
  icon: 'i',
  iconSvg: '',      // 内置 SVG 图标字符串（传内置名称时使用）
  show: false,
  out: false
})

/** 问候语生命周期标记：天气失败提示必须等问候语完整显示并关闭后才允许弹出 */
export const greetingDone = reactive({ value: false })

/** 内置 SVG 图标（viewBox 0 0 48 48），填充色 currentColor 自动跟随 .tip-icon 的深色字色 */
const TIP_ICON_SVGS = {
  close: '<svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" aria-hidden="true" style="display:block"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 11L11 6L24 19L37 6L42 11L29 24L42 37L37 42L24 29L11 42L6 37L19 24L6 11Z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
}

let hideTimer = null
let outTimer = null

/** 立即显示一个顶部气泡（不经队列） */
export function showSiteTip(text, duration, icon) {
  duration = duration || 2500
  siteTip.text = text
  if (TIP_ICON_SVGS[icon]) {
    siteTip.iconSvg = TIP_ICON_SVGS[icon]
  } else {
    siteTip.iconSvg = ''
    siteTip.icon = icon || 'i'
  }
  siteTip.out = false
  siteTip.show = true
  clearTimeout(hideTimer)
  clearTimeout(outTimer)
  hideTimer = setTimeout(() => {
    siteTip.out = true
    outTimer = setTimeout(() => {
      siteTip.show = false
      siteTip.out = false
    }, 350)
  }, duration)
}

/* ===== 顶部提示串行队列（PC + 手机端通用）：同一时刻只允许一个顶部气泡可见 ===== */
const tipQueue = []
let queueBusy = false

function isOtherTipVisible() {
  const tips = document.querySelectorAll('.float-tip-top.show')
  for (let i = 0; i < tips.length; i++) {
    const el = tips[i]
    if (el.classList.contains('site-tip')) continue
    // 手机端 #welcomeTip 等非 site-tip 被 CSS 强制 display:none，虽带 show 类但不可见，不算占位
    if (getComputedStyle(el).display !== 'none') return true
  }
  return false
}

function pumpQueue() {
  if (queueBusy) return
  const job = tipQueue.shift()
  if (!job) return
  ;(function waitSlot() {
    if (isOtherTipVisible()) { setTimeout(waitSlot, 150); return }
    queueBusy = true
    showSiteTip(job.text, job.duration, job.icon)
    setTimeout(() => {
      queueBusy = false
      pumpQueue()
    }, job.duration + 420) // 停留时长 + 350ms 退场动画 + 余量
  })()
}

/** 排队弹出顶部提示：enqueueTopTip('文案', 停留毫秒, 图标字符) */
export function enqueueTopTip(text, duration, icon) {
  tipQueue.push({ text, duration: duration || 3000, icon })
  pumpQueue()
}
