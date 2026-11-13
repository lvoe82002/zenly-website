<script setup>
/**
 * 自定义圆圈光标（仅 PC 鼠标设备）
 * 对应原 index.html 中「cursor」脚本：跟随鼠标平滑移动，
 * 弹层（卡片 iframe / 音乐）打开期间强制隐藏。
 */
import { onMounted, onBeforeUnmount } from 'vue'

const cleanupFns = []

function on(target, type, fn, opts) {
  target.addEventListener(type, fn, opts)
  cleanupFns.push(() => target.removeEventListener(type, fn, opts))
}

onMounted(() => {
  const cursor = document.getElementById('cursor')
  if (!cursor) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  // 初始保持隐藏：绝不在屏幕中央凭空显示光标。只有用户真正移动鼠标（mousemove）、
  // 或鼠标从窗口外重新移入（mouseenter，事件自带真实坐标）时，光标才在鼠标所在位置直接出现，
  // 不做从中央飞过去的动画。鼠标移出窗口则隐藏。
  let mouseX = 0, mouseY = 0
  let curX = 0, curY = 0
  let hasPointer = false   // 本次加载后是否拿到过真实鼠标位置
  let visible = false
  let lastTime = performance.now()
  let rafId = null

  function showAt(x, y) {
    mouseX = x; mouseY = y
    curX = x; curY = y   // 直接落在鼠标位置，不从上一个位置（含屏幕中央）滑行
    cursor.style.left = curX + 'px'
    cursor.style.top = curY + 'px'
    cursor.classList.remove('hidden')
    visible = true
    hasPointer = true
  }

  on(document, 'mousemove', e => {
    // iframe 弹层打开期间主页光标一律隐藏，避免与子页面光标重叠 / 残留
    if (document.body.classList.contains('card-open') || document.body.classList.contains('music-open')) return
    if (!visible) {
      showAt(e.clientX, e.clientY)
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
      hasPointer = true
    }
  })

  on(document, 'mouseleave', () => {
    cursor.classList.add('hidden')
    visible = false
  })
  // 鼠标从窗口外移入：在进入瞬间的真实位置显示，不猜测屏幕中央
  on(document, 'mouseenter', e => {
    // 从窗口顶部边界（浏览器 UI 方向）重新移入时鼠标往往落在 iframe 上：
    // 父文档不会再收到 mousemove，若唤出父光标它将冻结在顶端形成残留，弹层期间直接忽略。
    if (!visible && !(document.body.classList.contains('card-open') || document.body.classList.contains('music-open'))) showAt(e.clientX, e.clientY)
  })
  // 窗口重新获得焦点 / bfcache 后退恢复：仅当本页之前已经拿到过鼠标位置时，
  // 才在上次的位置恢复；从未移动过鼠标就继续保持隐藏（绝不在中央出现）
  function restoreCursor() {
    if (hasPointer && !visible && !(document.body.classList.contains('card-open') || document.body.classList.contains('music-open'))) showAt(mouseX, mouseY)
  }
  on(window, 'focus', restoreCursor)
  on(window, 'pageshow', restoreCursor)

  on(document, 'mousedown', () => {
    cursor.style.width = '20px'
    cursor.style.height = '20px'
    cursor.style.marginLeft = '-10px'
    cursor.style.marginTop = '-10px'
  })
  on(document, 'mouseup', () => {
    cursor.style.width = '16px'
    cursor.style.height = '16px'
    cursor.style.marginLeft = '-8px'
    cursor.style.marginTop = '-8px'
  })

  function animate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    // 弹层打开期间：持续保证父光标处于隐藏状态（关闭后由下一次真实 mousemove 再唤出）
    if (document.body.classList.contains('card-open') || document.body.classList.contains('music-open')) {
      if (visible) { cursor.classList.add('hidden'); visible = false }
      rafId = requestAnimationFrame(animate)
      return
    }
    const smoothing = 1000000000000000
    const t = 1 - Math.exp(-smoothing * dt)
    curX += (mouseX - curX) * t
    curY += (mouseY - curY) * t
    cursor.style.left = curX + 'px'
    cursor.style.top = curY + 'px'
    rafId = requestAnimationFrame(animate)
  }
  rafId = requestAnimationFrame(animate)

  cleanupFns.push(() => { if (rafId) cancelAnimationFrame(rafId) })
})

onBeforeUnmount(() => {
  cleanupFns.forEach(fn => { try { fn() } catch (e) {} })
})
</script>

<template>
  <div id="cursor" class="xs-hidden hidden"></div>
</template>
