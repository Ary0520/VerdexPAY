import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Brand tokens (match app exactly) ──────────────────────────────────────
const G = {
  green:      '#006D33',
  greenLight: '#00D66B',
  grad:       'linear-gradient(160deg, #006D33 0%, #00D66B 100%)',
  gradCTA:    'linear-gradient(158deg, #006D33 0%, #00D66B 100%)',
  text:       '#191C1D',
  sub:        '#3F493F',
  muted:      '#737373',
  border:     '#EDEEEF',
  bg:         '#F8F9FA',
  bgAlt:      '#F3F4F5',
  card:       '#FFFFFF',
  accent:     '#50FD8D',
}

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${scrolled ? G.border : 'transparent'}`,
      boxShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.2s',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: 72,
      }}>
        {/* Logo */}
        <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: G.green, letterSpacing: '-0.025em', cursor: 'pointer' }}>
          VerdexPay
        </div>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
          {['Solutions', 'Global Network', 'Pricing', 'Company'].map(link => (
            <a key={link} href="#" style={{ fontFamily: 'Manrope', fontWeight: 500, fontSize: 16, color: '#525252', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = G.green}
              onMouseLeave={e => e.target.style.color = '#525252'}
            >{link}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 500, fontSize: 16, color: '#525252', padding: '8px 0' }}>
            Log In
          </button>
          <button onClick={onLogin} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: G.grad, color: '#fff',
            fontFamily: 'Manrope', fontWeight: 600, fontSize: 16,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,109,51,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,109,51,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,109,51,0.25)' }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }) {
  return (
    <section style={{
      minHeight: '100vh',
      backgroundColor: G.bg,
      display: 'flex', alignItems: 'center',
      padding: '120px 32px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Green glow blob behind phone */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        backgroundColor: 'rgba(80,253,141,0.2)', filter: 'blur(100px)',
        top: 16, right: -60, pointerEvents: 'none',
      }}/>

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>

        {/* Left — copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 560, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', backgroundColor: 'rgba(0,109,51,0.08)', borderRadius: 9999, width: 'fit-content', border: '1px solid rgba(0,109,51,0.15)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: G.greenLight, display: 'inline-block' }}/>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: G.green }}>Now live on Base · Zero fees</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Manrope', fontWeight: 800, fontSize: 'clamp(40px, 4.5vw, 56px)',
            lineHeight: 1.1, letterSpacing: '-0.02em', color: G.text, margin: 0,
          }}>
            The international<br/>
            payment account for<br/>
            the global workforce
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.6,
            color: G.sub, margin: 0, maxWidth: 448,
          }}>
            Send and receive dollars instantly — to anyone, anywhere — using just a username. No bank account required. No fees. No waiting.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              padding: '16px 32px', borderRadius: 12, border: 'none',
              background: G.grad, color: '#fff',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 16,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,109,51,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,109,51,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,109,51,0.3)' }}
            >
              Get your @handle — it's free
            </button>
            <a href="#how-it-works" style={{
              padding: '16px 32px', borderRadius: 12,
              border: `1px solid ${G.border}`,
              fontFamily: 'Inter', fontWeight: 600, fontSize: 16,
              color: G.text, textDecoration: 'none', backgroundColor: G.card,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.green}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust micro-copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {['Works with Google or email', 'No crypto knowledge needed', 'Instant setup'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L2 3.5V7C2 9.985 4.24 12.785 7 13.5C9.76 12.785 12 9.985 12 7V3.5L7 1Z" stroke={G.green} strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M4.5 7L6.5 9L9.5 5.5" stroke={G.green} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: G.sub }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — phone mockup */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: 48, overflow: 'hidden',
            border: '8px solid #E1E3E4',
            boxShadow: '0 24px 80px rgba(25,28,29,0.18)',
            width: 'min(347px, 90%)',
            aspectRatio: '347/693',
            position: 'relative',
          }}>
            <img
              src="/hero-phone.jpg"
              alt="VerdexPay app dashboard"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Pain Section ───────────────────────────────────────────────────────────
function PainSection() {
  return (
    <section style={{
      backgroundColor: G.text,
      padding: '128px 192px',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: 'Manrope', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 40px)',
        lineHeight: 1.2, letterSpacing: '-0.01em',
        color: '#FFFFFF', margin: 0,
      }}>
        PayPal takes 3–5 days and charges 4.4%.<br/>
        Wise takes a cut too.<br/>
        Your client paid you — but you're still waiting.
      </h2>
    </section>
  )
}

// ── How It Works ───────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Claim your handle',
      body: 'Pick @yourname. Share it with anyone — clients, collaborators, friends. That\'s your payment address. No account numbers. No IBANs. No routing codes.',
    },
    {
      n: '2',
      title: 'Get paid in seconds',
      body: 'Your client opens verdexpay.app/pay/@you, types an amount, hits send. Money arrives in under 3 seconds. They don\'t need a VerdexPay account.',
    },
    {
      n: '3',
      title: 'Hold in dollars, spend when ready',
      body: 'Your balance stays in USDC — a dollar-backed digital currency. Convert when the rate is right. Send to your bank when you\'re ready.',
    },
  ]

  return (
    <section id="how-it-works" style={{ padding: '120px 32px', backgroundColor: G.bg }}>
      <div style={{ maxWidth: 1216, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {steps.map(s => (
            <div key={s.n} style={{
              backgroundColor: G.card, borderRadius: 12, padding: 32,
              border: `1px solid ${G.border}`,
              boxShadow: '0 4px 12px rgba(25,28,29,0.04)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {/* Number badge */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: G.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: '#007236' }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: G.text, margin: 0, paddingTop: 9 }}>{s.title}</h3>
              <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: G.sub, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features ───────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
          <path d="M13.5 2L3 7.5V13.5C3 19.5 7.8 25.2 13.5 27C19.2 25.2 24 19.5 24 13.5V7.5L13.5 2Z" stroke={G.green} strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M9 13.5L12 16.5L18 10.5" stroke={G.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Zero Fees. Seriously.',
      body: 'No transfer fee. No conversion markup. No "international payment surcharge." What your client sends is exactly what you receive.',
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke={G.green} strokeWidth="1.8"/>
          <path d="M15 8V15L19 19" stroke={G.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Arrives in Under 3 Seconds',
      body: 'Not 3 days. Not 3 hours. 3 seconds. The moment your client hits send, the money is in your account.',
    },
    {
      icon: (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="1" y="1" width="26" height="18" rx="3" stroke={G.green} strokeWidth="1.8"/>
          <path d="M1 7H27" stroke={G.green} strokeWidth="1.8"/>
          <path d="M6 13H10" stroke={G.green} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      title: 'A Payment Link That Actually Works',
      body: 'Share verdexpay.app/pay/@you anywhere — invoice, email, Twitter bio, WhatsApp. Your client clicks, pays, done. No app download required on their end.',
    },
  ]

  return (
    <section style={{ backgroundColor: G.bgAlt, padding: '119px 32px 120px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 64 }}>
        <h2 style={{
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, lineHeight: 1.3,
          color: G.text, textAlign: 'center', margin: 0,
        }}>
          Professional infrastructure, zero friction
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{
              backgroundColor: G.card, borderRadius: 16, padding: 40,
              boxShadow: '0 4px 12px rgba(25,28,29,0.04)',
              display: 'flex', flexDirection: 'column', gap: 15,
            }}>
              <div>{f.icon}</div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: G.text, margin: 0, paddingTop: 9 }}>{f.title}</h3>
              <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: G.sub, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    {
      quote: "I sent my client a payment link in my invoice. They paid from the US. I had the money in 3 seconds. I used to wait a week for Wise.",
      name: 'Priya M.',
      role: 'Freelance Designer · India',
    },
    {
      quote: "I work with 4 clients across 3 countries. VerdexPay is the only payment method all of them can use without friction.",
      name: 'Chidi O.',
      role: 'Remote Developer · Nigeria',
    },
    {
      quote: "My client didn't have crypto. Didn't matter. They just opened my link and paid. The whole thing took 20 seconds.",
      name: 'Lucas R.',
      role: 'Independent Consultant · Brazil',
    },
  ]

  return (
    <section style={{ backgroundColor: G.bg, padding: '120px 32px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 56 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, color: G.text, margin: 0 }}>
            Built for the way you actually work
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {quotes.map(q => (
            <div key={q.name} style={{
              backgroundColor: G.card, borderRadius: 16, padding: 32,
              border: `1px solid ${G.border}`,
              borderLeft: `4px solid ${G.green}`,
              boxShadow: '0 4px 12px rgba(25,28,29,0.04)',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 400, fontSize: 16, lineHeight: 1.7, color: G.sub, margin: 0 }}>
                "{q.quote}"
              </p>
              <div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: G.text }}>{q.name}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: G.muted, marginTop: 2 }}>{q.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Objection Section ──────────────────────────────────────────────────────
function Objection() {
  return (
    <section style={{ backgroundColor: G.bgAlt, padding: '120px 32px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 'clamp(28px, 3vw, 36px)', lineHeight: 1.2, color: G.text, margin: 0 }}>
          "But I don't know anything about crypto."
        </h2>
        <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.7, color: G.sub, margin: 0 }}>
          Neither do most of our users. VerdexPay handles everything behind the scenes. You log in with Google, get a wallet automatically, and use the app like any other payment tool. The only difference is it works everywhere, instantly, for free.
        </p>
        <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 13, color: G.muted, margin: 0 }}>
          Powered by USDC (USD Coin) — a regulated, dollar-backed digital currency issued by Circle. 1 USDC = $1.00, always.
        </p>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────────────────
function FinalCTA({ onGetStarted }) {
  return (
    <section style={{
      background: G.gradCTA,
      padding: '119px 256px 120px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 31 }}>
        <h2 style={{
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 'clamp(40px, 4.5vw, 56px)',
          lineHeight: 1.1, letterSpacing: '-0.025em',
          color: '#FFFFFF', textAlign: 'center', margin: 0,
        }}>
          Get paid the way<br/>you deserve.
        </h2>
        <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', textAlign: 'center', margin: 0 }}>
          Claim your free handle in 30 seconds. No credit card. No crypto wallet. Just your Google account.
        </p>
        <button onClick={onGetStarted} style={{
          padding: '21px 40px', borderRadius: 12, border: 'none',
          backgroundColor: '#FFFFFF', color: G.text,
          fontFamily: 'Inter', fontWeight: 600, fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)' }}
        >
          Get Started Now
        </button>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          verdexpay.app/pay/@yourname · Share it anywhere
        </p>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      backgroundColor: G.card,
      borderTop: `1px solid ${G.border}`,
      padding: '48px 0',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', flexWrap: 'wrap', gap: 24,
      }}>
        <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: '#171717' }}>
          VerdexPay
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Security', 'Privacy', 'Terms', 'Status', 'Support'].map(link => (
            <a key={link} href="#" style={{ fontFamily: 'Manrope', fontWeight: 400, fontSize: 14, color: G.muted, textDecoration: 'none', letterSpacing: '0.025em', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = G.green}
              onMouseLeave={e => e.target.style.color = G.muted}
            >{link}</a>
          ))}
        </div>

        <div style={{ fontFamily: 'Manrope', fontWeight: 400, fontSize: 14, color: G.muted, letterSpacing: '0.025em', textAlign: 'right' }}>
          © 2025 VerdexPay. Precision infrastructure for the global workforce.
        </div>
      </div>
    </footer>
  )
}

// ── Main Landing Page ──────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const { ready, authenticated } = useAuth()

  // Once Privy finishes initializing, redirect authenticated users to dashboard
  useEffect(() => {
    if (ready && authenticated) navigate('/dashboard', { replace: true })
  }, [ready, authenticated, navigate])

  const handleGetStarted = () => {
    navigate('/login')
  }

  // Show minimal loader while Privy initializes — prevents flash before redirect
  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
      <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: '#006D33' }}>VerdexPay</div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: G.bg }}>
      <Nav onLogin={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <PainSection />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Objection />
      <FinalCTA onGetStarted={handleGetStarted} />
      <Footer />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </div>
  )
}
