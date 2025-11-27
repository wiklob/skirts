import { useState, useEffect } from 'react'
import './MobileScreen.css'

const ASCII_COMPUTER = `
    ┌───────────────────────┐
    │  ┌─────────────────┐  │
    │  │                 │  │
    │  │    ╳     ╳      │  │
    │  │                 │  │
    │  │       ───       │  │
    │  │                 │  │
    │  └─────────────────┘  │
    │   ◉                   │
    └───────────────────────┘
    ║║║║║║║║║
    ┌───────────────┐
    └───────────────┘
`

const TERMINAL_LINES = [
  '> SKIRT DATABASE v1.0',
  '> initializing...',
  '> checking viewport...',
  '> ERROR: display_width < minimum',
  '> ',
  '> desktop browser required',
]

export function MobileScreen() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [showFinalMessage, setShowFinalMessage] = useState(false)

  const isTypingComplete = currentLineIndex >= TERMINAL_LINES.length

  // Show final message after typing completes
  useEffect(() => {
    if (isTypingComplete) {
      const timeout = setTimeout(() => {
        setShowFinalMessage(true)
      }, 600)
      return () => clearTimeout(timeout)
    }
  }, [isTypingComplete])

  // Typing animation
  useEffect(() => {
    if (currentLineIndex >= TERMINAL_LINES.length) return

    const currentLine = TERMINAL_LINES[currentLineIndex]

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev]
          if (newLines.length <= currentLineIndex) {
            newLines.push(currentLine.slice(0, currentCharIndex + 1))
          } else {
            newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1)
          }
          return newLines
        })
        setCurrentCharIndex(prev => prev + 1)
      }, 30 + Math.random() * 40) // Variable typing speed for realism

      return () => clearTimeout(timeout)
    } else {
      // Move to next line after a pause
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
        setCurrentCharIndex(0)
      }, currentLine.startsWith('> ERROR') ? 800 : 300)

      return () => clearTimeout(timeout)
    }
  }, [currentLineIndex, currentCharIndex])

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mobile-screen">
      {/* CRT Scanlines overlay */}
      <div className="scanlines" />

      {/* Content */}
      <div className="mobile-content">
        {/* ASCII Computer */}
        <pre className="ascii-computer">{ASCII_COMPUTER}</pre>

        {/* Terminal output */}
        <div className="terminal-output">
          {displayedLines.map((line, index) => (
            <div
              key={index}
              className={`terminal-line ${line.includes('ERROR') ? 'error' : ''}`}
            >
              {line}
              {index === displayedLines.length - 1 && !isTypingComplete && (
                <span className={`cursor ${showCursor ? 'visible' : ''}`}>█</span>
              )}
            </div>
          ))}
        </div>

        {/* Final centered message */}
        {showFinalMessage && (
          <div className="final-message">
            &lt;switch to desktop to view the page&gt;
          </div>
        )}
      </div>
    </div>
  )
}
