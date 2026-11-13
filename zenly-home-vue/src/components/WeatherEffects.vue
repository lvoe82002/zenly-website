<script setup>
/**
 * 天气特效画布：雪花 / 下雨 / 打雷
 *
 * 对应原 index.html 中「雪花」「下雨特效」「闪电特效」三个脚本。
 * 三个 canvas 常驻渲染循环，但只在 effectsState 开关打开时绘制；
 * 可见性（opacity/visibility）由 SettingsPanel 经 useSettings.applyEffect 控制。
 */
import { onMounted } from 'vue'
import { effectsState } from '../composables/useSettings'

/* ===== 雪花 ===== */
function createSnowCanvas(canvasId, snowNum) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let width, height
  const flakes = []

  function resize() {
    width = canvas.offsetWidth
    height = canvas.offsetHeight
    canvas.width = width
    canvas.height = height
  }
  window.addEventListener('resize', resize)
  resize()

  class Snow {
    constructor() {
      this.x = Math.random() * width
      this.y = Math.random() * -height
      this.r = Math.random() * 2 + 1
      this.speed = Math.random() * 0.8 + 0.3
      this.swing = Math.random() * Math.PI * 2
      this.swingSpeed = Math.random() * 0.015 + 0.01
      this.wind = Math.random() * 0.3 - 0.15
    }
    update() {
      this.swing += this.swingSpeed
      this.x += Math.cos(this.swing) * 0.6 + this.wind
      this.y += this.speed
      if (this.y > height + 10) this.reset()
    }
    reset() {
      this.x = Math.random() * width
      this.y = Math.random() * -50
    }
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.4 + this.r / 3})`
      ctx.fill()
    }
  }
  for (let i = 0; i < snowNum; i++) flakes.push(new Snow())

  function render() {
    ctx.clearRect(0, 0, width, height)
    if (!effectsState.snow) {
      requestAnimationFrame(render)
      return
    }
    flakes.forEach(s => { s.update(); s.draw() })
    requestAnimationFrame(render)
  }
  render()
}

/* ===== 下雨 ===== */
function createRainCanvas() {
  const canvas = document.getElementById('rainCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let raindrops = []
  let ripples = []

  const RAIN_COUNT = 180
  const WIND = 1.5
  const GRAVITY = 0.08
  const MIN_SPEED = 6
  const MAX_SPEED = 14
  const LENGTH_FACTOR = 0.8
  const RIPPLE_MAX_RADIUS = 18
  const RIPPLE_LIFE = 40
  const COLOR = '174, 194, 224'

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', () => {
    resizeCanvas()
    for (const drop of raindrops) {
      drop.x = Math.random() * canvas.width
      drop.y = Math.random() * -canvas.height
    }
  })

  class Raindrop {
    constructor() {
      this.reset()
    }

    reset() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * -canvas.height
      this.vx = WIND + (Math.random() - 0.5) * 0.8
      this.vy = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)
      this.length = this.vy * LENGTH_FACTOR
      this.opacity = 0.35 + Math.random() * 0.45
      this.thickness = 0.6 + Math.random() * 0.8
    }

    update() {
      this.vy += GRAVITY
      this.x += this.vx
      this.y += this.vy
      this.length = this.vy * LENGTH_FACTOR

      if (this.y > canvas.height + this.length) {
        ripples.push({
          x: this.x,
          y: canvas.height - 2,
          radius: 1,
          opacity: 0.5,
          life: 0
        })
        this.reset()
        this.y = -this.length
      }
    }

    draw() {
      const tailX = this.x - this.vx * this.length * 0.15
      const tailY = this.y - this.vy * this.length * 0.15

      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = `rgba(${COLOR}, ${this.opacity})`
      ctx.lineWidth = this.thickness
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  for (let i = 0; i < RAIN_COUNT; i++) {
    raindrops.push(new Raindrop())
  }

  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      r.life++
      if (r.life > RIPPLE_LIFE) {
        ripples.splice(i, 1)
        continue
      }
      r.radius = 1 + (r.life / RIPPLE_LIFE) * RIPPLE_MAX_RADIUS
      r.opacity = 0.5 * (1 - r.life / RIPPLE_LIFE)

      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${COLOR}, ${r.opacity})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  function animateRain() {
    requestAnimationFrame(animateRain)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!effectsState.rain) {
      return
    }

    for (const drop of raindrops) {
      drop.update()
      drop.draw()
    }

    drawRipples()
  }
  animateRain()
}

/* ===== 闪电 ===== */
function createLightningCanvas() {
  const canvas = document.getElementById('lightningCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let lightningActive = false
  let lightningAlpha = 0
  let flashAlpha = 0
  let lightningPaths = []

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  function generateLightning() {
    if (lightningActive || !effectsState.thunder) return
    lightningActive = true
    lightningAlpha = 1
    flashAlpha = 0.6

    lightningPaths = []
    const startX = Math.random() * canvas.width
    const startY = 0
    const segments = 20 + Math.random() * 20
    let x = startX
    let y = startY
    const mainPoints = [{ x, y }]
    for (let i = 1; i <= segments; i++) {
      x += (Math.random() - 0.5) * 60
      y += (canvas.height / segments) * (1 + Math.random() * 0.5)
      mainPoints.push({ x, y })

      if (Math.random() < 0.3) {
        const branchLength = 5 + Math.random() * 15
        const branchPoints = []
        let bx = x
        let by = y
        for (let j = 0; j < branchLength; j++) {
          bx += (Math.random() - 0.5) * 30
          by += Math.random() * 15
          branchPoints.push({ x: bx, y: by })
        }
        lightningPaths.push({ points: branchPoints, alpha: 0.7 })
      }
    }
    lightningPaths.push({ points: mainPoints, alpha: 1 })

    setTimeout(() => {
      lightningActive = false
      lightningAlpha = 0
      flashAlpha = 0
    }, 150)
  }

  function drawLightning() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!lightningActive) return

    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = 15
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    for (const path of lightningPaths) {
      ctx.beginPath()
      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${lightningAlpha * path.alpha})`
      ctx.stroke()
    }
    ctx.restore()

    if (flashAlpha > 0) {
      flashAlpha -= 0.05
      if (flashAlpha < 0) flashAlpha = 0
    }
  }

  function scheduleLightning() {
    if (!effectsState.thunder) {
      requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setTimeout(scheduleLightning, 500)
      })
      return
    }
    const delay = 3000 + Math.random() * 7000
    setTimeout(() => {
      generateLightning()
      scheduleLightning()
    }, delay)
  }
  scheduleLightning()

  function animate() {
    requestAnimationFrame(animate)
    if (effectsState.thunder) {
      drawLightning()
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  animate()
}

onMounted(() => {
  createSnowCanvas('snowFullScreen', 180)
  createRainCanvas()
  createLightningCanvas()
})
</script>

<template>
  <canvas id="snowFullScreen"></canvas>
  <canvas id="rainCanvas"></canvas>
  <canvas id="lightningCanvas"></canvas>
</template>
