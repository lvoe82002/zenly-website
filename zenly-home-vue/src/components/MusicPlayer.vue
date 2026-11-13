<script setup>
/**
 * 全局音乐播放器（Folia 版）
 * - 点击左下角按钮弹出 Folia 播放器（https://folia-web.zenlydsp.top）；
 * - 网易云扫码登录 / 听歌全部由 Folia 承担，无需自建 Meting-API；
 * - 首次打开时注入 iframe（懒加载），关闭只隐藏、不销毁。
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

const modalShow = ref(false)
const fabExpanded = ref(false)
const root = ref(null)

function openMusicModal() {
  modalShow.value = true
  fabExpanded.value = true
  document.body.classList.add('music-open')
  if (root.value && !root.value.querySelector('iframe')) {
    root.value.innerHTML =
      '<div class="music-player-card" style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;border-radius:0;">' +
      '<iframe src="https://folia-web.zenlydsp.top" title="Folia 音乐播放器" loading="lazy" allow="autoplay; fullscreen" ' +
      'style="display:block;width:100%;height:100%;border:0;background:#09090b;"></iframe>' +
      '</div>'
  }
}

function closeMusicModal() {
  modalShow.value = false
  fabExpanded.value = false
  document.body.classList.remove('music-open')

  // 关闭弹窗后，先将圆圈光标隐藏，等用户下一次真实移动鼠标时再重新唤醒
  const pc = document.getElementById('cursor')
  if (pc) pc.classList.add('hidden')
}

function onModalClick(e) {
  if (e.target && e.target.id === 'musicModal') closeMusicModal()
}

function onKeydown(e) {
  if (e.key === 'Escape') closeMusicModal()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- 左下角音乐入口：固定在版权栏上方 -->
  <button id="musicFab" class="music-fab" type="button" aria-label="打开音乐播放器" :aria-expanded="fabExpanded" aria-controls="musicModal" @click="openMusicModal">
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- 已修正居中，scale后面数字仍可调整大小：1.25是放大25%，想更大就改成1.3/1.4 -->
      <path transform="translate(12 12) scale(1.65) translate(-11.18 -12)" d="M8.8 5.5c-.93 0-1.55.62-1.55 1.55v9.9c0 .93.62 1.55 1.55 1.55s1.55-.62 1.55-1.55v-3.35h3.1c.93 0 1.55-.62 1.55-1.55s-.62-1.55-1.55-1.55h-3.1v-1.7h4.75c.93 0 1.55-.62 1.55-1.55s-.62-1.55-1.55-1.55h-4.75V7.05c0-.93-.62-1.55-1.55-1.55z"/>
    </svg>
  </button>

  <!-- 居中音乐播放器弹窗 -->
  <div id="musicModal" class="music-modal" :class="{ show: modalShow }" :aria-hidden="modalShow ? 'false' : 'true'" @click="onModalClick">
    <div class="music-modal-box" role="dialog" aria-modal="true" aria-label="音乐播放器">
      <button id="musicModalClose" class="music-modal-close" type="button" aria-label="关闭音乐播放器" @click="closeMusicModal">&times;</button>
      <div id="musicPlayer" ref="root"></div>
    </div>
  </div>
</template>
