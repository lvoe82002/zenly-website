<script setup>
/**
 * 数字时钟卡片：日期 / 时间 / 天气
 * 对应原 index.html 中「数字时钟」与「天气逻辑」脚本，
 * 以及手机端时钟卡片按压回弹（触摸事件手动加 .is-pressed）。
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fetchWeather } from '../composables/useWeather'

const clockDate = ref('----年--月--日 星期-')
const clockText = ref('--:--:--')

const weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function updateDigitalClock() {
  const now = new Date()
  clockDate.value =
    `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${weekArr[now.getDay()]}`
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  clockText.value = `${hh}:${mm}:${ss}`
}

let timer = null

/* 手机端时钟卡片按压回弹：QQ/微信等内置浏览器里普通 div 的 :active 不触发，用触摸事件手动加 .is-pressed */
function bindPressEffect() {
  const card = document.querySelector('.digital-clock-card')
  if (!card) return
  let pressed = false
  function press() { if (!pressed) { pressed = true; card.classList.add('is-pressed') } }
  function release() { if (pressed) { pressed = false; card.classList.remove('is-pressed') } }
  card.addEventListener('touchstart', press, { passive: true })
  card.addEventListener('touchmove', release, { passive: true })
  card.addEventListener('touchend', release, { passive: true })
  card.addEventListener('touchcancel', release, { passive: true })
}

onMounted(() => {
  updateDigitalClock()
  timer = setInterval(updateDigitalClock, 1000)
  bindPressEffect()
  fetchWeather()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="digital-clock-card">
    <div class="clock-date" id="clockDate">{{ clockDate }}</div>
    <div class="clock-time" id="clockText">{{ clockText }}</div>
    <div class="clock-weather" id="clockWeather">正在定位…</div>
  </div>
</template>
