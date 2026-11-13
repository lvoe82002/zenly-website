<script setup>
/**
 * 网站列表卡片：导航按钮 + 分页
 *
 * 对应原 index.html 中「网站列表分页」脚本：
 * 点击底部横线、手机左右滑动 / 电脑鼠标左右拖动来翻页。
 * 站外链接由 useCardFrame.goTo 新标签打开，站内页面由全屏 iframe 弹层打开。
 */
import { ref, onMounted } from 'vue'
import { goTo, goHome } from '../composables/useCardFrame'

const root = ref(null)
const pager = ref(null)
const idx = ref(0)

function go(n) {
  const pages = root.value ? root.value.querySelectorAll('.nav-page') : []
  const dots = pager.value ? pager.value.querySelectorAll('.nav-dot') : []
  n = Math.max(0, Math.min(pages.length - 1, n))
  if (n === idx.value) return
  pages.forEach((p, i) => p.classList.toggle('is-active', i === n))
  dots.forEach((d, i) => d.classList.toggle('is-active', i === n))
  root.value.classList.toggle('at-first', n === 0)
  idx.value = n
}

onMounted(() => {
  /* 手机左右滑动 */
  let sx = 0, sy = 0, tracking = false
  root.value.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true }, { passive: true })
  root.value.addEventListener('touchend', e => {
    if (!tracking) return
    tracking = false
    const t = e.changedTouches[0]
    const dx = t.clientX - sx
    const dy = t.clientY - sy
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(idx.value + (dx < 0 ? 1 : -1))
  }, { passive: true })

  /* 电脑鼠标左右拖动翻页（普通点击按钮不受影响） */
  let mx = 0, down = false
  root.value.addEventListener('mousedown', e => { down = true; mx = e.clientX })
  window.addEventListener('mouseup', e => {
    if (!down) return
    down = false
    const dx = e.clientX - mx
    if (Math.abs(dx) > 60) go(idx.value + (dx < 0 ? 1 : -1))
  })
})
</script>

