import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './ImageZoomPopup.css'

interface ImageZoomPopupProps {
  imagePath: string
  onClose: () => void
  breadcrumb?: string
}

export const ImageZoomPopup = ({ imagePath, onClose, breadcrumb }: ImageZoomPopupProps) => {
  const [size, setSize] = useState({ width: 800, height: 650 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const resizeStartSize = useRef({ width: 0, height: 0 })
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const windowStartPos = useRef({ x: 0, y: 0 })
  const dragStartPos = useRef({ x: 0, y: 0 })
  const resizeDirection = useRef<string>('')

  useEffect(() => {
    // Center on mount with slight offset for cascade effect
    const offset = 50
    setPosition({
      x: (window.innerWidth - 800) / 2 + offset,
      y: (window.innerHeight - 650) / 2 + offset
    })
  }, [])

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeDirection.current = direction
    resizeStartSize.current = { ...size }
    resizeStartPos.current = { x: e.clientX, y: e.clientY }
    windowStartPos.current = { ...position }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    windowStartPos.current = { ...position }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x
      const deltaY = e.clientY - resizeStartPos.current.y
      const direction = resizeDirection.current

      let newWidth = resizeStartSize.current.width
      let newHeight = resizeStartSize.current.height
      let newX = windowStartPos.current.x
      let newY = windowStartPos.current.y

      if (direction.includes('e')) {
        newWidth = Math.max(300, resizeStartSize.current.width + deltaX)
      }
      if (direction.includes('w')) {
        newWidth = Math.max(300, resizeStartSize.current.width - deltaX)
        newX = windowStartPos.current.x + deltaX
      }
      if (direction.includes('s')) {
        newHeight = Math.max(200, resizeStartSize.current.height + deltaY)
      }
      if (direction.includes('n')) {
        newHeight = Math.max(200, resizeStartSize.current.height - deltaY)
        newY = windowStartPos.current.y + deltaY
      }

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y

      setPosition({
        x: windowStartPos.current.x + deltaX,
        y: windowStartPos.current.y + deltaY
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <motion.div
      className="image-zoom-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="image-zoom-container"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        style={{
          width: size.width,
          height: size.height,
          left: position.x,
          top: position.y,
          position: 'fixed'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="image-zoom-titlebar"
          onMouseDown={handleDragStart}
        >
          <button className="image-zoom-close" onClick={onClose}>
            ×
          </button>
          {breadcrumb && <span className="image-zoom-title">{breadcrumb}</span>}
        </div>
        <div className="image-zoom-content">
          <img src={imagePath} alt="Zoomed view" />
        </div>

        {/* Resize Handles */}
        <div className="image-zoom-resize-handle image-zoom-resize-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
        <div className="image-zoom-resize-handle image-zoom-resize-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
        <div className="image-zoom-resize-handle image-zoom-resize-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
        <div className="image-zoom-resize-handle image-zoom-resize-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        <div className="image-zoom-resize-handle image-zoom-resize-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
        <div className="image-zoom-resize-handle image-zoom-resize-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        <div className="image-zoom-resize-handle image-zoom-resize-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        <div className="image-zoom-resize-handle image-zoom-resize-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      </motion.div>
    </motion.div>
  )
}
