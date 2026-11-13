<script setup>
/**
 * 点击彩屑粒子
 * 对应原 index.html 中 createParticle 脚本：页面任意点击处迸发 18 颗彩色粒子。
 */
import { onMounted, onBeforeUnmount } from 'vue'

const COLORS = ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#0099ff', '#0000ff', '#9900ff', '#ff66cc']

function createParticle(x, y) {
  const wrap = document.getElementById('particles')
  if (!wrap) return
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    const size = Math.random() * 10 + 6
    const angle = (Math.PI * 2 / 18) * i + Math.random() * 0.5
    const dis = Math.random() * 100 + 50
    const tx = Math.cos(angle) * dis
    const ty = Math.sin(angle) * dis
    p.style.left = x + 'px'
    p.style.top = y + 'px'
    p.style.width = size + 'px'
    p.style.height = size + 'px'
    p.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    p.style.setProperty('--tx', tx + 'px')
    p.style.setProperty('--ty', ty + 'px')
    wrap.appendChild(p)
    setTimeout(() => p.remove(), 600)
  }
}

function onClick(e) {
  createParticle(e.clientX, e.clientY)
}

onMounted(() => document.addEventListener('click', onClick))
onBeforeUnmount(() => document.removeEventListener('click', onClick))
</script>

<template>
  <div class="particles" id="particles"></div>
</template>
