<script setup>
/**
 * 根组件：按原 index.html 的 body 结构顺序组装全部模块
 * （模糊渐清/加载屏/问候语/光标/天气特效/粒子/时钟/一言/Logo/社交栏/时光胶囊/设置面板/网站列表/公告/音乐/卡片弹层/汉堡菜单）
 */
import { ref, onMounted } from 'vue'
import { goHome } from './composables/useCardFrame'
import LoadingScreen from './components/LoadingScreen.vue'
import WelcomeTip from './components/WelcomeTip.vue'
import TopTip from './components/TopTip.vue'
import WeatherEffects from './components/WeatherEffects.vue'
import CustomCursor from './components/CustomCursor.vue'
import Particles from './components/Particles.vue'
import ClockWeather from './components/ClockWeather.vue'
import HitokotoCard from './components/HitokotoCard.vue'
import LogoBadge from './components/LogoBadge.vue'
import SocialLinks from './components/SocialLinks.vue'
import TimeCapsule from './components/TimeCapsule.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import NavCards from './components/NavCards.vue'
import NoticeSystem from './components/NoticeSystem.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import CardFrame from './components/CardFrame.vue'
import MobileMenuToggle from './components/MobileMenuToggle.vue'
import { initPcLayout } from './composables/usePcLayout'
import { initProtection } from './composables/useProtection'

/* 全局设置面板开关（TimeCapsule 齿轮 / 壁纸卡片双击） */
const settingsVisible = ref(false)

function openSettings() { settingsVisible.value = true }
function closeSettings() { settingsVisible.value = false }

onMounted(() => {
  initPcLayout()
  initProtection()
})
</script>

<template>
  <!-- 视觉层 -->
  <div id="wallpaper-layer"></div>
  <WeatherEffects />
  <CustomCursor />
  <Particles />

  <!-- 加载屏 -->
  <LoadingScreen />

  <!-- 气泡提示 -->
  <WelcomeTip />
  <TopTip />

  <!-- 主内容区 -->
  <div class="main-container" id="mainContainer">
    <ClockWeather />
    <HitokotoCard />
    <LogoBadge />
    <div id="noticeMountMobile"></div>
    <SocialLinks />
    <TimeCapsule @open-settings="openSettings" />
    <NavCards />
    <div class="footer-text" id="footerText">
      © 2026 <span class="footer-name">Mi Manchi</span> · <span id="statAgeFooter">--</span>
    </div>
  </div>

  <!-- 功能层 -->
  <NoticeSystem />
  <MusicPlayer />
  <CardFrame />
  <SettingsPanel :visible="settingsVisible" @close="closeSettings" />
  <MobileMenuToggle />
</template>
