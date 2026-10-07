import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

/* ─── Helpers ────────────────────────────────── */
function spawnHearts(count = 30) {
  const hearts = ['💖', '💕', '💗', '💓', '💘', '🌹', '✨', '💫', '🌸', '💝']
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'heart-piece'
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)]
      el.style.cssText = `
        left:${Math.random() * 100}vw;
        font-size:${10 + Math.random() * 20}px;
        animation-duration:${3 + Math.random() * 4}s;
        animation-delay:${Math.random() * 0.5}s;
        opacity:${0.7 + Math.random() * 0.3};
      `
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 6000)
    }, Math.random() * 1000)
  }
}

function spawnConfetti(count = 40) {
  const colors = ['#ff6eb4', '#ffd700', '#d48fea', '#ff80ab', '#fff', '#c77dff', '#ffb3e0', '#ff4da6']
  const shapes = ['✦', '❋', '◆', '★', '♥', '✿', '●', '❤']
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      el.textContent = shapes[Math.floor(Math.random() * shapes.length)]
      el.style.cssText = `
        left:${Math.random() * 100}vw;
        font-size:${8 + Math.random() * 18}px;
        color:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${2 + Math.random() * 3}s;
        animation-delay:${Math.random() * 0.5}s;
        opacity:${0.7 + Math.random() * 0.3};
        transform:rotate(${Math.random() * 360}deg);
      `
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4500)
    }, Math.random() * 800)
  }
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
    const cols = ['#ff6eb4', '#ffd700', '#d48fea', '#ff4da6', '#80f0ff', '#c77dff', '#fff', '#ffb3e0']
    const col = cols[Math.floor(Math.random() * cols.length)]
    const x = Math.random() * W, y = Math.random() * H * 0.6
    const ps = []
    for (let i = 0; i < 70; i++) {
      const angle = (Math.PI * 2 / 70) * i
      const speed = Math.random() * 5 + 2
      ps.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, r: Math.random() * 2 + 1, col })
    }
    fwRockets.push(ps)
  }

  function draw() {
    if (!fwRunning) return
    ctx.fillStyle = 'rgba(10,0,20,0.18)'
    ctx.fillRect(0, 0, W, H)
    fwRockets = fwRockets.filter(ps => ps.some(p => p.alpha > 0.02))
    fwRockets.forEach(ps => ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.016
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.col; ctx.globalAlpha = Math.max(0, p.alpha); ctx.fill()
    }))
    ctx.globalAlpha = 1
    fwRafId = requestAnimationFrame(draw)
  }

  const iv = setInterval(launch, 300)
  draw()
  setTimeout(() => {
    clearInterval(iv)
    fwRunning = false
    cancelAnimationFrame(fwRafId)
    ctx.clearRect(0, 0, W, H)
  }, duration)
}

/* ══════════════════════════════════════════════
   SCENE 1: INTRO
   ══════════════════════════════════════════════ */
function SceneIntro({ onNext }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    spawnHearts(20)
  }, [])

  return (
    <div className="scene active" id="scene-intro">
      <div className="rose-petals">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="petal" style={{ '--i': i }} />
        ))}
      </div>

      <div className={`intro-content ${visible ? 'show' : ''}`}>
        <div className="intro-date-badge">🌹 Our Anniversary 🌹</div>
        <div className="intro-title">Happy Anniversary</div>
        <div className="intro-name">Vaishnavi</div>
        <div className="intro-subtitle">✨ You are my forever & always ✨</div>
        <div className="ily-text">I Love You 💖</div>

        <div className="hearts-row">
          {['💖', '🌸', '💕', '🌸', '💖'].map((h, i) => (
            <span key={i} className="heart">{h}</span>
          ))}
        </div>

        <div className="intro-quote">
          "Every moment with you is a treasure I keep close to my heart."
        </div>

        <button className="btn-primary" onClick={onNext}>
          💌 Open a Letter for You
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SCENE 2: LOVE LETTER
   ══════════════════════════════════════════════ */
