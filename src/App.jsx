import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

/* ─── Constants ─────────────────────────────── */
const TOTAL_BALLOONS = 4
const CANDLE_COUNT = 1
const BALLOON_COLORS = [
  ['#ff6eb4', '#ff1a7a'],
  ['#d48fea', '#9b2dca'],
  ['#ffd700', '#ff8c00'],
  ['#b388ff', '#7c4dff'],
]

/* ─── Helpers ────────────────────────────────── */
function spawnConfetti(count = 40) {
  const colors = ['#ff6eb4','#ffd700','#d48fea','#ff80ab','#fff','#c77dff','#ffb3e0']
  const shapes = ['✦','❋','◆','★','♥','✿','●']
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      el.textContent = shapes[Math.floor(Math.random() * shapes.length)]
      el.style.cssText = `
        left:${Math.random()*100}vw;
        font-size:${8 + Math.random()*16}px;
        color:${colors[Math.floor(Math.random()*colors.length)]};
        animation-duration:${2 + Math.random()*3}s;
        animation-delay:${Math.random()*0.5}s;
        opacity:${0.7 + Math.random()*0.3};
        transform:rotate(${Math.random()*360}deg);
      `
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4500)
    }, Math.random() * 800)
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath(); ctx.fill()
}

/* ─── Fireworks singleton ────────────────────── */
let fwRunning = false
let fwRafId = null
let fwRockets = []

function startFireworks(canvas, duration = 4000) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  fwRunning = true

  function launch() {
    const cols = ['#ff6eb4','#ffd700','#d48fea','#ff4da6','#80f0ff','#c77dff','#fff']
    const col = cols[Math.floor(Math.random() * cols.length)]
    const x = Math.random() * W, y = Math.random() * H * 0.6
    const ps = []
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 / 60) * i
      const speed = Math.random() * 5 + 2
      ps.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, alpha: 1, r: Math.random()*2+1, col })
    }
    fwRockets.push(ps)
  }

  function draw() {
    if (!fwRunning) return
    ctx.fillStyle = 'rgba(26,0,32,0.18)'
    ctx.fillRect(0, 0, W, H)
    fwRockets = fwRockets.filter(ps => ps.some(p => p.alpha > 0.02))
    fwRockets.forEach(ps => ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.018
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
      ctx.fillStyle = p.col; ctx.globalAlpha = Math.max(0, p.alpha); ctx.fill()
    }))
    ctx.globalAlpha = 1
    fwRafId = requestAnimationFrame(draw)
  }

  const iv = setInterval(launch, 350)
  draw()
  setTimeout(() => {
    clearInterval(iv)
    fwRunning = false
    cancelAnimationFrame(fwRafId)
    ctx.clearRect(0, 0, W, H)
  }, duration)
}

/* ══════════════════════════════════════════════
   SCENE COMPONENTS
   ══════════════════════════════════════════════ */

/* ─── Scene 1: Intro ─────────────────────────── */
function SceneIntro({ onNext }) {
  return (
    <div className="scene active" id="scene-intro">
      <div className="intro-stars"><div className="star-ring" /></div>
      <div className="intro-title">Happiest Birthday</div>
      <div className="intro-name">Gaura</div>
      <div className="intro-subtitle">✨ A magical day just for you ✨</div>
      <div className="hearts-row">
        {['💖','🌸','💜','🌸','💖'].map((h, i) => (
          <span key={i} className="heart">{h}</span>
        ))}
      </div>
      <button className="btn-primary" onClick={onNext}>✨ Let&apos;s Celebrate! ✨</button>
    </div>
  )
}