<template>
  <div class="nav-group-cards">
    <div class="nav-title">
      <svg style="width:1em;height:1em;fill:currentColor;vertical-align:-0.125em;" viewBox="0 0 512 512">
        <path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/>
      </svg>
      <span>网站列表</span>
    </div>
    <div class="nav-pages at-first" ref="root">
      <div class="nav-page is-active">
        <div class="nav-buttons">
          <!-- 电脑端公告入口（公告组件的 Teleport 挂载点） -->
          <div id="noticeMountDesktop"></div>
          <a href="javascript:void(0)" class="nav-btn" @click="goTo('https://blog.zenlydsp.top/')">
            <svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 512 512">
              <path d="M172.2 226.8c-14.6-2.9-28.2 8.9-28.2 23.8V301c0 10.2 7.1 18.4 16.7 22 18.2 6.8 31.3 24.4 31.3 45 0 26.5-21.5 48-48 48s-48-21.5-48-48V120c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24v248c0 89.5 82.1 160.2 175 140.7 54.4-11.4 98.3-55.4 109.7-109.7 17.4-82.9-37-157.2-112.5-172.2zM209 0c-9.2-.5-17 6.8-17 16v31.6c0 8.5 6.6 15.5 15 15.9 129.4 7 233.4 112 240.9 241.5.5 8.4 7.5 15 15.9 15h32.1c9.2 0 16.5-7.8 16-17C503.4 139.8 372.2 8.6 209 0zm.3 96c-9.3-.7-17.3 6.7-17.3 16.1v32.1c0 8.4 6.5 15.3 14.8 15.9 76.8 6.3 138 68.2 144.9 145.2.8 8.3 7.6 14.7 15.9 14.7h32.2c9.3 0 16.8-8 16.1-17.3-8.4-110.1-96.5-198.2-206.6-206.7z"/>
            </svg>
            <span>博客</span>
          </a>
          <a href="https://breeyt.zenlydsp.top/" target="_blank" rel="noopener noreferrer" class="nav-btn"><svg style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18 C7.5 18 7.5 6 12 6 S16.5 15 21 4.5"/><circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/></svg><span>你的一生</span></a>
          <a href="https://home.zenlydsp.top/" target="_blank" rel="noopener noreferrer" class="nav-btn"><svg viewBox="0 0 16 16" style="width:22px;height:22px;" aria-hidden="true"><g fill="none"><path fill="currentColor" d="M11.5286 1.87149C11.5769 1.73005 11.5356 1.5733 11.4233 1.47452C11.0472 1.14247 10.0965 0.443125 8.66911 0.339708C7.07054 0.223769 6.08089 0.652279 5.58096 0.969951C5.36531 1.10676 5.35326 1.41748 5.55499 1.57422L9.62723 4.73936C9.98617 5.01807 10.5125 4.8604 10.6591 4.43003L11.5286 1.87149Z"/><path fill="currentColor" d="M1.49017 11.2664C1.32368 11.3781 1.24855 11.584 1.30235 11.7774C1.45724 12.3339 1.91868 13.4919 3.22833 14.5456C4.53797 15.5992 6.08738 15.7128 6.74962 15.6966C6.94764 15.692 7.12016 15.5617 7.17998 15.3724L9.79046 7.11064C9.97875 6.51425 9.31048 6.01386 8.79154 6.3626L1.49017 11.2664Z"/><path fill="currentColor" d="M3.39813 2.54827C3.27013 2.49773 3.12683 2.50607 3.00579 2.57193C2.52256 2.83488 1.28526 3.64506 0.647135 5.30947C0.154627 6.59222 0.328071 8.01085 0.463488 8.70463C0.508009 8.9314 0.747306 9.06218 0.962489 8.97824L8.79485 5.92024C9.35414 5.70181 9.35646 4.91111 8.7981 4.6899L3.39813 2.54827Z"/><path fill="currentColor" d="M15.0167 8.46843C15.243 8.62194 15.5528 8.48652 15.5922 8.21569C15.6961 7.49872 15.7861 6.25076 15.371 5.30933C14.8177 4.05487 13.8786 3.28133 13.433 2.9669C13.292 2.86766 13.1019 2.87786 12.9725 2.99241L10.9959 4.74541C10.6732 5.03154 10.7066 5.54492 11.0636 5.78746L15.0167 8.46936V8.46843Z"/><path fill="currentColor" d="M9.49413 15.1604C9.47372 15.3937 9.67128 15.5866 9.90409 15.5616C10.6531 15.4813 12.1918 15.1841 13.3447 14.0827C14.467 13.0109 14.832 11.7384 14.9382 11.2319C14.9669 11.0951 14.9326 10.9528 14.8445 10.8442L11.3886 6.57909C11.0143 6.11719 10.2681 6.34535 10.2162 6.93757L9.49366 15.1604H9.49413Z"/></g></svg><span>随机壁纸API</span></a>
          <a href="https://localhost.xn--io0a7i/" target="_blank" rel="noopener noreferrer" class="nav-btn"><i class="fa-solid fa-terminal"></i><span>localhost</span></a>
          <div class="nav-row2">
            <a href="https://www.terseai.org/" target="_blank" rel="noopener noreferrer" class="nav-btn"><svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"></path></svg><span>Terse插件</span></a>
            <a href="https://gitee.com/write-and-repair/termux-rc" target="_blank" rel="noopener noreferrer" class="nav-btn"><svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z"></path></svg><span>Termux</span></a>
            <a href="https://raw.githubusercontent.com/lvoe82002/zenly-website/main/index.html" target="_blank" rel="noopener noreferrer" class="nav-btn"><i class="fa-solid fa-code"></i><span>主页源码</span></a>
            <button type="button" class="nav-btn" @click="goHome()"><i class="fa-regular fa-compass"></i><span>起始页</span></button>
          </div>
        </div>
      </div>
      <!-- 第 2 页：以后要加新网站，把下面这个占位框复制一份、改成你的链接/图标/名字即可 -->
      <div class="nav-page">
        <div class="nav-buttons">
          <a href="https://status.zenlydsp.top/" target="_blank" rel="noopener noreferrer" class="nav-btn"><i class="fa-solid fa-laptop-code"></i><span>站点监测</span></a>
        </div>
      </div>
      <div class="nav-pager" ref="pager">
        <button type="button" class="nav-dot is-active" aria-label="第 1 页" @click="go(0)"></button>
        <button type="button" class="nav-dot" aria-label="第 2 页" @click="go(1)"></button>
      </div>
    </div>
  </div>
</template>
