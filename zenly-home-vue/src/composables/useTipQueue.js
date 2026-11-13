/**
 * site-tip 单例状态 + 串行队列
 * 对应原 index.html 中 showSiteTip / enqueueTopTip 脚本：
 * 问候语与其它顶部提示互斥显示，排队依次播放。
 */
import { reactive } from 'vue'

export const siteTip = reactive({
  show: false,
  out: false,
  text: '',
  icon: '',
  iconSvg: ''
})

let queue = []
let showing = false
let hideTimer = null
let outTimer = null

function playTip(tip) {
  if (!tip || showing) return
  showing = true
  siteTip.text = tip.text || ''
  siteTip.icon = tip.icon || 'i'
  siteTip.iconSvg = tip.iconSvg || ''
  siteTip.out = false
  siteTip.show = true
  const duration = tip.duration || 3000
  outTimer = setTimeout(() => { siteTip.out = true }, duration - 400)
  hideTimer = setTimeout(() => {
    siteTip.show = false
    siteTip.out = false
    showing = false
    playTip(queue.shift())
  }, duration)
}

export function enqueueTopTip(text, opts = {}) {
  const tip = { text, icon: opts.icon, iconSvg: opts.iconSvg, duration: opts.duration }
  if (showing) queue.push(tip)
  else playTip(tip)
}
