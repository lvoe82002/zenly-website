<script setup>
/**
 * 一言卡片：点击卡片换一句（500ms 防抖）
 * 对应原 index.html 中「一言卡片脚本」。
 */
import { ref, onMounted } from 'vue'

const hitokotoText = ref('这里应该显示一句话')
const hitokotoFrom = ref('-「 阿修 」')

let debounceTimer = null

function fetchHitokoto() {
  fetch('https://v1.hitokoto.cn?c=d&c=a&c=k')
    .then(res => res.json())
    .then(data => {
      hitokotoText.value = data.hitokoto
      hitokotoFrom.value = '-「 ' + data.from + ' 」'
    })
    .catch(() => {
      hitokotoText.value = '一言获取失败'
      hitokotoFrom.value = ''
    })
}

function refresh() {
  hitokotoText.value = '新的一言正在赶来的路上'
  hitokotoFrom.value = '来源加载中'
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchHitokoto, 500)
}

onMounted(fetchHitokoto)
</script>

<template>
  <div class="hitokoto-side">
    <div class="hitokoto-card" id="hitokotoCard" @click="refresh">
      <div class="hitokoto-content" id="hitokotoContent">
        <span class="hitokoto-text" id="hitokotoText">{{ hitokotoText }}</span>
        <span class="hitokoto-from" id="hitokotoFrom">{{ hitokotoFrom }}</span>
      </div>
    </div>
  </div>
</template>
