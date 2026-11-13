<script setup>
/**
 * 公告组件：通知列表 / 详情模态框 / toast / 入口迁移
 *
 * 对应原 index.html 中「公告组件」两个脚本：
 * - 入口（#noticeEntry）在电脑端挂载点 #noticeMountDesktop 与
 *   手机端挂载点 #noticeMountMobile 之间迁移（这里用 Teleport 实现）；
 * - 数据 / 列表 / 详情 / 已读摇动逻辑（演示数据，接真实后端时替换 MOCK）。
 */
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const READ_KEY = 'notice_read_ids'
const PAGE_SIZE = 5

/* ===== 内置数据（模拟 GET /api/notice/list 的真实返回） ===== */
const NOTICE_IMG = 'https://iili.io/nbTMk22.jpg'
const MOCK = {
  total: '1',
  rows: [{
    id: '1',
    title: '开发完成，进入全面测试阶段',
    content: '<p>现在大体都开发完成了，接下来进入全面测试阶段，主要任务就是测试和找 Bug</p>' +
      '<p class="notice-bullet">测试期间如果遇到 Bug、页面显示异常，或者有更好的建议，欢迎通过社交栏下的 QQ 给我留言，也可以到 Github 仓库提 Issue，感谢大家帮忙踩坑～</p>' +
      '<p class="notice-bullet">本次新增了站点监测、Folia音乐播放器、公告通知等功能，欢迎多多体验；测试阶段功能可能随时调整，若遇到显示异常，可尝试强制刷新（电脑端 Ctrl + F5）清除缓存。</p>' +
      '<p class="notice-bullet">站点监测功能现已全面开放使用，会定时探测主页、壁纸API、天气API的连通情况，实时展示各项服务可用状态。当服务连续探测失败，系统自动推送邮件告警，以便及时处理故障。</p>' +
      '<p class="notice-bullet">天气API接口基于高德 IP 定位，需要在 WiFi / 宽带网络下使用；每月5000API配额天气流量包，手机流量或部分公共 WiFi（如校园网）的出口 IP 无法被高德识别时，会提示“天气信息获取失败”，这属于网络环境限制、并非代码问题，切换其它WiFi网络后即可恢复。</p>' +
      '<p><img src="' + NOTICE_IMG + '" alt="nbTMk22.jpg" style="width:375px;max-width:100%;height:auto;margin-top:.9rem;"></p>',
    type: 2, level: 'L', isRead: '0', targetType: '1', targetName: '',
    publisherName: '阿修', publishTime: '2026-09-10 15:28:40'
  }]
}
let page = 1
const list = MOCK.rows.slice()

/* ===== 字典 ===== */
function typeText(t) { return { 1: '站点公告', 2: '系统通知', 3: '功能更新', 4: '活动通知', 5: '其他通知' }[Number(t)] || '其他通知' }
function levelText(l) { const v = String(l || '').toUpperCase(); if (v === 'H' || v === 'HIGH') return '重要'; if (v === 'M' || v === 'MEDIUM') return '提醒'; return '普通' }
function levelClass(l) { const v = String(l || '').toUpperCase(); if (v === 'H' || v === 'HIGH') return 'is-high'; if (v === 'M' || v === 'MEDIUM') return 'is-medium'; return 'is-low' }
function targetText(n) { if (Array.isArray(n)) return n.filter(Boolean).join('、') || '全体用户'; return String(n || '').trim() || '全体用户' }

/* ===== 已读：localStorage ===== */
function getReadIds() { try { const a = JSON.parse(localStorage.getItem(READ_KEY) || '[]'); return Array.isArray(a) ? a.map(String) : [] } catch (e) { return [] } }
function isRead(id) { return getReadIds().indexOf(String(id)) > -1 }
function markRead(id) { const a = getReadIds(), s = String(id); if (a.indexOf(s) < 0) { a.push(s); localStorage.setItem(READ_KEY, JSON.stringify(a)) } }
function effectiveRead(item) { return String(item.isRead) === '1' || isRead(item.id) ? '1' : '0' }

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

/* ===== 状态 ===== */
const popupOpen = ref(false)
const detailOpen = ref(false)
const shake = ref(false)
const popupHtml = ref('')
const detailHtml = ref('')
const toastText = ref('')
const toastShow = ref(false)
let toastTimer = null

