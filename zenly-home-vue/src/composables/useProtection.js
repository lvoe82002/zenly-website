/**
 * PC 端防复制保护
 * 对应原 index.html 中「禁用右键/F12/复制/拖选」脚本：
 * 全站禁止右键菜单、阻止 F12 与 Ctrl+Shift+J/I/C，防止内容被轻易复制。
 * 仅桌面端生效（手机端保留长按复制体验）。
 */
export function initProtection() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
  if (isMobile) return

  document.addEventListener('contextmenu', e => e.preventDefault())
  document.addEventListener('copy', e => e.preventDefault())
  document.addEventListener('dragstart', e => e.preventDefault())

  document.addEventListener('keydown', e => {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['J', 'I', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')) {
      e.preventDefault()
      return false
    }
  })
}
