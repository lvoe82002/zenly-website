<script setup>
/**
 * 顶部提醒气泡（site-tip）
 * 由 useTipQueue 单例驱动：showSiteTip / enqueueTopTip 任意组件可调用
 */
import { siteTip } from '../composables/useTipQueue'
</script>

<template>
  <div class="float-tip-top site-tip" :class="{ show: siteTip.show, 'float-tip-out': siteTip.out }">
    <span class="tip-icon" :class="{ 'is-svg': !!siteTip.iconSvg }" v-html="siteTip.iconSvg || siteTip.icon"></span>
    <span class="site-tip-text">{{ siteTip.text }}</span>
  </div>
</template>
