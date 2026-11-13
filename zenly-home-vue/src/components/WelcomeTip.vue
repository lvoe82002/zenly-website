<script setup>
/**
 * 问候语气泡 + 右键提示气泡
 * 逻辑见 useWelcome.js；页面揭幕后由 LoadingScreen 调用 tryShowWelcomeAfterLoad
 */
import { onMounted } from 'vue'
import { initRightClickTip } from '../composables/useWelcome'

onMounted(() => {
  initRightClickTip()
})
</script>

<template>
  <div class="float-tip-top" id="welcomeTip">
    <span class="tip-icon">i</span>
    <span id="welcomeTipText">早上好 欢迎来到我的主页</span>
  </div>

  <div class="float-tip-top" id="rightTipTop">
    <span class="tip-icon">i</span>
    <span>为了浏览体验，本站禁用右键</span>
  </div>
</template>