function toast(msg) {
  toastText.value = msg
  toastShow.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastShow.value = false }, 1600)
}

/* ===== 渲染弹窗列表 ===== */
function renderPopup() {
  const total = Number(MOCK.total || 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  let html = '<aside class="notice-popup pop-enter">'
    + '<div class="notice-popup__header"><div><h3 class="notice-popup__title">系统通知</h3></div>'
    + '<span class="notice-popup__count">' + total + ' 条</span></div>'
  if (!list.length) {
    html += '<div class="notice-popup__state">暂无公告</div>'
  } else {
    html += '<div class="notice-popup__list">'
    list.forEach(function (item) {
      const read = effectiveRead(item)
      html += '<article class="notice-item" role="button" tabindex="0" data-id="' + esc(item.id) + '">'
        + '<div class="notice-item__top">'
        + '<span class="notice-item__level ' + levelClass(item.level) + '">' + levelText(item.level) + '</span>'
        + '<span class="notice-item__type">' + typeText(item.type) + '</span></div>'
        + '<h4 class="notice-item__title">' + esc(item.title) + '</h4>'
        + '<div class="notice-item__content">' + item.content + '</div><hr>'
        + '<div class="notice-item__meta"><span>发布人：' + esc(item.publisherName || '-') + '</span>'
        + '<span>发布时间：' + esc(item.publishTime || '-') + '</span></div>'
        + '<div class="notice-item__footer"><span> 读取状态： '
        + '<span class="' + (read !== '1' ? 'is-unread' : '') + '">' + (read === '1' ? '已读' : '未读') + '</span></span>'
        + '<span>接收人：' + targetText(item.targetName) + '</span></div>'
        + '</article>'
    })
    html += '</div>'
  }
  if (total > PAGE_SIZE) {
    html += '<div class="notice-popup__pager">'
      + '<button class="notice-popup__pager-btn" data-page="prev" ' + (page <= 1 ? 'disabled' : '') + '>上一页</button>'
      + '<span class="notice-popup__pager-info">' + page + ' / ' + totalPages + '</span>'
      + '<button class="notice-popup__pager-btn" data-page="next" ' + (page >= totalPages ? 'disabled' : '') + '>下一页</button></div>'
  }
  html += '</aside>'
  popupHtml.value = html
}

/* ===== 渲染详情 ===== */
function renderDetail(item) {
  detailHtml.value =
    '<div class="notice-detail-modal__header"><div>'
    + '<h3 class="notice-detail-modal__title">' + esc(item.title) + '</h3>'
    + '<div class="notice-detail-modal__meta"><span>发布人：' + esc(item.publisherName || '-') + '</span>'
    + '<span>发布时间：' + esc(item.publishTime || '-') + '</span></div></div>'
    + '<button class="notice-detail-modal__close" id="detailClose" type="button">&times;</button></div>'
    + '<div class="notice-detail-modal__tags">'
    + '<span class="notice-detail-modal__tag">' + typeText(item.type) + '</span>'
    + '<span class="notice-detail-modal__tag ' + levelClass(item.level) + '">' + levelText(item.level) + '</span>'
    + '<span class="notice-detail-modal__tag">接收类型：' + (String(item.targetType) === '2' ? '指定' : '全体') + '</span>'
    + '<span class="notice-detail-modal__tag">接收人：' + targetText(item.targetName) + '</span></div>'
    + '<div class="notice-detail-modal__content">' + item.content + '</div>'
  nextTick(() => {
    const btn = document.getElementById('detailClose')
    if (btn) btn.addEventListener('click', closeDetail)
  })
}

/* ===== 开关逻辑 ===== */
function openPopup() { popupOpen.value = true; renderPopup(); updateShake() }
function closePopup() { popupOpen.value = false }
function togglePopup() { popupOpen.value ? closePopup() : openPopup() }
function openDetail(item) {
  markRead(item.id)
  const t = list.find(x => String(x.id) === String(item.id))
  if (t) t.isRead = '1'
  renderDetail(item)
  detailOpen.value = true
  renderPopup()  // 同步列表已读状态（供下次打开时展示）
  closePopup()   // 点开公告后收起居中的「系统通知」列表，只保留详情卡片
  updateShake()  // 全部已读后停止摇动
}
function closeDetail() { detailOpen.value = false }
function hasUnread() { return list.some(x => effectiveRead(x) !== '1') }

/* ===== 图标摇动：有未读就加 is-shaking（CSS 无限循环），全部已读则移除 ===== */
function updateShake() { shake.value = hasUnread() }

/* ===== 事件绑定 ===== */
function onTriggerClick(e) { e.stopPropagation(); togglePopup() }
function onPopoverClick(e) {
  e.stopPropagation()
  const art = e.target.closest('.notice-item')
  if (art) { const item = list.find(x => String(x.id) === String(art.dataset.id)); if (item) openDetail(item) }
  const btn = e.target.closest('[data-page]')
  if (btn && !btn.disabled) { toast('演示数据仅 1 条，无更多页') }
}
// 键盘可达性：卡片标了 role=button、tabindex=0，就必须响应 Enter / 空格
function onPopoverKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ' && e.keyCode !== 32) return
  const art = e.target.closest && e.target.closest('.notice-item')
  if (!art) return
  e.preventDefault()
  const item = list.find(x => String(x.id) === String(art.dataset.id))
  if (item) openDetail(item)
}
function onOverlayClick(e) { if (e.target && e.target.id === 'detailOverlay') closeDetail() }
function onDocKeydown(e) { if (e.key === 'Escape') { closeDetail(); closePopup() } }
function onDocClick(e) {
  if (!e.target.closest('.nav-notice-item')) closePopup()
}

