<script setup>
/**
 * 时光胶囊：站点徽章（Hello World!）+ 时间胶囊弹层
 *
 * 对应原 index.html 中「interactive-badge + capsuleOverlay」脚本：
 * - 点击徽章开合弹层（再点一次关闭），徽章文案随之切换；
 * - 弹层内展示今日/本周/本月/今年进度与建站时长；
 * - 齿轮按钮打开全局设置面板（emit open-settings）。
 */
import { reactive, onMounted } from 'vue'

const emit = defineEmits(['open-settings'])

const badgeTitle = reactive({ text: 'Hello World !' })
const badgeText = reactive({ text: '一个建立于 21 世纪的小破站，存活于三次元的边缘' })

const stats = reactive({
  hours: '今日已经度过了 0 小时',
  hoursPct: 0,
  week: '本周已经度过了 0 天',
  weekPct: 0,
  month: '本月已经度过了 0 天',
  monthPct: 0,
  year: '今年已经度过了 0 个月',
  yearPct: 0,
  age: '本站已经苟活了 -- 年 -- 月 -- 天'
})

let isCapsuleOpen = false
let savedScrollY = 0

const SITE_BIRTH = new Date('2026-08-15')

function updateCapsuleStats() {
  const now = new Date()
  // 今日：按真实时刻
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const hoursExact = (now - midnight) / 3600000
  const dayPct = Math.floor(hoursExact / 24 * 100)
  // 本周：周日算周末 -> 7
  const weekMap = [7, 1, 2, 3, 4, 5, 6]
  const weekDay = weekMap[now.getDay()]
  const weekPct = Math.floor(weekDay / 7 * 100)
  // 本月
  const date = now.getDate()
  const month = now.getMonth() + 1
  const daysInMonth = new Date(now.getFullYear(), month, 0).getDate()
  const monthPct = Math.floor(date / daysInMonth * 100)
  // 今年：按已度过的精确时间
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime()
  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1).getTime()
  const yearPct = Math.floor((now - yearStart) / 3600000 / ((nextYearStart - yearStart) / 3600000) * 100)

  // 建站时长
  let diffYears = now.getFullYear() - SITE_BIRTH.getFullYear()
  let diffMonths = now.getMonth() - SITE_BIRTH.getMonth()
  let diffDays = now.getDate() - SITE_BIRTH.getDate()
  if (diffDays < 0) { diffMonths--; diffDays += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (diffMonths < 0) { diffYears--; diffMonths += 12 }

  stats.hours = `今日已经度过了 ${Math.floor(hoursExact)} 小时`
  stats.hoursPct = dayPct
  stats.week = `本周已经度过了 ${weekDay} 天`
  stats.weekPct = weekPct
  stats.month = `本月已经度过了 ${date} 天`
  stats.monthPct = monthPct
  stats.year = `今年已经度过了 ${month - 1} 个月`
  stats.yearPct = yearPct
  stats.age = `本站已经苟活了 ${diffYears} 年 ${diffMonths} 月 ${diffDays} 天`
}

function toggleCapsule(e) {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  if (isCapsuleOpen) {
    document.body.classList.remove('capsule-open')
    badgeTitle.text = 'Hello World !'
    badgeText.text = '一个建立于 21 世纪的小破站，存活于三次元的边缘'
    isCapsuleOpen = false
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollY)
    })
  } else {
    savedScrollY = window.scrollY
    document.body.classList.add('capsule-open')
    badgeTitle.text = 'Oops !'
    badgeText.text = '\u201C哎呀，这都被你发现了 (再点击一次可关闭)\u201D'
    isCapsuleOpen = true
    updateCapsuleStats()
  }
}

function openSettings(e) {
  e.stopPropagation()
  emit('open-settings')
}

onMounted(() => {
  // 初始即渲染一次统计，弹层首次打开时数据已就绪
  updateCapsuleStats()
})
</script>