/* ─── Scene 2: Balloons ──────────────────────── */
function SceneBalloons({ onNext }) {
  const [popped, setPopped] = useState(0)
  const [balloons, setBalloons] = useState([])
  const fwCanvasRef = useRef(null)

  useEffect(() => {
    setPopped(0)
    // Fixed X positions spread across screen, Y positions in visible range
    const positions = [
      { x: 12, top: 20 },
      { x: 35, top: 35 },
      { x: 60, top: 18 },
      { x: 80, top: 30 },
    ]
    const newBalloons = positions.map((pos, i) => {
      const col = BALLOON_COLORS[i % BALLOON_COLORS.length]
      const gid = `g${Math.random().toString(36).slice(2)}`
      return {
        id: gid,
        col,
        size: 90 + Math.random() * 30,
        x: pos.x,
        top: pos.top,
        dur: 2.5 + Math.random() * 1.5,
        tilt: (Math.random() - 0.5) * 12,
        stringX: 45 + Math.random() * 10,
      }
    })
    setBalloons(newBalloons)
  }, [])

  const popCountRef = useRef(0)

  // Unique message per balloon pop
  const popMessages = [
    { text: '🎊 Wah! Ek phuta!', color: '#ff6eb4' },
    { text: '💃 Mast hai Gaura!', color: '#ffd700' },
    { text: '🌟 Aur ek gaya!', color: '#d48fea' },
    { text: '🎉 Happiest Birthday! 🎉', color: '#ff4da6' },
  ]

  const showPopMessage = (msg, x, y) => {
    const el = document.createElement('div')
    el.textContent = msg.text
    el.style.cssText = `
      position: fixed;
      left: 50%;
      top: 45%;
      transform: translate(-50%, -50%) scale(0);
      z-index: 999;
      font-family: 'Great Vibes', cursive;
      font-size: clamp(36px, 7vw, 80px);
      color: ${msg.color};
      text-shadow: 0 0 30px ${msg.color}, 0 0 60px ${msg.color}88;
      pointer-events: none;
      white-space: nowrap;
      animation: popMsgAnim 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 1500)
  }


  const popBalloon = useCallback((id, e) => {
    // burst emojis
    const emojis = ['💥','🎉','✨','🌟','💫','🎊','🌸']
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div')
      el.className = 'pop-burst'
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      el.style.left = (e.clientX + (Math.random()-0.5)*80) + 'px'
      el.style.top  = (e.clientY + (Math.random()-0.5)*80) + 'px'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 700)
    }

    // Show fun message
    const msgIdx = popCountRef.current % popMessages.length
    showPopMessage(popMessages[msgIdx], e.clientX, e.clientY)
    popCountRef.current += 1

    setBalloons(prev => prev.filter(b => b.id !== id))
    setPopped(prev => {
      const next = prev + 1
      if (next >= TOTAL_BALLOONS) {
        spawnConfetti(60)
        if (fwCanvasRef.current) startFireworks(fwCanvasRef.current, 3000)
        setTimeout(() => onNext(), 2000)
      }
      return next
    })
  }, [onNext])


  return (
    <div className="scene active" id="scene-balloons">
      <canvas
        ref={fwCanvasRef}
        id="fireworks-canvas-balloons"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:5 }}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <div style={{ position: 'absolute', top: '12vh', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <div className="balloon-title">Pop the Balloons! 🎈</div>
        <div className="balloon-hint">click every balloon to pop it!</div>
        <div className="pop-count">{popped} / {TOTAL_BALLOONS} Popped</div>
      </div>

      {balloons.map(b => (
        <div
          key={b.id}
          className="balloon-obj"
          style={{
            left: `${b.x}%`,
            top: `${b.top}%`,
            width: `${b.size}px`,
            animationDuration: `${b.dur}s`,
            '--tilt': `${b.tilt}deg`,
          }}
          onClick={(e) => popBalloon(b.id, e)}
        >
          <svg viewBox="0 0 100 140" width={b.size} height={b.size * 1.4} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={b.id} cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor={b.col[0]} stopOpacity="0.9" />
                <stop offset="100%" stopColor={b.col[1]} />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="55" rx="44" ry="52" fill={`url(#${b.id})`} />
            <ellipse cx="38" cy="36" rx="12" ry="8" fill="rgba(255,255,255,0.35)" />
            <path d="M50 107 Q46 115 50 120 Q54 115 50 107" fill={b.col[1]} />
            <line x1="50" y1="120" x2={b.stringX} y2="140" stroke={b.col[1]} strokeWidth="1.5" strokeDasharray="3,2" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* ─── Scene 3: Candles ───────────────────────── */
function SceneCandles({ onNext, fwCanvas }) {
  const canvasRef = useRef(null)
  const candlesRef = useRef([])
  const blowIntervalRef = useRef(null)
  const animIdRef = useRef(null)
  const [allOut, setAllOut] = useState(false)

  useEffect(() => {
    candlesRef.current = Array.from({ length: CANDLE_COUNT }, (_, i) => ({
      x: 190, y: 106, lit: true, flicker: Math.random() * Math.PI,
    }))
    setAllOut(false)

    function loop() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Layers
      const drawLayer = (x, y, w, h, r, c1, c2, fy) => {
        const g = ctx.createLinearGradient(x, y, x, y+h)
        g.addColorStop(0, c1); g.addColorStop(1, c2)
        ctx.fillStyle = g; roundRect(ctx, x, y, w, h, r)
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; roundRect(ctx, x, y-5, w, 18, r)
        // dots
        const dc = ['#ffd700','#ff80ab','#b388ff','#80cbc4']
        for (let d = 0; d < 5; d++) {
          ctx.beginPath(); ctx.arc(x+18 + d*(w-36)/4, fy, 5, 0, Math.PI*2)
          ctx.fillStyle = dc[d%4]; ctx.fill()
        }
      }
      drawLayer(40, 210, 300, 80, 16, '#f48fb1', '#c2185b', 248)
      drawLayer(65, 150, 250, 65, 14, '#ce93d8', '#7b1fa2', 185)
      drawLayer(95, 100, 190, 55, 12, '#f48fb1', '#e91e8c', 130)

      // text
      ctx.save()
      ctx.font = 'bold 13px Outfit,sans-serif'
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4
      ctx.fillText('Happiest Birthday!', 190, 245)
      ctx.restore()

      // candles
      const colArr = ['#ff6eb4','#ffd700','#d48fea','#80cbc4','#ff9de2']
      candlesRef.current.forEach((c, i) => {
        c.flicker += 0.1
        const col = colArr[i % 5]
        const cg = ctx.createLinearGradient(c.x-10, 0, c.x+10, 0)
        cg.addColorStop(0, '#fff'); cg.addColorStop(0.5, col); cg.addColorStop(1, '#ddd')
        ctx.fillStyle = cg; roundRect(ctx, c.x-10, c.y-60, 20, 60, 6)
        ctx.strokeStyle = '#555'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(c.x, c.y-60); ctx.lineTo(c.x, c.y-68); ctx.stroke()

        if (c.lit) {
          const fl = Math.sin(c.flicker) * 3
          const fg = ctx.createRadialGradient(c.x, c.y-80, 0, c.x, c.y-75, 20+fl)
          fg.addColorStop(0, 'rgba(255,255,180,0.95)')
          fg.addColorStop(0.4, 'rgba(255,160,0,0.8)')
          fg.addColorStop(1, 'rgba(255,80,0,0)')
          ctx.fillStyle = fg
          ctx.beginPath(); ctx.ellipse(c.x+fl*0.5, c.y-78, 12+fl, 20+fl, 0, 0, Math.PI*2); ctx.fill()
          const gl = ctx.createRadialGradient(c.x, c.y-75, 0, c.x, c.y-75, 40)
          gl.addColorStop(0, 'rgba(255,220,100,0.3)')
          gl.addColorStop(1, 'rgba(255,150,0,0)')
          ctx.fillStyle = gl
          ctx.beginPath(); ctx.arc(c.x, c.y-75, 40, 0, Math.PI*2); ctx.fill()
        }
      })
      animIdRef.current = requestAnimationFrame(loop)
    }
    animIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animIdRef.current)
  }, [])

  const startBlowing = () => {
    if (blowIntervalRef.current) return
    blowIntervalRef.current = setInterval(() => {
      const lit = candlesRef.current.filter(c => c.lit)
      if (lit.length === 0) {
        clearInterval(blowIntervalRef.current)
        blowIntervalRef.current = null
        setAllOut(true)
        spawnConfetti(100)
        if (fwCanvas?.current) startFireworks(fwCanvas.current, 5000)
        return
      }
      if (Math.random() < 0.65) {
        lit[Math.floor(Math.random() * lit.length)].lit = false
      }
    }, 400)
  }

  const stopBlowing = () => {
    clearInterval(blowIntervalRef.current)
    blowIntervalRef.current = null
  }

  return (
    <div className="scene active" id="scene-candles">
      <div className="candles-title">Make a Wish! 🕯️</div>
      <div className="cake-wrapper">
        <canvas ref={canvasRef} id="cake-canvas" width={380} height={300} />
      </div>
      {!allOut && (
        <>
          <div className="blow-hint">🌬️ Hold the button to blow out the candles!</div>
          <button
            className="btn-primary"
            style={{ marginTop: 16, fontSize: 16 }}
            onMouseDown={startBlowing}
            onMouseUp={stopBlowing}
            onTouchStart={startBlowing}
            onTouchEnd={stopBlowing}
          >
            🌬️ Blow!
          </button>
        </>
      )}
      {allOut && (
        <>
          <div className="wish-msg">Wish Granted! 🌟</div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={onNext}>
            📸 Click Here ✨
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Scene 4: Photos ────────────────────────── */
function ScenePhotos() {
  const photos = [
    '/images/Gaura_1.jpg',
    '/images/Gaura_2.jpg',
    '/images/Gaura_3.jpg',
    '/images/Gaura_4.JPG',
    '/images/Gaura_5.jpg',
    '/images/Gaura_6.jpg',
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => { spawnConfetti(60) }, [])

  const nextPhoto = () => setCurrentIndex(prev => (prev + 1) % photos.length)
  const prevPhoto = () => setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length)

  return (
    <div className="scene active" id="scene-photos" style={{ overflowY: 'auto' }}>
      <div className="photos-title">Click Here 💖</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div 
          className="photo-card" 
          style={{ animation: 'none', transform: 'none', background: 'transparent', border: 'none', boxShadow: '0 0 40px rgba(255,110,180,0.3)', display: 'inline-block' }} 
          onClick={nextPhoto}
        >
          <img 
            key={currentIndex} 
            src={photos[currentIndex]} 
            alt="" 
            loading="lazy" 
            style={{ 
              display: 'block',
              maxWidth: '90vw', 
              maxHeight: '65vh', 
              width: 'auto',
              height: 'auto',
              borderRadius: '16px',
              animation: 'photoSwapAnim 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
            }} 
          />
          <div className="photo-overlay" style={{ borderRadius: '16px' }} />
        </div>
        <div style={{ color: 'rgba(255,220,245,0.8)', fontSize: '14px', letterSpacing: '1px' }}>
          (Click photo for next)
        </div>
      </div>

      <div style={{ color: '#ffd700', fontSize: '18px', marginBottom: '20px', letterSpacing: '2px' }}>
        {currentIndex + 1} / {photos.length}
      </div>

      <div className="final-msg">Always smiling, always shining — Happiest Birthday Gaura! 💜</div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function App() {
  const [scene, setScene] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)
  const fwCanvasRef = useRef(null)
  const particlesRef = useRef(null)

  // Background particles
  useEffect(() => {
    const canvas = particlesRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = [], rafId

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize); resize()

    const colors = ['#ff6eb4','#d48fea','#ffb3e0','#ffd700','#ff4da6','#c77dff']
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*2.5+0.5,
        dx: (Math.random()-0.5)*0.4, dy: -Math.random()*0.5-0.2,
        color: colors[Math.floor(Math.random()*colors.length)],
        alpha: Math.random()*0.6+0.2,
        pulse: Math.random()*Math.PI*2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.pulse += 0.02
        p.alpha = 0.3 + 0.4 * Math.abs(Math.sin(p.pulse))
        p.x += p.dx; p.y += p.dy
        if (p.y < -10) p.y = H+10
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
      })
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafId) }
  }, [])

  // Auto-play on first click
  useEffect(() => {
    const handler = () => {
      if (!musicPlaying && audioRef.current) {
        audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {})
      }
    }
    document.addEventListener('click', handler, { once: true })
    return () => document.removeEventListener('click', handler)
  }, [musicPlaying])

  const goToScene = useCallback((idx) => {
    if (idx === scene || transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setScene(idx)
      setTransitioning(false)
    }, 400)
  }, [scene, transitioning])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicPlaying) { audioRef.current.pause(); setMusicPlaying(false) }
    else { audioRef.current.play().catch(() => {}); setMusicPlaying(true) }
  }

  // Resize fireworks canvas
  useEffect(() => {
    const resize = () => {
      if (fwCanvasRef.current) {
        fwCanvasRef.current.width = window.innerWidth
        fwCanvasRef.current.height = window.innerHeight
      }
    }
    window.addEventListener('resize', resize); resize()
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Initial confetti
  useEffect(() => { setTimeout(() => spawnConfetti(30), 500) }, [])

  return (
    <>
      {/* Background */}
      <div className="bg" />
      <canvas ref={particlesRef} id="particles-canvas" />
      <canvas ref={fwCanvasRef} id="fireworks-canvas" />

      {/* Transition overlay */}
      <div className={`trans-overlay${transitioning ? ' visible' : ''}`} />



      {/* Nav dots */}
      <div className="nav-dots">
        {['🌟','🎈','🎂','📸'].map((_, i) => (
          <button
            key={i}
            className={`nav-dot${scene === i ? ' active' : ''}`}
            onClick={() => goToScene(i)}
          />
        ))}
      </div>

      {/* Scenes */}
      {scene === 0 && <SceneIntro onNext={() => goToScene(1)} />}
      {scene === 1 && <SceneBalloons onNext={() => goToScene(2)} />}
      {scene === 2 && <SceneCandles onNext={() => goToScene(3)} fwCanvas={fwCanvasRef} />}
      {scene === 3 && <ScenePhotos />}
    </>
  )
}
