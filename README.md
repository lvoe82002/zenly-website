# zenly-home-vue（Mi Manchi 主页 Vue 版）

由单文件 `index.html`（Mi Manchi / 阿修の主页，Folia 版）拆分重构的 **Vue 3 + Vite** 源码工程。视觉、交互与原页面保持一致，仅把 19 个 `<script>` 块与整段模板按功能拆成组件与组合式函数。

## 技术栈

- Vue 3（`<script setup>` 组合式 API）
- Vite 6 + @vitejs/plugin-vue
- 全局样式沿用原页面 CSS（含内嵌 base64 字体）

## 目录结构

```
zenly-home-vue/
├── index.html                    # 入口（保留原 meta/字体 CDN）
├── vite.config.js
├── package.json
└── src/
    ├── main.js                   # 挂载 App + 引入 global.css
    ├── App.vue                   # 根布局：按原 body 顺序组装全部组件
    ├── assets/styles/
    │   └── global.css            # 原 <style> 块原样提取（含 base64 字体）
    ├── components/
    │   ├── LoadingScreen.vue     # 加载屏 + 模糊渐清揭幕（bfcache 兜底）
    │   ├── WelcomeTip.vue        # 问候语气泡 + 右键提示
    │   ├── TopTip.vue            # 顶部提醒气泡（site-tip 渲染层）
    │   ├── WeatherEffects.vue    # 雪花 / 下雨 / 打雷三个 canvas 引擎
    │   ├── CustomCursor.vue      # 自定义圆圈光标（仅 PC）
    │   ├── Particles.vue         # 点击彩屑粒子
    │   ├── ClockWeather.vue      # 数字时钟 + 高德天气
    │   ├── HitokotoCard.vue      # 一言卡片
    │   ├── LogoBadge.vue         # 中央 Logo（zenlydsp.top）
    │   ├── TimeCapsule.vue       # 站点徽章 + 时光胶囊弹层
    │   ├── SettingsPanel.vue     # 全局设置面板（壁纸/特效/建站日期/更新日志）
    │   ├── NavCards.vue          # 网站列表卡片（分页/滑动）
    │   ├── SocialLinks.vue       # 社交链接栏（悬停 tooltip）
    │   ├── NoticeSystem.vue      # 公告组件（Teleport 入口迁移 + 列表/详情/toast）
    │   ├── MusicPlayer.vue       # Folia 音乐播放器（懒加载 iframe）
    │   ├── CardFrame.vue         # 卡片全屏 iframe 弹层
    │   └── MobileMenuToggle.vue  # 手机端汉堡菜单
    └── composables/
        ├── useSettings.js        # 壁纸/特效/建站日期设置单例（localStorage 持久化）
        ├── useTipQueue.js        # site-tip 单例状态 + 串行队列（问候语互斥）
        ├── useWelcome.js         # 问候语 / 右键提示逻辑
        ├── useWeather.js         # 高德 IP 定位 + 实况天气
        ├── useCardFrame.js       # 卡片弹层 + 统一跳转路由（goTo/goHome/openCard）
        ├── usePcLayout.js        # PC 端垂直居中布局
        └── useProtection.js      # PC 端防复制（F12/复制/拖选拦截）
```

## 与原 HTML 的对应关系

| 原 index.html | 新位置 |
| --- | --- |
| `<style>` 整块（含字体） | `src/assets/styles/global.css` |
| 顶部提醒气泡脚本（showSiteTip/enqueueTopTip） | `useTipQueue.js` + `TopTip.vue` |
| 模糊渐清 + 问候语 + 右键提示 | `LoadingScreen.vue` + `useWelcome.js` + `WelcomeTip.vue` |
| 雪花 / 下雨 / 闪电三个脚本 | `WeatherEffects.vue` |
| 光标脚本 | `CustomCursor.vue` |
| 点击粒子脚本 | `Particles.vue` |
| 数字时钟 + 天气脚本 | `ClockWeather.vue` + `useWeather.js` |
| 社交栏 tooltip 脚本 | `SocialLinks.vue` |
| 时光胶囊脚本 | `TimeCapsule.vue` |
| 全局设置面板脚本 | `SettingsPanel.vue` + `useSettings.js` |
| PC 布局脚本 | `usePcLayout.js` |
| 汉堡菜单脚本 | `MobileMenuToggle.vue` |
| 一言卡片脚本 | `HitokotoCard.vue` |
| 音乐播放器脚本 | `MusicPlayer.vue` |
| 卡片弹层 + __go/__goHome 脚本 | `useCardFrame.js` + `CardFrame.vue` |
| 公告入口迁移 + 公告组件脚本 | `NoticeSystem.vue`（Teleport） |
| 网站列表分页脚本 | `NavCards.vue` |
| PC 防复制脚本 | `useProtection.js` |

## 关键改造点

1. **window 全局函数 → 模块单例**：原 `window.showSiteTip / enqueueTopTip / __go / __goHome / __openCard / __closeCard / __snowActive` 等全局变量，改为 composables 里的导出函数与 `reactive` 状态。
2. **公告入口迁移 → Teleport**：原脚本用 `appendChild` 在电脑/手机两个挂载点间移动 DOM 节点，改为 `<Teleport :to="entryMount">` 按视口宽度切换。
3. **innerHTML 渲染保留**：公告列表/详情、设置面板更新日志等含富文本的部分保留 v-html 渲染，事件改用事件委托绑定。
4. **iframe 弹层/特效暂停恢复**：卡片弹层打开期间暂停雪花/下雨/打雷（`effectsState` 切换），关闭后恢复。

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 产出 dist/
```

## 部署提示

- `vite.config.js` 已设 `base: './'`，`dist/` 可直接部署到任意子路径（Cloudflare Pages / GitHub Pages / Nginx）。
- 公告为演示数据（`NoticeSystem.vue` 内 MOCK），接真实后端时替换为接口请求并删除初始化时的 `localStorage.removeItem(READ_KEY)`。
- 天气使用高德 API Key（`useWeather.js` 内 AMAP_KEY），如需更换请替换为自己的 Key。