<template>
  <!-- 交互徽章 -->
  <div class="interactive-badge" id="siteBadge" @click="toggleCapsule">
    <svg class="badge-q badge-q-l" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z" fill="currentColor"/></svg>
    <div class="badge-body">
      <div class="badge-title" id="badgeTitle">{{ badgeTitle.text }}</div>
      <div class="badge-text" id="badgeText">{{ badgeText.text }}</div>
    </div>
    <svg class="badge-q badge-q-r" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M464 32H336c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48zm-288 0H48C21.5 32 0 53.5 0 80v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48z" fill="currentColor"/></svg>
  </div>

  <!-- 时光胶囊弹层 -->
  <div id="capsuleOverlay">
    <div class="capsule-inner">
      <div class="capsule-header">
        <div class="capsule-title">
          <i class="fa-solid fa-hourglass-half"></i> 时光胶囊
        </div>
        <div class="capsule-actions">
          <div class="capsule-btn setting-btn" title="设置" @click="openSettings"><svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.2838 43.1713C14.9327 42.1736 11.9498 40.3213 9.58787 37.867C10.469 36.8227 11 35.4734 11 34.0001C11 30.6864 8.31371 28.0001 5 28.0001C4.79955 28.0001 4.60139 28.01 4.40599 28.0292C4.13979 26.7277 4 25.3803 4 24.0001C4 21.9095 4.32077 19.8938 4.91579 17.9995C4.94381 17.9999 4.97188 18.0001 5 18.0001C8.31371 18.0001 11 15.3138 11 12.0001C11 11.0488 10.7786 10.1493 10.3846 9.35011C12.6975 7.1995 15.5205 5.59002 18.6521 4.72314C19.6444 6.66819 21.6667 8.00013 24 8.00013C26.3333 8.00013 28.3556 6.66819 29.3479 4.72314C32.4795 5.59002 35.3025 7.1995 37.6154 9.35011C37.2214 10.1493 37 11.0488 37 12.0001C37 15.3138 39.6863 18.0001 43 18.0001C43.0281 18.0001 43.0562 17.9999 43.0842 17.9995C43.6792 19.8938 44 21.9095 44 24.0001C44 25.3803 43.8602 26.7277 43.594 28.0292C43.3986 28.01 43.2005 28.0001 43 28.0001C39.6863 28.0001 37 30.6864 37 34.0001C37 35.4734 37.531 36.8227 38.4121 37.867C36.0502 40.3213 33.0673 42.1736 29.7162 43.1713C28.9428 40.752 26.676 39.0001 24 39.0001C21.324 39.0001 19.0572 40.752 18.2838 43.1713Z" fill="#ffffff60" stroke="#ffffff60" stroke-width="4" stroke-linejoin="round"/><path d="M24 31C27.866 31 31 27.866 31 24C31 20.134 27.866 17 24 17C20.134 17 17 20.134 17 24C17 27.866 20.134 31 24 31Z" fill="#FFF" stroke="#FFF" stroke-width="4" stroke-linejoin="round"/></svg></div>
          <div class="capsule-btn close-btn" title="关闭" @click="toggleCapsule"><svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#ffffff60" stroke="#ffffff60" stroke-width="4" stroke-linejoin="round"/><path d="M29.6567 18.3432L18.343 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.3433 18.3432L29.657 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        </div>
      </div>

      <div class="capsule-body">
        <div class="capsule-item">
          <div class="capsule-label" id="statHours">{{ stats.hours }}</div>
          <div class="progress-track"><div class="progress-fill" id="progHours" :style="{ width: stats.hoursPct + '%' }">{{ stats.hoursPct }}%</div></div>
        </div>
        <div class="capsule-item">
          <div class="capsule-label" id="statWeek">{{ stats.week }}</div>
          <div class="progress-track"><div class="progress-fill" id="progWeek" :style="{ width: stats.weekPct + '%' }">{{ stats.weekPct }}%</div></div>
        </div>
        <div class="capsule-item">
          <div class="capsule-label" id="statMonth">{{ stats.month }}</div>
          <div class="progress-track"><div class="progress-fill" id="progMonth" :style="{ width: stats.monthPct + '%' }">{{ stats.monthPct }}%</div></div>
        </div>
        <div class="capsule-item">
          <div class="capsule-label" id="statYear">{{ stats.year }}</div>
          <div class="progress-track"><div class="progress-fill" id="progYear" :style="{ width: stats.yearPct + '%' }">{{ stats.yearPct }}%</div></div>
        </div>
        <div class="capsule-footer" id="statAge">{{ stats.age }}</div>
      </div>
    </div>
  </div>
</template>
