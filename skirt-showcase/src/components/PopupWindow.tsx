import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './PopupWindow.css'

interface PopupWindowProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null

export const PopupWindow = ({ isOpen, onClose, title, children }: PopupWindowProps) => {
  const [size, setSize] = useState({ width: 600, height: 500 })
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const resizeStartSize = useRef({ width: 0, height: 0 })
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const windowStartPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      // Center the window when it opens
      const centerX = (window.innerWidth - size.width) / 2
      const centerY = (window.innerHeight - size.height) / 2
      setPosition({ x: centerX, y: centerY })
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.popup-resize-handle')) return
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    resizeStartSize.current = { ...size }
    resizeStartPos.current = { x: e.clientX, y: e.clientY }
    windowStartPos.current = { ...position }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        })
      }

      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStartPos.current.x
        const deltaY = e.clientY - resizeStartPos.current.y

        let newWidth = resizeStartSize.current.width
        let newHeight = resizeStartSize.current.height
        let newX = windowStartPos.current.x
        let newY = windowStartPos.current.y

        // Handle horizontal resizing
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(300, resizeStartSize.current.width + deltaX)
        } else if (resizeDirection.includes('w')) {
          const attemptedWidth = resizeStartSize.current.width - deltaX
          newWidth = Math.max(300, attemptedWidth)
          // Only move window if we're not at minimum width
          if (attemptedWidth >= 300) {
            newX = windowStartPos.current.x + deltaX
          } else {
            newX = windowStartPos.current.x + (resizeStartSize.current.width - 300)
          }
        }

        // Handle vertical resizing
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(200, resizeStartSize.current.height + deltaY)
        } else if (resizeDirection.includes('n')) {
          const attemptedHeight = resizeStartSize.current.height - deltaY
          newHeight = Math.max(200, attemptedHeight)
          // Only move window if we're not at minimum height
          if (attemptedHeight >= 200) {
            newY = windowStartPos.current.y + deltaY
          } else {
            newY = windowStartPos.current.y + (resizeStartSize.current.height - 200)
          }
        }

        setSize({ width: newWidth, height: newHeight })
        setPosition({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, resizeDirection, position])

  if (!isOpen) return null

  return (
    <motion.div
      className="popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="popup-window"
        style={{
          width: size.width,
          height: size.height,
          left: position.x,
          top: position.y,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Title Bar */}
        <div
          className="popup-titlebar"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
          <span className="popup-title">{title}</span>
        </div>

        {/* Content */}
        <div className="popup-content">
          {children}
        </div>

        {/* Resize Handles */}
        <div className="popup-resize-handle popup-resize-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
        <div className="popup-resize-handle popup-resize-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
        <div className="popup-resize-handle popup-resize-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
        <div className="popup-resize-handle popup-resize-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        <div className="popup-resize-handle popup-resize-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
        <div className="popup-resize-handle popup-resize-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        <div className="popup-resize-handle popup-resize-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        <div className="popup-resize-handle popup-resize-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      </motion.div>
    </motion.div>
  )
}
