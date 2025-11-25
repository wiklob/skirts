import { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import './SketchbookViewer.css'

interface SketchbookViewerProps {
  onImageClick?: (imagePath: string, breadcrumb: string) => void
}

export const SketchbookViewer = ({ onImageClick }: SketchbookViewerProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const bookRef = useRef<any>(null)

  // Image numbers: 3-12
  const imageNumbers = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
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
  }

  const handleNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext()
    }
  }

  const handlePrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev()
    }
  }

  const handleImageClick = (index: number) => {
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
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={420}
          maxHeight={1350}
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

      <div className="sketchbook-controls">
        <button
          className="sketchbook-btn sketchbook-btn-prev"
          onClick={handlePrev}
          disabled={currentPage === 0}
        >
          ← Prev
        </button>
        <span className="sketchbook-page-indicator">
          Page {currentPage + 1}/{totalPages}
        </span>
        <button
          className="sketchbook-btn sketchbook-btn-next"
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
