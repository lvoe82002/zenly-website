<script setup>
/**
 * 全局设置面板
 *
 * 对应原 index.html 中「全局设置面板」脚本：
 * - 壁纸设置 / 特效设置（单选组）
 * - 小破站诞生记（建站日期显示开关）
 * - 其他设置（占位）
 * - 更新日志、折叠手风琴、面板专属 Toast、Github 入口
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  settingsState,
  WALLPAPER_OPTIONS,
  EFFECT_OPTIONS,
  applyWallpaper,
  applyEffect,
  applyDateShow
} from '../composables/useSettings'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

/* ===== 面板开关：同步 body.settings-open 类 ===== */
watch(() => props.visible, v => {
  document.body.classList.toggle('settings-open', v)
}, { immediate: true })

function closeSettings() {
  emit('close')
}

function onOverlayClick(e) {
  if (e.target && e.target.id === 'settingsOverlay') closeSettings()
}

/* ===== 折叠手风琴 ===== */
const activeItem = ref('1')
function toggleCollapse(name) {
  activeItem.value = activeItem.value === name ? '' : name
}

/* ===== 面板专属 Toast ===== */
const toast = ref({ show: false, text: '壁纸设置成功' })
let toastTimer = null
function showSetToast(msg) {
  toast.value.text = msg
  toast.value.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value.show = false }, 1800)
}

/* ===== 单选组：壁纸 / 特效 ===== */
function pickWallpaper(v) {
  if (settingsState.wallpaper === v) return
  applyWallpaper(v)
  showSetToast('壁纸设置成功')
}
function pickEffect(v) {
  if (settingsState.effect === v) return
  applyEffect(v)
  showSetToast('特效设置成功')
}

/* ===== 建站日期开关 ===== */
function toggleDateShow() {
  applyDateShow(!settingsState.dateShow)
}

/* ===== Github 入口：悬停显示 / 触摸显示文字 ===== */
const githubHover = ref(false)
const githubLabel = ref(false)
let lastPointerType = 'mouse'

function onPointerDown(e) {
  lastPointerType = e.pointerType
}
function onPointerEnter(e) {
  if (e.pointerType === 'mouse' || e.pointerType === 'pen') githubHover.value = true
}
function onPointerLeave(e) {
  if (e.pointerType === 'mouse' || e.pointerType === 'pen') githubHover.value = false
}
function onGithubClick(e) {
  e.stopPropagation()
  if (lastPointerType === 'touch') githubLabel.value = true
  window.open('https://github.com/lvoe82002/zenly-website', '_blank')
}

