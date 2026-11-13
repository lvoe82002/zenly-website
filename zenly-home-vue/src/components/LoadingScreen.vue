<script setup>
/**
 * 加载屏：模糊渐清揭幕
 * 等页面 load + 壁纸图片真正下载完成后，再拉开帷幕，壁纸和全部内容一起由模糊渐变清晰
 * （6 秒兜底，防止卡死；1.2s 深色幕布兜底，手机慢网也不黑屏）
 */
import { ref, onMounted } from 'vue'
import { settingsState, getWallpaperUrl } from '../composables/useSettings'
import { tryShowWelcomeAfterLoad } from '../composables/useWelcome'

const removed = ref(false)

function getInitialWallpaperUrl() {
  return getWallpaperUrl(settingsState.wallpaper)
}

function waitWindowLoad() {
  return new Promise(resolve => {
    if (document.readyState === 'complete') return resolve()
    window.addEventListener('load', resolve)
  })
}

function waitWallpaperReady() {
  return new Promise(resolve => {
    let finished = false
    const finish = () => { if (!finished) { finished = true; resolve() } }
    const img = new Image()
    img.onload = finish
    img.onerror = finish
    img.src = getInitialWallpaperUrl()
    setTimeout(finish, 6000)
  })
}

let revealed = false
function startReveal() {
  if (revealed) return
  revealed = true
  document.body.classList.add('loading')      // 左右黑幕向两侧拉开
  document.body.classList.add('page-clear')   // 壁纸 + 全部内容模糊渐清
  document.body.classList.remove('pre-blur')
  setTimeout(() => {
    removed.value = true
    tryShowWelcomeAfterLoad()
  }, 700)
}

let firstPageshow = true
function onPageshow() {
  if (firstPageshow) { firstPageshow = false; return }
  // 返回/历史恢复：不管之前是否揭幕过，都无条件恢复到清晰可见，并立刻移除可能残留的深色幕布
  revealed = true
  removed.value = true
  document.body.classList.add('loading', 'page-clear')
  document.body.classList.remove('pre-blur')
  const wp = document.getElementById('wallpaper-layer')
  requestAnimationFrame(function () {
    if (!wp) return
    wp.style.transform = 'translateZ(0) scale(1.001)'
    requestAnimationFrame(function () { wp.style.transform = '' })
  })
}

onMounted(() => {
  // 正常：等 load + 壁纸就绪再揭幕，首屏依旧是「模糊渐清」的效果
  Promise.all([waitWindowLoad(), waitWallpaperReady()]).then(() => {
    setTimeout(startReveal, 300)
  })
  // 兜底：随机壁纸/外部资源在手机上偏慢时，绝不让深色幕布一直盖住——最多 1.2s 必拉开
  setTimeout(startReveal, 1200)
  // 从外部整页链接返回（bfcache 历史恢复）
  window.addEventListener('pageshow', onPageshow)
})
</script>

<template>
  <div v-if="!removed" id="loading-box">
    <div class="loading-left-bg"></div>
    <div class="loading-right-bg"></div>
    <div class="spinner-box">
      <div class="loader">
        <div class="inner one"></div>
        <div class="inner two"></div>
        <div class="inner three"></div>
      </div>
      <div class="loading-word">
        <p class="loading-title">阿修の主页</p><span id="loading-text">加载中…</span>
      </div>
    </div>
  </div>
</template>