/* ===== 入口挂载点迁移：宽屏 → 电脑端（网站列表内），窄屏 → 手机端（社交栏下方） ===== */
const entryMount = ref('#noticeMountDesktop')
function placeEntry() {
  entryMount.value = window.innerWidth > 768 ? '#noticeMountDesktop' : '#noticeMountMobile'
}

onMounted(() => {
  placeEntry()
  window.addEventListener('resize', placeEntry)
  window.addEventListener('orientationchange', () => setTimeout(placeEntry, 300))
  document.addEventListener('keydown', onDocKeydown)
  document.addEventListener('click', onDocClick)

  /* ===== 初始化：未读即开始摇动提醒 =====
     演示文件：每次打开先清掉历史已读记录，保证一进来就是未读、能看到摇动。
     接真实后端时删掉下面 removeItem 这行，已读状态由后端 isRead 决定即可。 */
  localStorage.removeItem(READ_KEY)
  list.forEach(x => { x.isRead = effectiveRead(x) })
  updateShake()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', placeEntry)
  window.removeEventListener('orientationchange', placeEntry)
  document.removeEventListener('keydown', onDocKeydown)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <!-- 公告入口：在电脑端 / 手机端两个挂载点之间迁移（Teleport） -->
  <Teleport :to="entryMount">
    <div class="nav-notice-item" id="noticeEntry">
      <button class="nav-notice-trigger" id="noticeTrigger" type="button" aria-label="公告" @click="onTriggerClick">
        <svg class="nav-notice-trigger__icon" id="noticeBell" :class="{ 'is-shaking': shake }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 1.5 L9 4.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M16.5 1.5 L15 4.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <rect x="4" y="4.5" width="16" height="16.5" rx="2.6" fill="#ffffff"/>
          <rect x="8" y="9.3" width="8" height="1.8" rx=".9" fill="#28424c"/>
          <rect x="8" y="13.1" width="8" height="1.8" rx=".9" fill="#28424c"/>
          <rect x="8" y="16.9" width="8" height="1.8" rx=".9" fill="#28424c"/>
        </svg>
        <span>公告</span>
      </button>
    </div>
  </Teleport>

  <!-- 通知列表面板 -->
  <div
    class="nav-notice-popover"
    id="noticePopover"
    :hidden="!popupOpen"
    v-html="popupHtml"
    @click="onPopoverClick"
    @keydown="onPopoverKeydown"
  ></div>

  <!-- 详情模态框 -->
  <div class="notice-detail-overlay" id="detailOverlay" :class="{ show: detailOpen }" @click="onOverlayClick">
    <div class="notice-detail-modal" id="detailModal" v-html="detailHtml"></div>
  </div>

  <!-- toast -->
  <div class="toast" id="toast" :class="{ show: toastShow }">{{ toastText }}</div>

  <!-- 静态占位：供内嵌脚本扫描到公告图片，实际内容由 JS 引用其 src -->
  <img hidden id="tplNoticeImg" src="https://iili.io/nbTMk22.jpg" alt="nbTMk22.jpg">
</template>
