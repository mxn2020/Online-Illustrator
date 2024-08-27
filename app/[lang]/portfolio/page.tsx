'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

import './animations.css'

const themes = [
  'minecraft',
  'windows95',
  'linux',
  'raspberry',
  'windowsxp',
  'macbook',
  'iphone'
]

interface FloatingElementProps {
  theme: string;
  id: number;
  onDestroy: (id: number) => void;
}

const FloatingElement = ({ theme, id, onDestroy }: FloatingElementProps) => {
  const [isExploding, setIsExploding] = useState(false)
  const size = Math.floor(Math.random() * 50) + 20 // Random size between 20 and 70px
  const left = Math.random() * 100 // Random left position
  const top = Math.random() * 100 // Random top position
  const animationDuration = Math.floor(Math.random() * 20) + 10 // Random duration between 10 and 30s

  const getElementStyle = () => {
    switch (theme) {
      case 'minecraft':
        return 'bg-green-600 rounded-none'
      case 'windows95':
        return 'bg-blue-500 rounded-sm'
      case 'linux':
        return 'bg-yellow-300 rounded-full'
      case 'raspberry':
        return 'bg-pink-400 rounded-lg'
      case 'windowsxp':
        return 'bg-green-400 rounded-full'
      case 'macbook':
        return 'bg-gray-300 rounded-lg'
      case 'iphone':
        return 'bg-blue-300 rounded-2xl'
      default:
        return 'bg-gray-500 rounded-md'
    }
  }

  useEffect(() => {
    if (isExploding) {
      const timer = setTimeout(() => onDestroy(id), 1000)
      return () => clearTimeout(timer)
    }
  }, [isExploding, id, onDestroy])

  return (
    <div
      className={`absolute opacity-20 ${getElementStyle()} ${isExploding ? 'animate-explode' : ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animation: isExploding ? 'none' : `float ${animationDuration}s infinite alternate`
      }}
      data-testid="floating-element"
    />
  )
}

const Ship = ({ onShoot }: { onShoot: (x: number, y: number) => void }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const shipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveShip = () => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      setPosition({ x, y })
    }

    const shootInterval = setInterval(() => {
      if (shipRef.current) {
        const rect = shipRef.current.getBoundingClientRect()
        onShoot(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }, 10000) // Shoot every 10 seconds

    const moveInterval = setInterval(moveShip, 20000) // Move every 20 seconds

    return () => {
      clearInterval(moveInterval)
      clearInterval(shootInterval)
    }
  }, [onShoot])

  return (
    <div
      ref={shipRef}
      className="absolute w-0 h-0 transition-all duration-[20s] ease-linear"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '20px solid rgba(255, 255, 255, 0.5)',
        transform: 'rotate(90deg)',
      }}
      data-testid="ship"
    />
  )
}

export default function Component() {
  const [email, setEmail] = useState("")
  const [theme, setTheme] = useState(() => themes[Math.floor(Math.random() * themes.length)])
  const [nextTheme, setNextTheme] = useState("")
  const [progress, setProgress] = useState(0)
  const [floatingElements, setFloatingElements] = useState<JSX.Element[]>([])
  const [shots, setShots] = useState<{ x: number, y: number, id: number }[]>([])

  useEffect(() => {
    const intervalTime = 30000
    const updateInterval = 100 // Update progress every 100ms

    const timer = setInterval(() => {
      setTheme(prevTheme => {
        const currentIndex = themes.indexOf(prevTheme)
        const nextIndex = (currentIndex + 1) % themes.length
        setNextTheme(themes[nextIndex])
        return themes[nextIndex]
      })
      setProgress(0)
    }, intervalTime)

    const progressTimer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          return 0
        }
        return prevProgress + (100 / (intervalTime / updateInterval))
      })
    }, updateInterval)

    return () => {
      clearInterval(timer)
      clearInterval(progressTimer)
    }
  }, [])

  useEffect(() => {
    const newElements = Array.from({ length: 5 }, (_, i) => (
      <FloatingElement key={i} id={i} theme={theme} onDestroy={(id) => {
        setFloatingElements(prev => prev.filter(el => el.props.id !== id))
      }} />
    ))
    setFloatingElements(newElements)
  }, [theme])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Subscribed with email:", email)
    setEmail("")
  }

  const handleNextTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
    setNextTheme(themes[(nextIndex + 1) % themes.length])
    setProgress(0)
  }

  const handleShoot = (x: number, y: number) => {
    const newShot = { x, y, id: Date.now() }
    setShots(prev => [...prev, newShot])
    setTimeout(() => {
      setShots(prev => prev.filter(shot => shot.id !== newShot.id))
    }, 1000)
  }

  const getThemeClasses = () => {
    switch (theme) {
      case 'minecraft':
        return 'bg-[#8B8B8B] text-white font-minecraft text-lg border-4 border-black'
      case 'windows95':
        return 'bg-[#008080] text-black font-sans text-base border-2 border-white'
      case 'linux':
        return 'bg-black text-green-400 font-mono text-sm border-none'
      case 'raspberry':
        return 'bg-[#BC1142] text-white font-sans text-base border-4 border-white rounded-lg'
      case 'windowsxp':
        return 'bg-[#ECE9D8] text-black font-sans text-lg border-b-4 border-b-blue-600'
      case 'macbook':
        return 'bg-gradient-to-b from-gray-100 to-gray-300 text-black font-sans text-base border-none rounded-2xl'
      case 'iphone':
        return 'bg-black text-white font-sans text-sm border-none rounded-3xl'
      default:
        return 'bg-white text-black font-sans text-base border-none'
    }
  }

  return (
    <div className={`min-h-screen p-4 transition-colors duration-1000 ease-in-out relative overflow-hidden ${getThemeClasses()}`}>
      {floatingElements}
      <Ship onShoot={handleShoot} />
      {shots.map(shot => (
        <div
          key={shot.id}
          className="absolute w-2 h-2 bg-red-500 rounded-full animate-shoot"
          style={{ left: shot.x, top: shot.y }}
        />
      ))}
      <div className="mx-auto max-w-3xl relative z-10">
        <header className="mb-8 text-center">
          <h1 className={`mb-4 text-4xl font-bold ${theme === 'minecraft' ? 'text-yellow-300 shadow-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]' : ''}`}>
            My Projects
          </h1>
          <nav className="space-x-4">
            <Button variant="outline" className={`px-4 py-2 ${theme === 'minecraft' ? 'border-2 border-black bg-[#C6C6C6] text-black hover:bg-[#DBDBDB]' : ''}`}>Home</Button>
            <Button variant="outline" className={`px-4 py-2 ${theme === 'minecraft' ? 'border-2 border-black bg-[#C6C6C6] text-black hover:bg-[#DBDBDB]' : ''}`}>About</Button>
            <Button variant="outline" className={`px-4 py-2 ${theme === 'minecraft' ? 'border-2 border-black bg-[#C6C6C6] text-black hover:bg-[#DBDBDB]' : ''}`}>Contact</Button>
          </nav>
        </header>

        <main className="space-y-8">
          <section className={`rounded-lg p-4 ${theme === 'minecraft' ? 'bg-[#C6C6C6] text-black' : 'bg-opacity-20 bg-white'}`}>
            <h2 className="mb-4 text-2xl font-bold">Current Projects</h2>
            <ul className="list-inside list-disc space-y-2">
              <li><a href="#" className="text-blue-700 hover:underline">Illustrator App</a></li>
              <li><a href="#" className="text-blue-700 hover:underline">Localization Generator App</a></li>
            </ul>
          </section>

          <section className={`rounded-lg p-4 ${theme === 'minecraft' ? 'bg-[#C6C6C6] text-black' : 'bg-opacity-20 bg-white'}`}>
            <h2 className="mb-4 text-2xl font-bold">About Me</h2>
            <p className="mb-4">I&apos;m a passionate developer with a love for creating unique applications. My past projects have ranged from game development to productivity tools.</p>
            <h3 className="mb-2 text-xl font-bold">Upcoming Projects</h3>
            <ul className="list-inside list-disc">
              <li>AI-powered task manager</li>
              <li>Virtual reality painting app</li>
              <li>Blockchain-based voting system</li>
            </ul>
          </section>

          <section className={`rounded-lg p-4 ${theme === 'minecraft' ? 'bg-[#C6C6C6] text-black' : 'bg-opacity-20 bg-white'}`}>
            <h2 className="mb-4 text-2xl font-bold">Subscribe to Newsletter</h2>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`border-2 ${theme === 'minecraft' ? 'border-black bg-white' : 'border-gray-300'}`}
                required

              />
              <Button type="submit" className={`px-4 py-2 ${theme === 'minecraft' ? 'border-2 border-black bg-[#54AC68] text-white hover:bg-[#3D8C4E]' : ''}`} disabled>
                Subscribe
              </Button>
            </form>
          </section>

          <section className={`rounded-lg p-4 ${theme === 'minecraft' ? 'bg-[#C6C6C6] text-black' : 'bg-opacity-20 bg-white'}`}>
            <h2 className="mb-4 text-2xl font-bold">v0 Generations</h2>
            <ul className="list-inside list-disc space-y-2">
              <li><a href="#" className="text-blue-700 hover:underline">Responsive Dashboard</a></li>
              <li><a href="#" className="text-blue-700 hover:underline">E-commerce Product Page</a></li>
              <li><a href="#" className="text-blue-700 hover:underline">Social Media Feed</a></li>
              <li><a href="#" className="text-blue-700 hover:underline">Weather App UI</a></li>
            </ul>
          </section>

          <section className={`rounded-lg p-4 ${theme === 'minecraft' ? 'bg-[#C6C6C6] text-black' : 'bg-opacity-20 bg-white'}`}>
            <h2 className="mb-4 text-2xl font-bold">Theme Switcher</h2>
            <div className="flex items-center justify-between">
              <div>
                <p>Current theme: {theme}</p>
                <p>Next theme: {nextTheme}</p>
              </div>
              <Button onClick={handleNextTheme} className={`px-4 py-2 ${theme === 'minecraft' ? 'border-2 border-black bg-[#54AC68] text-white hover:bg-[#3D8C4E]' : ''}`}>
                Next Theme
              </Button>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-sm">
          © 2023 Multi-Theme Portfolio. All rights reserved.
        </footer>
      </div>
    </div>
  )
}