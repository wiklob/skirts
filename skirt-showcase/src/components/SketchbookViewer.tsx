import { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './SketchbookViewer.css'

interface SketchbookViewerProps {
  onImageClick?: (imagePath: string, breadcrumb: string) => void
  onPageChange?: (page: number, totalPages: number) => void
  onBookReady?: (bookRef: any) => void
}

export const SketchbookViewer = ({ onPageChange, onBookReady }: SketchbookViewerProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [_currentPage, setCurrentPage] = useState(0)
  const bookRef = useRef<any>(null)

  // Image numbers: 7-19
  const imageNumbers = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  const imagePaths = imageNumbers.map(n => `/skirt-folders/sketchbook/${n}.jpg`)
  const totalPages = imagePaths.length

  // Preload all images
  useEffect(() => {
    let loadedCount = 0
    const imageElements: HTMLImageElement[] = []

    imagePaths.forEach(path => {
      const img = new Image()
      img.src = path
      img.onload = () => {
        loadedCount++
        if (loadedCount === imagePaths.length) {
          setImagesLoaded(true)
        }
      }
      imageElements.push(img)
    })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && bookRef.current) {
        bookRef.current.pageFlip().flipNext()
      } else if (e.key === 'ArrowLeft' && bookRef.current) {
        bookRef.current.pageFlip().flipPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFlip = (e: any) => {
    setCurrentPage(e.data)
    if (onPageChange) {
      onPageChange(e.data, totalPages)
    }
  }

  // Expose book ref to parent when ready
  useEffect(() => {
    if (imagesLoaded && bookRef.current && onBookReady) {
      onBookReady(bookRef.current)
    }
  }, [imagesLoaded, onBookReady])

  const handleImageClick = (_index: number) => {
    // Disabled - no zoom popup for sketchbook
    return
  }

  if (!imagesLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading sketchbook...
      </div>
    )
  }

  return (
    <div className="sketchbook-viewer">
      <div className="sketchbook-container">
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={778}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={446}
          maxHeight={1414}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="sketchbook-flipbook"
          style={{}}
          startZIndex={0}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={handleFlip}
        >
          {imagePaths.map((path, index) => (
            <div key={index} className="sketchbook-page">
              <img
                src={path}
                alt={`Sketchbook page ${index + 1}`}
                className="sketchbook-image"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  )
}
