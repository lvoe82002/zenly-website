<script setup>
/**
 * 卡片全屏弹层容器
 * 弹层逻辑（打开/关闭/历史回退/特效暂停恢复）见 useCardFrame.js，
 * 本组件只负责渲染遮罩与 iframe 并初始化监听。
 */
import { onMounted } from 'vue'
import { initCardFrame } from '../composables/useCardFrame'

onMounted(() => {
  initCardFrame()
})
</script>

<template>
  <!-- 卡片全屏弹层：站内页面在 iframe 内打开，主页常驻不卸载、音乐不中断；站外链接由 goTo 新标签打开，同样不卸载主页 -->
  <div id="cardFrameMask">
    <iframe id="cardFrame" title="card" referrerpolicy="no-referrer"></iframe>
  </div>
</template>
