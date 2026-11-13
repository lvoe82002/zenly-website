/**
 * PC 端防复制脚本：仅 PC（鼠标设备）生效，手机端自动跳过
 *
 * 对应原 index.html 中「PC端防复制脚本」：阻止拖选、复制、剪切、
 * 拖拽与键盘途径（Ctrl+C/X/A/S/U/P、Ctrl+Insert、F12）。
 */
import { showSiteTip } from './useTipQueue'

let bound = false

export function useProtection() {
  if (bound) return
  bound = true

  // 仅 PC 端（可悬停的鼠标设备）启用；触屏/手机端直接返回，不改变手机端任何行为
  const isPC = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!isPC) return

  // 1) 阻止鼠标拖选、双击选词、三击选段：selectstart 阶段直接掐断，不出现选中高亮
  document.addEventListener('selectstart', function (e) {
    e.preventDefault()
    return false
  }, false)

  // 2) 兜底：任何途径产生的选区（如 Shift+方向键）立即清除
  document.addEventListener('selectionchange', function () {
    const sel = window.getSelection ? window.getSelection() : null
    if (sel && sel.rangeCount > 0) sel.removeAllRanges()
  })

  // 3) 拦截复制/剪切（Ctrl+C、菜单复制等全部途径），阻止内容写入剪贴板
  function blockClipboard(e) {
    e.preventDefault()
    if (e.clipboardData) {
      try { e.clipboardData.setData('text/plain', '') } catch (err) {}
      try { e.clipboardData.setData('text/html', '') } catch (err) {}
    }
    return false
  }
  document.addEventListener('copy', blockClipboard)
  document.addEventListener('cut', blockClipboard)

  // 4) 禁止拖拽文字、图片、链接
  document.addEventListener('dragstart', function (e) {
    e.preventDefault()
    return false
  }, false)

  // 5) 拦截键盘途径：Ctrl/Cmd + C(复制) X(剪切) A(全选) S(另存) U(源码) P(打印)、Ctrl+Insert、F12
  document.addEventListener('keydown', function (e) {
    const key = (e.key || '').toLowerCase()
    const isCtrl = e.ctrlKey || e.metaKey
    if (isCtrl && ['c', 'x', 'a', 's', 'u', 'p'].indexOf(key) > -1) {
      e.preventDefault()
      return false
    }
    if (isCtrl && e.keyCode === 45) { // Ctrl+Insert 复制
      e.preventDefault()
      return false
    }
    if (e.keyCode === 123) { // F12 开发者工具
      e.preventDefault()
      showSiteTip('别想偷我源码，想要自己写去', 2500)
      return false
    }
  }, false)
}
