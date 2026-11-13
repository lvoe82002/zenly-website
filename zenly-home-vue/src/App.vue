<script setup>
/**
 * 根组件：Mi Manchi 主页
 *
 * 组件拆分（对应原 index.html 的 body 结构）：
 * - LoadingScreen   加载屏（模糊渐清揭幕）
 * - WelcomeTip      问候语气泡 + 右键提示
 * - TopTip          顶部提醒气泡（site-tip，由 useTipQueue 单例驱动）
 * - WeatherEffects  雪花 / 下雨 / 打雷 canvas
 * - CustomCursor    自定义圆圈光标（仅 PC）
 * - HitokotoCard    一言卡片
 * - LogoBadge       中央 Logo
 * - TimeCapsule     站点徽章 + 时光胶囊弹层
 * - SettingsPanel   全局设置面板
 * - NavCards        网站列表卡片（分页）
 * - SocialLinks     社交链接栏
 * - NoticeSystem    公告组件（Teleport 入口 + 列表/详情/toast）
 * - ClockWeather    数字时钟 + 天气
 * - Particles       点击彩屑粒子
 * - MobileMenuToggle 手机端汉堡菜单
 * - CardFrame       卡片全屏 iframe 弹层
 * - MusicPlayer     Folia 音乐播放器
 */
import { ref, onMounted } from 'vue'
import LoadingScreen from './components/LoadingScreen.vue'
import WelcomeTip from './components/WelcomeTip.vue'
import TopTip from './components/TopTip.vue'
import WeatherEffects from './components/WeatherEffects.vue'
import CustomCursor from './components/CustomCursor.vue'
import HitokotoCard from './components/HitokotoCard.vue'
import LogoBadge from './components/LogoBadge.vue'
import TimeCapsule from './components/TimeCapsule.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import NavCards from './components/NavCards.vue'
import SocialLinks from './components/SocialLinks.vue'
import NoticeSystem from './components/NoticeSystem.vue'
import ClockWeather from './components/ClockWeather.vue'
import Particles from './components/Particles.vue'
import MobileMenuToggle from './components/MobileMenuToggle.vue'
import CardFrame from './components/CardFrame.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import { settingsState, applyWallpaper, applyEffect } from './composables/useSettings'
import { initPcLayout } from './composables/usePcLayout'
import { useProtection } from './composables/useProtection'

const settingsVisible = ref(false)

onMounted(() => {
  // 初始壁纸 / 特效（子组件 canvas 已挂载，此处设置可见性与背景）
  applyWallpaper(settingsState.wallpaper)
  applyEffect(settingsState.effect)
  // PC 端垂直居中布局（≥1025px 才生效）
  initPcLayout()
  // PC 端防复制
  useProtection()
})
</script>

<template>
  <!-- 壁纸层 -->
  <div id="wallpaper-layer" aria-hidden="true"></div>

  <!-- 加载屏 -->
  <LoadingScreen />

  <!-- 顶部留白（PC 布局脚本动态调整高度） -->
  <div class="top-empty-space"></div>

  <!-- 问候语 + 右键提示 -->
  <WelcomeTip />

  <!-- 顶部提醒气泡（site-tip） -->
  <TopTip />

  <!-- 天气特效画布 -->
  <WeatherEffects />

  <!-- 自定义光标 -->
  <CustomCursor />

  <div class="footer-box">
    <div class="bottom-area-wrapper">
      <!-- 一言卡片 -->
      <HitokotoCard />

      <!-- 中央 Logo -->
      <LogoBadge />

      <!-- 站点徽章 + 时光胶囊 -->
      <TimeCapsule @open-settings="settingsVisible = true" />

      <!-- 全局设置面板 -->
      <SettingsPanel :visible="settingsVisible" @close="settingsVisible = false" />

      <!-- 网站列表 -->
      <NavCards />

      <!-- 社交链接栏 -->
      <SocialLinks />

      <!-- 手机端公告入口挂载点：社交信息栏正下方居中（电脑端为空；公告组件用 Teleport 在两个挂载点之间迁移） -->
      <div id="noticeMountMobile"></div>

      <!-- 数字时钟 + 天气 -->
      <ClockWeather />
    </div>

    <div class="copyright-bar">
      <span class="copyright-text">Copyright © 2026 小阿修 & Made by <a class="copyright-link" href="https://github.com/lvoe82002/zenly-website" target="_blank" rel="noopener noreferrer">zenlydsp</a></span>
    </div>
  </div>

  <!-- 公告组件：通知列表面板 / 详情模态框 / toast / 模板图片 -->
  <NoticeSystem />

  <!-- 点击彩屑粒子 -->
  <Particles />

  <!-- 手机端汉堡菜单 -->
  <MobileMenuToggle />

  <!-- 卡片全屏弹层 -->
  <CardFrame />

  <!-- Folia 音乐播放器 -->
  <MusicPlayer />
</template>