function SceneLoveLetter({ onNext }) {
  const [opened, setOpened] = useState(false)
  const [typed, setTyped] = useState('')
  const [showBtn, setShowBtn] = useState(false)

  const letterText = `My Dearest Vaishnavi,

You make my world brighter just by being in it. Your smile, your laugh — everything about you is magic.

I didn't know what love truly felt like until you walked into my life. You are my best friend, my safe place, and my greatest adventure.

Thank you for every memory, every laugh, and every beautiful moment together.

I choose you. Today, tomorrow, and every day after. 💕

I Love You, Vaishnavi. 🌹

Forever yours ∞`

  const openLetter = () => {
    setOpened(true)
    spawnHearts(15)
    let i = 0
    const interval = setInterval(() => {
      setTyped(letterText.slice(0, i))
      i++
      if (i > letterText.length) {
        clearInterval(interval)
        setTimeout(() => setShowBtn(true), 500)
      }
    }, 18)
  }

  return (
    <div className="scene active" id="scene-letter">
      <div className="letter-scene-wrap">
        {!opened ? (
          <div className="envelope-wrap" onClick={openLetter}>
            <div className="envelope">
              <div className="envelope-flap" />
              <div className="envelope-body">
                <div className="envelope-heart">💌</div>
                <div className="envelope-hint">Tap to open your letter</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="letter-paper">
            <div className="letter-header">
              <span className="letter-rose">🌹</span>
              <span className="letter-heading">A Letter For You</span>
              <span className="letter-rose">🌹</span>
            </div>
            <div className="letter-body">{typed}<span className="cursor">|</span></div>
            {showBtn && (
              <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => { spawnConfetti(50); onNext() }}>
                📸 See Our Memories
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SCENE 3: MEMORY PHOTOS
   ══════════════════════════════════════════════ */
function ScenePhotos({ onNext }) {
  const photos = [
    '/images/aman1.jpeg',
    '/images/aman2.jpeg',
    '/images/aman3.jpeg',
    '/images/aman4.jpeg',
    '/images/aman5.jpeg',
    '/images/aman6.jpeg',
    '/images/aman7.jpeg',
    '/images/aman8.jpeg',
    '/images/aman9.jpeg',
    '/images/aman10.jpeg',
    '/images/aman11.jpeg',
  ]

  const captions = [
    'The day it all began... 💫',
    'Every smile with you is priceless 😊',
    'My favourite person in the world 💖',
    'Together is my favourite place 🌸',
    'You make every moment magical ✨',
    'Forever yours, always 💕',
    'Every day with you is a blessing 🌹',
    'You are my sunshine, always 🌟',
    'The best memories are with you 💝',
    'My heart is yours, forever 💗',
    'I Love You so much, Vaishnavi! 💖',
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => { spawnHearts(20) }, [])

  const goTo = (dir) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + dir + photos.length) % photos.length)
      setAnimating(false)
    }, 300)
  }

  return (
    <div className="scene active" id="scene-photos">
      <div className="photos-title">Our Memories 💕</div>

      <div className="photo-viewer">
        <button className="photo-nav left" onClick={() => goTo(-1)}>‹</button>

        <div className={`photo-frame ${animating ? 'fade-out' : 'fade-in'}`} onClick={() => goTo(1)}>
          <img
            src={photos[currentIndex]}
            alt={captions[currentIndex]}
            loading="lazy"
          />
          <div className="photo-glow" />
        </div>

        <button className="photo-nav right" onClick={() => goTo(1)}>›</button>
      </div>

      <div className="photo-caption">{captions[currentIndex]}</div>
      <div className="photo-dots">
        {photos.map((_, i) => (
          <span key={i} className={`pdot${i === currentIndex ? ' active' : ''}`} onClick={() => { if (!animating) setCurrentIndex(i) }} />
        ))}
      </div>
      <div className="photo-counter">{currentIndex + 1} / {photos.length}</div>

      <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => { spawnConfetti(60); spawnHearts(20); onNext() }}>
        💌 Read the Final Message
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SCENE 4: SPECIAL MESSAGE
   ══════════════════════════════════════════════ */
function SceneMessage({ fwCanvas }) {
  const [revealed, setRevealed] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)

  const reveal = () => {
    setRevealed(true)
    spawnConfetti(80)
    spawnHearts(30)
    setShowFireworks(true)
    if (fwCanvas?.current) startFireworks(fwCanvas.current, 5000)
  }

  const promises = [
    { icon: '🌹', text: 'I promise to love you more every single day' },
    { icon: '🤝', text: 'I promise to always be there for you' },
    { icon: '😊', text: 'I promise to make you smile, always' },
    { icon: '🛡️', text: 'I promise to protect your heart forever' },
    { icon: '✨', text: 'I promise to be your person, forever' },
  ]

  return (
    <div className="scene active" id="scene-message" style={{ overflowY: 'auto', paddingTop: 30 }}>
      <div className="message-title">My Promise to You 💕</div>

      {!revealed ? (
        <div className="gift-box" onClick={reveal}>
          <div className="gift-lid">
            <div className="gift-ribbon-h" />
            <div className="gift-ribbon-v" />
            <div className="gift-bow">🎀</div>
          </div>
          <div className="gift-body">
            <span>Tap to unwrap<br />your surprise 💝</span>
          </div>
        </div>
      ) : (
        <div className="promise-wrap">
          <div className="promise-intro">
            On this special day, I make these promises to you, Vaishnavi...
          </div>
          <div className="promises-list">
            {promises.map((p, i) => (
              <div
                key={i}
                className="promise-card"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="promise-icon">{p.icon}</span>
                <span className="promise-text">{p.text}</span>
              </div>
            ))}
          </div>

          <div className="final-heart-section">
            <div className="big-heart">💖</div>
            <div className="final-message">
              I Love You, Vaishnavi! 💖<br />
              Happy Anniversary, My Love 🌹
            </div>
            <div className="final-signature">
              Forever yours ∞
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function App() {
  const [scene, setScene] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(true)
  const audioRef = useRef(null)
  const fwCanvasRef = useRef(null)
  const particlesRef = useRef(null)

  // Background floating hearts particles
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

    const colors = ['#ff6eb4', '#d48fea', '#ffb3e0', '#ffd700', '#ff4da6', '#c77dff', '#ff8fab']
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3, dy: -Math.random() * 0.4 - 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.pulse += 0.02
        p.alpha = 0.25 + 0.45 * Math.abs(Math.sin(p.pulse))
        p.x += p.dx; p.y += p.dy
        if (p.y < -10) p.y = H + 10
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
      })
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafId) }
  }, [])

  // Auto-play music on load; fallback to first click if browser blocks
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.7
    audioRef.current.play()
      .then(() => setMusicPlaying(true))
      .catch(() => {
        // Browser blocked autoplay — play on first interaction
        setMusicPlaying(false)
        const handler = () => {
          audioRef.current?.play().then(() => setMusicPlaying(true)).catch(() => {})
        }
        document.addEventListener('click', handler, { once: true })
      })
  }, [])

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
    else { audioRef.current.play().catch(() => { }); setMusicPlaying(true) }
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

  // Initial hearts
  useEffect(() => { setTimeout(() => spawnHearts(15), 500) }, [])

  const sceneIcons = ['💖', '💌', '📸', '💝']

  return (
    <>

      {/* Background */}
      <div className="bg" />
      <canvas ref={particlesRef} id="particles-canvas" />
      <canvas ref={fwCanvasRef} id="fireworks-canvas" />

      {/* Transition overlay */}
      <div className={`trans-overlay${transitioning ? ' visible' : ''}`} />

      {/* Music button */}
      <button className="music-btn" onClick={toggleMusic} title="Toggle Music">
        {musicPlaying ? '🎵' : '🔇'}
      </button>

      {/* Audio */}
      <audio ref={audioRef} loop>
        <source src="/music/bg.mp3" type="audio/mpeg" />
      </audio>

      {/* Nav dots */}
      <div className="nav-dots">
        {sceneIcons.map((icon, i) => (
          <button
            key={i}
            className={`nav-dot${scene === i ? ' active' : ''}`}
            onClick={() => goToScene(i)}
            title={['Intro', 'Love Letter', 'Memories', 'Promise'][i]}
          />
        ))}
      </div>

      {/* Scene labels */}
      <div className="scene-label">
        {['Our Anniversary', 'Your Letter', 'Our Memories', 'My Promise'][scene]}
      </div>

      {/* Scenes */}
      {scene === 0 && <SceneIntro onNext={() => goToScene(1)} />}
      {scene === 1 && <SceneLoveLetter onNext={() => goToScene(2)} />}
      {scene === 2 && <ScenePhotos onNext={() => goToScene(3)} />}
      {scene === 3 && <SceneMessage fwCanvas={fwCanvasRef} />}
    </>
  )
}
