/**
 * PC 端垂直居中布局
 *
 * 对应原 index.html 中「adjustLayout」脚本：仅在视口 ≥1025px 时生效。
 * 整组内容（logo、一言、卡片、时钟等）始终位于视口上下中部，
 * 顶部留白（.top-empty-space）与底部版权条（.copyright-bar）间距同步重算。
 *
 * 由 App.vue 挂载后调用一次 initPcLayout()。
 */
export function initPcLayout() {
  if (window.innerWidth < 1025) return
  const topSpace = document.querySelector('.top-empty-space')
  const copyright = document.querySelector('.copyright-bar')
  if (!topSpace || !copyright) return

  let lastLayoutWidth = null // 上次完成布局时的视口宽度
  let userResized = false

  function adjustLayout(forceRecent) {
    const wrapper = document.querySelector('.bottom-area-wrapper')
    if (!wrapper) return

    const origMinH = document.body.style.minHeight
    copyright.style.marginTop = ''
    document.body.style.minHeight = 'auto'
    topSpace.style.height = '0px'
    topSpace.style.overflow = 'hidden'
    wrapper.style.top = '0px'
    void document.body.offsetHeight
    const otherContentHeight = document.body.scrollHeight
    const baseCopyrightMargin = parseFloat(getComputedStyle(copyright).marginTop) || 0
    document.body.style.minHeight = origMinH
    topSpace.style.overflow = ''

    const viewportH = window.innerHeight

    const bottomFit = viewportH - otherContentHeight

    const wrapperRect = wrapper.getBoundingClientRect()
    const visualEls = wrapper.querySelectorAll(
      '.hitokoto-side, .center-logo-flow, .interactive-badge, .nav-group-cards, .social, .digital-clock-card'
    )
    let minTop = Infinity, maxBottom = -Infinity
    visualEls.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return
      if (r.top < minTop) minTop = r.top
      if (r.bottom > maxBottom) maxBottom = r.bottom
    })
    // 视觉中心相对视口几何中心的上移量：按 F11 全屏后内容看着略偏下，整体再抬高一点（只影响电脑端布局）
    const centerLift = 18
    let centerFit = bottomFit
    if (minTop !== Infinity) {
      const visualCenterOffset = (minTop + maxBottom) / 2 - wrapperRect.top
      centerFit = viewportH / 2 - centerLift - visualCenterOffset - wrapperRect.top
    }

    // 无论首次加载、宽度变化，还是仅高度变化（按 F11 全屏 / 退出全屏、地址栏显隐），
    // 都按当前视口重新垂直居中；顶部留白与底部版权条间距同步重算
    const spacer = (centerFit <= bottomFit) ? Math.max(30, centerFit) : Math.max(30, bottomFit)
    lastLayoutWidth = window.innerWidth
    topSpace.style.height = spacer + 'px'

    // 顶部位置定好后，剩余/多出的高度全部交给底部版权条间距吸收，版权条始终贴近视口底部。
    const extraGap = bottomFit - spacer
    if (extraGap > 0) {
      copyright.style.marginTop = (baseCopyrightMargin + extraGap) + 'px'
    } else {
      copyright.style.marginTop = ''
    }
  }

  adjustLayout(true)
  window.addEventListener('load', () => { adjustLayout(true) })
  // 任意 resize（含 F11 只改高度）都经 rAF 合并后重新垂直居中，避免连续触发时抖动
  let resizeRaf = null
  window.addEventListener('resize', () => {
    userResized = true
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => { adjustLayout(false) })
  })
  if (document.fonts && document.fonts.ready) {
    // 字体若在用户已经调整过窗口后才加载完，不再强制重排，避免把内容突然拉走
    document.fonts.ready.then(() => { if (!userResized) adjustLayout(true) })
  }
}
