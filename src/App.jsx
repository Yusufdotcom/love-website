import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const NOTES = [
  { emoji: '✨', text: 'Your smile is the best part of my day.' },
  { emoji: '🌸', text: 'You make ordinary moments feel magical.' },
  { emoji: '💫', text: 'The world is brighter because you exist.' },
]

const FINAL_MESSAGE =
  'Sagal, you are loved more than words can say. Thank you for being you. 💕'

function FloatingHearts({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let hearts = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const spawnHeart = (x, y, burst = false) => {
      const count = burst ? 24 : 1
      for (let i = 0; i < count; i++) {
        hearts.push({
          x: x ?? Math.random() * canvas.width,
          y: y ?? canvas.height + 20,
          size: Math.random() * 14 + 8,
          speedY: -(Math.random() * 2 + 1.5),
          speedX: (Math.random() - 0.5) * (burst ? 6 : 1),
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          opacity: 1,
          hue: Math.random() * 30 + 330,
        })
      }
    }

    const drawHeart = (x, y, size, rotation, hue, opacity) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 75%, 65%)`
      ctx.beginPath()
      ctx.moveTo(0, size * 0.3)
      ctx.bezierCurveTo(0, 0, -size * 0.5, 0, -size * 0.5, size * 0.3)
      ctx.bezierCurveTo(-size * 0.5, size * 0.6, 0, size * 0.85, 0, size)
      ctx.bezierCurveTo(0, size * 0.85, size * 0.5, size * 0.6, size * 0.5, size * 0.3)
      ctx.bezierCurveTo(size * 0.5, 0, 0, 0, 0, size * 0.3)
      ctx.fill()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      hearts = hearts.filter((h) => h.opacity > 0.02 && h.y > -50)

      hearts.forEach((h) => {
        h.x += h.speedX
        h.y += h.speedY
        h.rotation += h.rotSpeed
        h.opacity -= 0.004
        drawHeart(h.x, h.y, h.size, h.rotation, h.hue, h.opacity)
      })

      if (Math.random() < 0.03) spawnHeart()

      animationId = requestAnimationFrame(draw)
    }

    const handleClick = (e) => spawnHeart(e.clientX, e.clientY, true)

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', handleClick)
    }
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} className="hearts-canvas" />
}

function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="sparkle" style={{ '--i': i }} />
      ))}
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [openedNotes, setOpenedNotes] = useState([])
  const [confetti, setConfetti] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const openNote = useCallback((index) => {
    setOpenedNotes((prev) =>
      prev.includes(index) ? prev : [...prev, index]
    )
  }, [])

  const allNotesOpen = openedNotes.length === NOTES.length

  const triggerSurprise = () => {
    setConfetti(true)
    setTimeout(() => setShowFinal(true), 600)
  }

  return (
    <div className={`scene step-${step}`}>
      <div className="bg-glow" aria-hidden="true" />
      <FloatingHearts active={step >= 1} />

      {/* Step 0 — sealed envelope */}
      {step === 0 && (
        <div className="screen envelope-screen">
          <p className="hint">Someone made this just for you…</p>
          <button
            className="envelope"
            onClick={() => setStep(1)}
            aria-label="Open envelope for Sagal"
          >
            <div className="envelope-flap" />
            <div className="envelope-body">
              <span className="envelope-label">For Sagal</span>
              <span className="envelope-seal">💌</span>
            </div>
          </button>
          <p className="tap-hint">tap to open</p>
        </div>
      )}

      {/* Step 1 — name reveal */}
      {step === 1 && (
        <div className="screen reveal-screen">
          <Sparkles />
          <p className="reveal-intro">Hey beautiful,</p>
          <h1 className="name">
            {'Sagal'.split('').map((char, i) => (
              <span key={i} className="name-letter" style={{ '--i': i }}>
                {char}
              </span>
            ))}
          </h1>
          <p className="reveal-sub">I made something special for you</p>
          <button className="btn-primary" onClick={() => setStep(2)}>
            Continue ✨
          </button>
        </div>
      )}

      {/* Step 2 — love notes */}
      {step === 2 && !showFinal && (
        <div className="screen notes-screen">
          <h2 className="notes-title">Open each one…</h2>
          <div className="notes-grid">
            {NOTES.map((note, i) => (
              <button
                key={i}
                className={`note-card ${openedNotes.includes(i) ? 'open' : ''}`}
                onClick={() => openNote(i)}
              >
                <span className="note-front">
                  <span className="note-emoji">{note.emoji}</span>
                  <span className="note-label">
                    {openedNotes.includes(i) ? '' : 'Tap me'}
                  </span>
                </span>
                <span className="note-back">{note.text}</span>
              </button>
            ))}
          </div>

          {allNotesOpen && (
            <button
              className="btn-primary btn-surprise"
              onClick={triggerSurprise}
            >
              One more surprise 💕
            </button>
          )}
        </div>
      )}

      {/* Step 3 — final message */}
      {showFinal && (
        <div className="screen final-screen">
          {confetti && (
            <div className="confetti-burst" aria-hidden="true">
              {Array.from({ length: 50 }).map((_, i) => (
                <span key={i} className="confetti-piece" style={{ '--i': i }} />
              ))}
            </div>
          )}
          <div className="final-card">
            <span className="final-heart">💖</span>
            <p className="final-text">{FINAL_MESSAGE}</p>
            <p className="final-sign">— with all my love</p>
          </div>
          <p className="click-anywhere">Click anywhere for hearts ✨</p>
        </div>
      )}
    </div>
  )
}