/* 手机端：点击图标以外的任意位置，文字收起；电脑端不受影响 */
function onDocClick(e) {
  const btn = document.getElementById('settingsGithubBtn')
  if (btn && !btn.contains(e.target)) githubLabel.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

/* ===== 更新日志 ===== */
const SET_ICON = {
  add: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M24 16V32" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 24L32 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bug: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 42C36 42 38 31.5324 38 28C38 24.8379 38 20.1712 38 14H10C10 17.4423 10 22.109 10 28C10 31.4506 12 42 24 42Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M4 8L10 14" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 8L38 14" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 27H10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 27H38" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 44L13 38" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M41 44L35 38" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42V14" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.9204 39.0407C17.0024 40.783 19.9244 41.9998 23.9999 41.9998C28.1112 41.9998 31.0487 40.7712 33.1341 39.0137" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12.3333C32 7.73096 28.4183 4 24 4C19.5817 4 16 7.73096 16 12.3333V14H32V12.3333Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>'
}
const SET_LOG = {
  new: ['采用 Vue 进行重构', '接入 Folia 音乐播放器 支持扫码登录', '音乐歌单支持快速自定义', '壁纸支持个性化设置'],
  fix: ['修复天气 API', '时光胶囊显示错误', '移动端动画及细节', '图标更换为 IconPark']
}
const upnotes = [...SET_LOG.new.map(t => ({ icon: 'add', t })), ...SET_LOG.fix.map(t => ({ icon: 'bug', t }))]
</script>

<template>
  <div id="settingsOverlay" :class="{ hidden: !visible }" @click="onOverlayClick">
    <div class="set" id="setPanel">
      <!-- 关闭 -->
      <span class="close" id="settingsCloseBtn" title="关闭" @click="closeSettings">
        <svg viewBox="0 0 48 48" fill="none"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="rgba(255,255,255,.376)" stroke="rgba(255,255,255,.376)" stroke-width="4" stroke-linejoin="round"/><path d="M29.6567 18.3432L18.343 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.3433 18.3432L29.657 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>

      <div class="panel-row">
        <!-- ===== 左列 ===== -->
        <div class="col-left">
          <div class="logo">
            <span class="big">zenlydsp</span><span class="sm">.top</span>
          </div>

          <div>
            <div class="version">
              <span class="num">z 4.0.3</span>
              <span
                class="github"
                id="settingsGithubBtn"
                :class="{ 'is-hover': githubHover, 'show-label': githubLabel }"
                @pointerdown="onPointerDown"
                @pointerenter="onPointerEnter"
                @pointerleave="onPointerLeave"
                @click="onGithubClick"
              >
                <svg viewBox="0 0 48 48" fill="none"><path d="M29.3444 30.4765C31.7481 29.977 33.9292 29.1108 35.6247 27.8391C38.5202 25.6676 40 22.3136 40 18.9999C40 16.6752 39.1187 14.505 37.5929 12.6668C36.7427 11.6425 39.2295 3.99989 37.02 5.02919C34.8105 6.05848 31.5708 8.33679 29.8726 7.83398C28.0545 7.29565 26.0733 6.99989 24 6.99989C22.1992 6.99989 20.4679 7.22301 18.8526 7.6344C16.5046 8.23237 14.2591 5.99989 12 5.02919C9.74086 4.05848 10.9736 11.9632 10.3026 12.7944C8.84119 14.6051 8 16.7288 8 18.9999C8 22.3136 9.79086 25.6676 12.6863 27.8391C14.6151 29.2857 17.034 30.2076 19.7401 30.6619" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M19.7397 30.6619C18.5812 31.937 18.002 33.1478 18.002 34.2944C18.002 35.441 18.002 38.3464 18.002 43.0106" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M29.3446 30.4766C30.4423 31.9174 30.9912 33.211 30.9912 34.3576C30.9912 35.5042 30.9912 38.3885 30.9912 43.0107" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M6 31.2155C6.89887 31.3254 7.56554 31.7387 8 32.4554C8.65169 33.5303 11.0742 37.518 13.8251 37.518C15.6591 37.518 17.0515 37.518 18.0024 37.518" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                <span class="github-label">Github 源代码仓库</span>
              </span>
            </div>

            <div class="update">
              <div class="card-header">更新日志</div>
              <div class="card-body">
                <div class="upnote" id="setUpnote">
                  <div v-for="(n, i) in upnotes" :key="i" class="uptext">
                    <span class="i-icon" v-html="SET_ICON[n.icon]"></span><span>{{ n.t }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 右列 ===== -->
        <div class="col-right">
          <div class="right-title">
            <span class="i-icon">
              <svg viewBox="0 0 48 48" fill="none"><path d="M18.2838 43.1713C14.9327 42.1736 11.9498 40.3213 9.58787 37.867C10.469 36.8227 11 35.4734 11 34.0001C11 30.6864 8.31371 28.0001 5 28.0001C4.79955 28.0001 4.60139 28.01 4.40599 28.0292C4.13979 26.7277 4 25.3803 4 24.0001C4 21.9095 4.32077 19.8938 4.91579 17.9995C4.94381 17.9999 4.97188 18.0001 5 18.0001C8.31371 18.0001 11 15.3138 11 12.0001C11 11.0488 10.7786 10.1493 10.3846 9.35011C12.6975 7.1995 15.5205 5.59002 18.6521 4.72314C19.6444 6.66819 21.6667 8.00013 24 8.00013C26.3333 8.00013 28.3556 6.66819 29.3479 4.72314C32.4795 5.59002 35.3025 7.1995 37.6154 9.35011C37.2214 10.1493 37 11.0488 37 12.0001C37 15.3138 39.6863 18.0001 43 18.0001C43.0281 18.0001 43.0562 17.9999 43.0842 17.9995C43.6792 19.8938 44 21.9095 44 24.0001C44 25.3803 43.8602 26.7277 43.594 28.0292C43.3986 28.01 43.2005 28.0001 43 28.0001C39.6863 28.0001 37 30.6864 37 34.0001C37 35.4734 37.531 36.8227 38.4121 37.867C36.0502 40.3213 33.0673 42.1736 29.7162 43.1713C28.9428 40.752 26.676 39.0001 24 39.0001C21.324 39.0001 19.0572 40.752 18.2838 43.1713Z" fill="rgba(255,255,255,.376)" stroke="rgba(255,255,255,.376)" stroke-width="4" stroke-linejoin="round"/><path d="M24 31C27.866 31 31 27.866 31 24C31 20.134 27.866 17 24 17C20.134 17 17 20.134 17 24C17 27.866 20.134 31 24 31Z" fill="#FFF" stroke="#FFF" stroke-width="4" stroke-linejoin="round"/></svg>
            </span>
            <span>全局设置</span>
          </div>

          <div class="collapse" id="setCollapse">
            <!-- 壁纸设置 -->
            <div class="collapse-item" :class="{ active: activeItem === '1' }" data-name="1">
              <div class="collapse-item__header" @click="toggleCollapse('1')">
                壁纸设置
                <span class="arrow"><svg viewBox="0 0 48 48" fill="none"><path d="M14 20L24 30L34 20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </div>
              <div class="collapse-item__wrap">
                <div class="collapse-item__content">
                  <div class="bg-set">
                    <div class="radio-group" id="wallpaperRadioGroup">
                      <div
                        v-for="c in WALLPAPER_OPTIONS"
                        :key="c.v"
                        class="radio"
                        :class="{ 'is-checked': settingsState.wallpaper === c.v }"
                        :data-v="c.v"
                        role="radio"
                        :aria-checked="settingsState.wallpaper === c.v"
                        @click="pickWallpaper(c.v)"
                      >
                        <span class="dot"></span><span class="label">{{ c.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 特效设置 -->
            <div class="collapse-item" :class="{ active: activeItem === '2' }" data-name="2">
              <div class="collapse-item__header" @click="toggleCollapse('2')">
                特效设置
                <span class="arrow"><svg viewBox="0 0 48 48" fill="none"><path d="M14 20L24 30L34 20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </div>
              <div class="collapse-item__wrap">
                <div class="collapse-item__content">
                  <div class="bg-set">
                    <div class="radio-group" id="effectRadioGroup">
                      <div
                        v-for="c in EFFECT_OPTIONS"
                        :key="c.v"
                        class="radio"
                        :class="{ 'is-checked': settingsState.effect === c.v }"
                        :data-effect="c.v"
                        role="radio"
                        :aria-checked="settingsState.effect === c.v"
                        @click="pickEffect(c.v)"
                      >
                        <span class="dot"></span><span class="label">{{ c.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 小破站诞生记 -->
            <div class="collapse-item" :class="{ active: activeItem === '3' }" data-name="3">
              <div class="collapse-item__header" @click="toggleCollapse('3')">
                小破站诞生记
                <span class="arrow"><svg viewBox="0 0 48 48" fill="none"><path d="M14 20L24 30L34 20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </div>
              <div class="collapse-item__wrap">
                <div class="collapse-item__content">
                  <div class="item">
                    <span class="text">建站日期显示</span>
                    <button
                      class="switch"
                      :class="{ 'is-on': settingsState.dateShow }"
                      id="siteSwitch"
                      type="button"
                      :aria-checked="settingsState.dateShow"
                      @click="toggleDateShow"
                    >
                      <span class="action">
                        <svg class="icon-check" viewBox="0 0 48 48" fill="none"><path d="M10 24L20 34L40 14" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg class="icon-close" viewBox="0 0 48 48" fill="none"><path d="M14 14L34 34M14 34L34 14" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他设置 -->
            <div class="collapse-item" :class="{ active: activeItem === '4' }" data-name="4">
              <div class="collapse-item__header" @click="toggleCollapse('4')">
                其他设置
                <span class="arrow"><svg viewBox="0 0 48 48" fill="none"><path d="M14 20L24 30L34 20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </div>
              <div class="collapse-item__wrap">
                <div class="collapse-item__content"><div class="placeholder">设置内容待作者增加</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 面板专属 Toast -->
  <div class="set-toast" id="setToast" :class="{ show: toast.show }">
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M24 16V26" stroke="#333" stroke-width="4" stroke-linecap="round"/><path d="M24 32L24 34" stroke="#333" stroke-width="4" stroke-linecap="round"/></svg>
    <span id="setToastText">{{ toast.text }}</span>
  </div>
</template>
