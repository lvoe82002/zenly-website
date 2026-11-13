/**
 * PC 端垂直居中布局
 * 对应原 index.html 中「PC 布局」脚本：
 * 计算 topSpace 让主内容在首屏内垂直居中，防止溢出顶部。
 */
export function initPcLayout() {
  function calc() {
    const main = document.getElementById('mainContainer')
    const wall = document.getElementById('wallpaper-layer')
    if (!main) return
    const h = window.innerHeight
    let mainH = main.offsetHeight
    let topSpace = (h - mainH) / 2
    if (topSpace < 0) topSpace = 0
    // 桌面端把布局结果挂到 CSS 变量上
    document.documentElement.style.setProperty('--top-space', topSpace + 'px')
    if (topSpace > 0) {
      main.style.marginTop = topSpace + 'px'
    }
  }
  window.addEventListener('resize', calc)
  window.addEventListener('load', calc)
  setTimeout(calc, 300)
}
