<script setup>
/**
 * 手机端汉堡菜单开关
 * 对应原 index.html 中「手机端汉堡菜单切换」脚本。
 */
function toggle(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.toggle('mobile-menu-open')
}
</script>

<template>
  <div class="mobile-menu-toggle" id="mobileMenuToggle" @click="toggle">
    <i class="fa-solid fa-bars icon-menu"></i>
    <i class="fa-solid fa-xmark icon-close"></i>
  </div>
</template>
