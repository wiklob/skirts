import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PopupWindow } from './components/PopupWindow'
import { SkirtSection } from './components/SkirtSection'
import { RichTextSection } from './components/RichTextSection'
import { RestImages } from './components/RestImages'
import { ImageZoomPopup } from './components/ImageZoomPopup'
import { SketchbookViewer } from './components/SketchbookViewer'
import { useSkirtContent } from './hooks/useSkirtContent'
import './App.css'

type SkirtType = 'pencil' | 'pleated' | 'trapeze' | 'wrap' | 'aboutus' | 'sketchbook' | null

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedSkirt, setSelectedSkirt] = useState<SkirtType>(null)
  const [zoomedImage, setZoomedImage] = useState<{ path: string; breadcrumb: string; description?: string } | null>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Load skirt content using the new hook
  const { content, loading } = useSkirtContent(selectedSkirt)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Total number of frames
  const TOTAL_FRAMES = 73

  // Transform scroll progress to animation states
  const frameIndex = useTransform(scrollYProgress, [0, 0.6], [0, TOTAL_FRAMES - 1])
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.2, 2.5])
  const opacity = useTransform(scrollYProgress, [0.6, 0.9], [1, 0])
  const blur = useTransform(scrollYProgress, [0.6, 0.9], [0, 20])
  const blurFilter = useTransform(blur, (b) => `blur(${b}px)`)
  const contentOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1])

  // State to hold current frame number
  const [currentFrame, setCurrentFrame] = useState(0)

  // Update frame based on scroll
  useEffect(() => {
    return frameIndex.on('change', (latest) => {
      setCurrentFrame(Math.round(latest))
    })
  }, [frameIndex])

  // Check window width for narrow detection
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 768)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // Show mobile message
  if (isMobile) {
    return (
      <div className="app" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: '#000'
      }}>
        <div style={{
          color: '#fff',
          fontSize: 'clamp(1.2rem, 4vw, 2rem)',
          textAlign: 'center',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          lineHeight: '1.6',
          maxWidth: '600px'
        }}>
          this project is greater than mobile; use desktop browser instead
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Opening Animation Section */}
      <div ref={containerRef} className="opening-section">
        <motion.div
          className="skirt-animation-container"
          style={{
            opacity,
            filter: blurFilter
          }}
        >
          <motion.img
            src={`/frames/frame_${String(currentFrame).padStart(4, '0')}.png`}
            alt="Skirt animation"
            className="skirt-gif"
            style={{
              scale
            }}
          />
        </motion.div>

        {/* Content revealed behind */}
        <motion.div
          className="revealed-content"
          style={{ opacity: contentOpacity }}
        >
          <h1>SKIRT DATABASE</h1>
        </motion.div>
      </div>

      {/* Main Content Section with Sticky Banner */}
      <div className="content-wrapper">
        <div className="sticky-banner">
          <div className="banner-content">
            <h1 className="banner-title">SKIRT</h1>
            <img src="/database_gif.gif" alt="Database" className="banner-gif" />
          </div>
        </div>

        <section className="content-section">
          <div className="skirt-categories">
            <div className="category-grid">
              <div className="category-item" onClick={() => setSelectedSkirt('pencil')}>
                <img src="/folder_images/pencil_folder.png" alt="Pencil Skirt Folder" className="folder-icon" />
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('pleated')}>
                <img src="/folder_images/pleated_folder.png" alt="Pleated Skirt Folder" className="folder-icon" />
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('trapeze')}>
                <img src="/folder_images/trapeze_folder.png" alt="Trapeze Skirt Folder" className="folder-icon" />
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('wrap')}>
                <img src="/folder_images/wrap_folder.png" alt="Wrap Skirt Folder" className="folder-icon" />
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('aboutus')}>
                <img src="/folder_images/aboutus_folder.png" alt="About Us Folder" className="folder-icon" />
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('sketchbook')}>
                <img src="/folder_images/sketchbook_folder.png" alt="Sketchbook Folder" className="folder-icon" />
              </div>
            </div>
          </div>

          <div className="designed-by-section">
            <div className="designed-by-line"></div>
            <div className="designed-by-content">
              <h2 className="designed-by-title">DESIGNED BY:</h2>
              <ul className="designer-list">
                <li>Alejandro</li>
                <li>Alicia</li>
                <li>Kosta</li>
                <li>Marcel</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Popup Window */}
      {selectedSkirt && (
        <PopupWindow
          isOpen={!!selectedSkirt}
          onClose={() => setSelectedSkirt(null)}
          title={`/skirt-database/${selectedSkirt}`}
          skirtType={selectedSkirt}
          onImageClick={(path, breadcrumb, description) => setZoomedImage({ path, breadcrumb, description })}
        >
          <div className="popup-skirt-sections">
            <div className="popup-banner">
              <h1 className="popup-banner-title">
                {selectedSkirt === 'aboutus' ? 'ABOUT US' :
                 selectedSkirt === 'sketchbook' ? 'SKETCH BOOK' :
                 selectedSkirt.toUpperCase()}
              </h1>
              {selectedSkirt !== 'aboutus' && selectedSkirt !== 'sketchbook' && (
                <img src="/skirt_title_gif_3.gif" alt="Skirt" className="popup-banner-gif" />
              )}
            </div>

            {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}

            {/* Special case: About Us - just display the image */}
            {selectedSkirt === 'aboutus' && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                width: '100%',
                height: '100%'
              }}>
                <img
                  src="/skirt-folders/aboutus/image1.png"
                  alt="About Us"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer'
                  }}
                  onClick={() => setZoomedImage({
                    path: '/skirt-folders/aboutus/image1.png',
                    breadcrumb: '/skirt-database/aboutus/image1.png'
                  })}
                />
              </div>
            )}

            {/* Special case: Sketchbook - page flip viewer */}
            {selectedSkirt === 'sketchbook' && (
              <SketchbookViewer
                onImageClick={(path, breadcrumb) => setZoomedImage({ path, breadcrumb })}
              />
            )}

            {/* Render RTF content */}
            {selectedSkirt !== 'aboutus' && selectedSkirt !== 'sketchbook' && content && content.source === 'rtf' && (
              <>
                {content.sections.map((section, index) => (
                  <RichTextSection
                    key={index}
                    section={section}
                    skirtType={selectedSkirt}
                    onImageClick={(path, breadcrumb, description) => setZoomedImage({ path, breadcrumb, description })}
                    isNarrow={isNarrow}
                  />
                ))}
                {/* Render rest images centrally */}
                {content.restImages.length > 0 && (
                  <RestImages
                    imageNumbers={content.restImages}
                    skirtType={selectedSkirt}
                    onImageClick={(path, breadcrumb, description) => setZoomedImage({ path, breadcrumb, description })}
                  />
                )}
              </>
            )}

            {/* Fallback to legacy content */}
            {selectedSkirt !== 'aboutus' && selectedSkirt !== 'sketchbook' && content && content.source === 'legacy' && selectedSkirt && (
              <>
                {content.sections.map((section) => (
                  <SkirtSection
                    key={section.sectionNumber}
                    skirtType={selectedSkirt}
                    sectionNumber={section.sectionNumber}
                    onImageClick={(path, breadcrumb, description) => setZoomedImage({ path, breadcrumb, description })}
                  />
                ))}
              </>
            )}
          </div>
        </PopupWindow>
      )}

      {/* Image Zoom Popup */}
      {zoomedImage && (
        <ImageZoomPopup
          imagePath={zoomedImage.path}
          breadcrumb={zoomedImage.breadcrumb}
          description={zoomedImage.description}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  )
}

export default App
