import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

const SPLINE_SCENE_URL = 'https://prod.spline.design/XMCI969UFpoTXXem/scene.splinecode'

type FeatureItem = {
  iconPattern: string[]
  iconColor: string
  title: string
  description: string
  glow: string
}



const headlineFont: CSSProperties = { fontFamily: "'Press Start 2P', cursive" }
const bodyFont: CSSProperties = { fontFamily: "'Silkscreen', cursive" }
const buttonFont: CSSProperties = { fontFamily: "'Press Start 2P', cursive" }

const features: FeatureItem[] = [
  {
    iconPattern: [
      '00111100',
      '01111110',
      '11111111',
      '11111111',
      '11111111',
      '11111111',
      '01111110',
      '00111100',
    ],
    iconColor: '#818cf8',
    title: 'Manoj Kiran',
    description: 'Lead Developer & Architect',
    glow: 'rgba(79, 70, 229, 0.32)',
  },
  {
    iconPattern: [
      '00111100',
      '01111110',
      '11111111',
      '11111111',
      '11111111',
      '11111111',
      '01111110',
      '00111100',
    ],
    iconColor: '#facc15',
    title: 'Sneha Deepika',
    description: 'Frontend Developer',
    glow: 'rgba(249, 115, 22, 0.28)',
  },
  {
    iconPattern: [
      '00111100',
      '01111110',
      '11111111',
      '11111111',
      '11111111',
      '11111111',
      '01111110',
      '00111100',
    ],
    iconColor: '#34d399',
    title: 'Sathvika',
    description: 'UI/UX Designer',
    glow: 'rgba(16, 185, 129, 0.28)',
  },
  {
    iconPattern: [
      '00111100',
      '01111110',
      '11111111',
      '11111111',
      '11111111',
      '11111111',
      '01111110',
      '00111100',
    ],
    iconColor: '#fb7185',
    title: 'Ushasri',
    description: 'Content Strategist',
    glow: 'rgba(244, 63, 94, 0.28)',
  },
]



function PixelLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="5" y="4" width="18" height="24" fill="#ffffff" />
      <rect x="7" y="6" width="14" height="2" fill="#0a0a0f" opacity="0.14" />
      <rect x="7" y="10" width="10" height="2" fill="#0a0a0f" opacity="0.14" />
      <rect x="25" y="7" width="2" height="6" fill="#818cf8" />
      <rect x="23" y="9" width="6" height="2" fill="#818cf8" />
      <rect x="24" y="8" width="4" height="4" fill="#818cf8" opacity="0.75" />
    </svg>
  )
}

function PixelIcon({ pattern, color }: { pattern: string[]; color: string }) {
  return (
    <div className="grid grid-cols-8 gap-[2px]" aria-hidden="true">
      {pattern.flatMap((row, rowIndex) =>
        row.split('').map((cell, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className="size-[4px]"
            style={{ backgroundColor: cell === '1' ? color : 'transparent' }}
          />
        )),
      )}
    </div>
  )
}



function PixelDivider() {
  const colors = ['#818cf8', '#a855f7', '#818cf8', '#a855f7', '#818cf8', '#a855f7', '#818cf8']
  return (
    <div className="flex justify-center py-8" aria-hidden="true">
      <div className="flex items-center gap-2">
        {colors.map((color, index) => (
          <span key={index} className="size-2" style={{ backgroundColor: color, opacity: 0.7 }} />
        ))}
      </div>
    </div>
  )
}

