import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './PopupWindow.css'

interface PopupWindowProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  skirtType?: string
  onImageClick?: (imagePath: string, breadcrumb: string) => void
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null

export const PopupWindow = ({ isOpen, onClose, title, children, skirtType, onImageClick }: PopupWindowProps) => {
  const [size, setSize] = useState({ width: 800, height: 650 })
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null)
  const [images, setImages] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHoveringBarRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const resizeStartSize = useRef({ width: 0, height: 0 })
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const windowStartPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      // Center the window when it opens, ensuring it fits in viewport
      const centerX = Math.max(0, Math.min((window.innerWidth - size.width) / 2, window.innerWidth - size.width))
      const centerY = Math.max(0, Math.min((window.innerHeight - size.height) / 2, window.innerHeight - size.height))
      setPosition({ x: centerX, y: centerY })
    }
  }, [isOpen])

  // Load images from imagerow folder
  useEffect(() => {
    if (skirtType) {
      // Define image ranges for each skirt type based on actual files
      const imageRanges: Record<string, number[]> = {
        pencil: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        pleated: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
        trapeze: [],
        wrap: []
      }

      const fileNumbers = imageRanges[skirtType] || []
      const imageList = fileNumbers.map(num =>
        `/skirt-folders/sections/${skirtType}/imagerow/${num}.jpg`
      )
      setImages(imageList)
    }
  }, [skirtType])

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current && images.length > 0) {
      let scrollPosition = scrollRef.current.scrollLeft
      const scrollSpeed = 0.5 // pixels per frame

      const animate = () => {
        if (scrollRef.current && !isHoveringBarRef.current) {
          scrollPosition += scrollSpeed
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth

          if (scrollPosition >= maxScroll) {
            scrollPosition = 0
          }

          scrollRef.current.scrollLeft = scrollPosition
        }

        // Only continue animation if not hovering
        if (!isHoveringBarRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          animationFrameRef.current = null
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }
  }, [images])

  // Handle hover state changes and restart animation when hover ends
  const handleMouseEnter = () => {
    isHoveringBarRef.current = true
  }

  const handleMouseLeave = () => {
    isHoveringBarRef.current = false
    // Restart animation if it was stopped
    if (animationFrameRef.current === null && scrollRef.current && images.length > 0) {
      let scrollPosition = scrollRef.current.scrollLeft
      const scrollSpeed = 0.5

      const animate = () => {
        if (scrollRef.current && !isHoveringBarRef.current) {
          scrollPosition += scrollSpeed
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth

          if (scrollPosition >= maxScroll) {
            scrollPosition = 0
          }

          scrollRef.current.scrollLeft = scrollPosition
        }

        if (!isHoveringBarRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          animationFrameRef.current = null
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }

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
        const newX = e.clientX - dragStartPos.current.x
        const newY = e.clientY - dragStartPos.current.y

        // Constrain to viewport
        const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - size.width))
        const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - size.height))

        setPosition({
          x: constrainedX,
          y: constrainedY,
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

        // Constrain size to viewport
        const maxWidth = window.innerWidth - newX
        const maxHeight = window.innerHeight - newY
        newWidth = Math.min(newWidth, maxWidth)
        newHeight = Math.min(newHeight, maxHeight)

        // Constrain position to viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth))
        newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight))

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
        <div
          className="popup-content"
          onWheel={(e) => {
            // Prevent scroll from propagating to parent when at scroll boundaries
            const element = e.currentTarget
            const atTop = element.scrollTop === 0
            const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1

            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
              e.preventDefault()
            }
            e.stopPropagation()
          }}
        >
          {children}
        </div>

        {/* Image Row Bar */}
        {skirtType && (
          <div
            className="popup-image-bar"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {images.length > 0 ? (
              <div ref={scrollRef} className="popup-image-bar-scroll">
                {images.concat(images).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${skirtType} ${index + 1}`}
                    className="popup-image-bar-item"
                    onClick={() => {
                      if (onImageClick) {
                        const breadcrumb = `/skirt-database/${skirtType}/imagerow/${img.split('/').pop()}`
                        onImageClick(img, breadcrumb)
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="popup-image-bar-placeholder">
                the images go here
              </div>
            )}
          </div>
        )}

        {/* Resize Handles */}
        <div className="popup-resize-handle popup-resize-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
        <div className="popup-resize-handle popup-resize-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
        <div className="popup-resize-handle popup-resize-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
        <div className="popup-resize-handle popup-resize-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        <div className="popup-resize-handle popup-resize-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
        <div className="popup-resize-handle popup-resize-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        <div className="popup-resize-handle popup-resize-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        <div className="popup-resize-handle popup-resize-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />

        {/* Resize Grip Indicator */}
        <div className="popup-resize-grip" />
      </motion.div>
    </motion.div>
  )
}