function PixelDownArrow() {
  const pattern = ['00100', '01110', '11111']
  return (
    <div className="grid grid-cols-5 gap-[2px]" aria-hidden="true">
      {pattern.flatMap((row, rowIndex) =>
        row.split('').map((cell, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className="size-[4px]"
            style={{ backgroundColor: cell === '1' ? 'rgba(255,255,255,0.85)' : 'transparent' }}
          />
        )),
      )}
    </div>
  )
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-zinc-300 transition hover:text-white"
      style={bodyFont}
    >
      {label}
    </button>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl" style={headlineFont}>{title}</h2>
      <p className="mt-4 text-sm text-zinc-300 md:text-base" style={bodyFont}>{subtitle}</p>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [disableSpline, setDisableSpline] = useState(false)
  const [splineLoaded, setSplineLoaded] = useState(false)
  const [navSolid, setNavSolid] = useState(false)

  useEffect(() => {
    // Retain this effect but remove the mobile disabling logic so Spline renders on all devices
    setDisableSpline(false)
  }, [])

  useEffect(() => {
    setSplineLoaded(disableSpline)
  }, [disableSpline])

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 32)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = navSolid
    ? 'bg-black/45 border-white/15'
    : 'bg-black/30 border-white/10'

  const pageTransition = useMemo(
    () => ({ duration: 0.45, ease: 'easeOut' as const }),
    [],
  )

  const sectionDotsStyle: CSSProperties = {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  }

  const scrollToSection = (id: 'features') => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-svh bg-[#0a0a0f] text-zinc-100">
      <motion.nav
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${navClass}`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <PixelLogo />
            <span className="text-sm font-semibold tracking-tight text-white sm:text-base" style={headlineFont}>AI Content Studio</span>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <NavLink label="Contributors" onClick={() => scrollToSection('features')} />
            <button
              type="button"
              onClick={goToLogin}
              className="border-2 border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
              style={buttonFont}
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.nav>

      <section className="relative flex min-h-svh w-full flex-col overflow-hidden md:flex-row">
        <div className="relative z-20 flex w-full items-center bg-[#0a0a0f] md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={pageTransition}
            className="pointer-events-auto w-full px-6 py-14 sm:px-10 md:px-[8%] md:py-0 lg:px-[10%]"
          >
            <div className="max-w-3xl">
              <div className="relative mb-6 inline-flex">
                <motion.div
                  aria-hidden="true"
                  className="absolute -inset-2 -z-10 bg-indigo-500/20 blur-xl"
                  animate={{ opacity: [0.2, 0.45, 0.2] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="inline-flex items-center gap-2 border-2 border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300" style={bodyFont}>
                  <span className="size-2 bg-emerald-300" />
                  Built by the Team
                </div>
              </div>

              <h1
                className="text-2xl font-semibold leading-relaxed tracking-tight text-white md:text-4xl"
                style={{ ...headlineFont, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
              >
                <span className="block">Create Content That</span>
                <span className="mt-3 block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Converts
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base" style={bodyFont}>
                Professional content generation across multiple styles and formats. Powered by advanced AI to help you create better content in seconds.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="border-2 border-indigo-300 bg-indigo-600 px-6 py-3 text-xs text-white transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#4f46e5]"
                    style={{ ...buttonFont, boxShadow: '4px 4px 0px #4f46e5' }}
                  >
                    Try It Free
                  </button>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="border-2 border-white/30 bg-transparent px-6 py-3 text-xs text-zinc-100 transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(255,255,255,0.45)]"
                    style={{ ...buttonFont, boxShadow: '4px 4px 0px rgba(255,255,255,0.35)' }}
                  >
                    See How It Works
                  </button>
                </motion.div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="inline-flex text-white/30 transition hover:text-white/60"
                  aria-label="Scroll to features"
                >
                  <div className="animate-bounce">
                    <PixelDownArrow />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative h-[300px] w-full overflow-hidden sm:h-[360px] md:h-svh md:w-1/2">
          {!disableSpline && (
            <div className="absolute inset-0">
              <div
                className="absolute inset-y-0 left-[-60%] h-full w-[178%]"
                style={{ filter: 'brightness(1.2)' }}
              >
                <Spline
                  scene={SPLINE_SCENE_URL}
                  onLoad={() => setSplineLoaded(true)}
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {!disableSpline && (
            <div className="pointer-events-none absolute inset-0 z-20 bg-[#0a0a0f]/25" />
          )}

          {!splineLoaded && !disableSpline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0a0f]/70"
            >
              <div className="flex items-center gap-3 text-sm text-zinc-300" style={bodyFont}>
                <span className="size-5 animate-spin border-2 border-zinc-700 border-t-indigo-400" />
                Loading experience...
              </div>
            </motion.div>
          )}

          {disableSpline && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#111122] via-[#15172a] to-[#1a1f36]" />
          )}

          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[60px] bg-gradient-to-r from-[#0a0a0f] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[50px] bg-gradient-to-b from-[#0a0a0f] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-[#0a0a0f]/50 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{ boxShadow: 'inset 0 0 100px rgba(10,10,15,0.25)' }}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-[3px] bg-indigo-400/30 blur-[2px] md:block" />
        </div>
      </section>

      <PixelDivider />

      <section id="features" className="relative min-h-svh overflow-hidden bg-[#0a0a0f] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0" style={sectionDotsStyle} />
        <div className="relative z-10">
          <SectionTitle
            title="Contributors"
            subtitle="The talented individuals behind the development and design of AI Content Studio."
          />

          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
                whileHover={{ y: -6 }}
                className="relative border-2 border-white/[0.12] bg-white/[0.03] p-6 transition"
                style={{ boxShadow: '0 0 0 rgba(0,0,0,0)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow = `0 14px 50px -22px ${feature.glow}`
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)'
                }}
              >
                <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-indigo-400/70" aria-hidden="true" />
                <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-purple-400/70" aria-hidden="true" />

                <PixelIcon pattern={feature.iconPattern} color={feature.iconColor} />
                <h3 className="mt-4 text-base font-semibold text-white md:text-lg" style={bodyFont}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300 md:text-base" style={bodyFont}>{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>







      <section className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.24),transparent_55%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl" style={headlineFont}>Ready to Create?</h2>
          <p className="mt-4 text-sm text-zinc-300 md:text-base" style={bodyFont}>Join thousands of creators using AI Content Studio</p>

          <button
            type="button"
            onClick={goToLogin}
            className="mt-8 border-2 border-indigo-300 bg-indigo-600 px-8 py-3.5 text-xs text-white transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#4f46e5]"
            style={{ ...buttonFont, boxShadow: '4px 4px 0px #4f46e5' }}
          >
            Start Creating
          </button>
        </motion.div>
      </section>
    </div>
  )
}