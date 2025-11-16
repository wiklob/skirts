import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PopupWindow } from './components/PopupWindow'
import { SkirtSection } from './components/SkirtSection'
import { ImageZoomPopup } from './components/ImageZoomPopup'
import './App.css'

type SkirtType = 'crayon' | 'pleated' | 'trapeze' | 'wrap' | null

const skirtDescriptions = {
  crayon: {
    title: 'Crayon Skirt'
  },
  pleated: {
    title: 'Pleated Skirt'
  },
  trapeze: {
    title: 'Trapeze Skirt'
  },
  wrap: {
    title: 'Wrap Skirt'
  }
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedSkirt, setSelectedSkirt] = useState<SkirtType>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

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
  const contentOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1])

  // State to hold current frame number
  const [currentFrame, setCurrentFrame] = useState(0)

  // Update frame based on scroll
  useEffect(() => {
    return frameIndex.on('change', (latest) => {
      setCurrentFrame(Math.round(latest))
    })
  }, [frameIndex])

  return (
    <div className="app">
      {/* Opening Animation Section */}
      <div ref={containerRef} className="opening-section">
        <motion.div
          className="skirt-animation-container"
          style={{
            opacity,
            filter: useTransform(blur, (b) => `blur(${b}px)`)
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
          <h1 className="banner-title">SKIRTS DATABASE</h1>
        </div>

        <section className="content-section">
          <div className="skirt-categories">
            <div className="category-grid">
              <div className="category-item" onClick={() => setSelectedSkirt('crayon')}>
                <img src="/folder.png" alt="Folder" className="folder-icon" />
                <span>crayon skirt</span>
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('pleated')}>
                <img src="/folder.png" alt="Folder" className="folder-icon" />
                <span>pleated skirt</span>
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('trapeze')}>
                <img src="/folder.png" alt="Folder" className="folder-icon" />
                <span>trapeze skirt</span>
              </div>

              <div className="category-item" onClick={() => setSelectedSkirt('wrap')}>
                <img src="/folder.png" alt="Folder" className="folder-icon" />
                <span>wrap skirt</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Popup Window */}
      {selectedSkirt && (
        <PopupWindow
          isOpen={!!selectedSkirt}
          onClose={() => setSelectedSkirt(null)}
          title={skirtDescriptions[selectedSkirt].title}
        >
          <div className="popup-skirt-sections">
            <SkirtSection
              skirtType={selectedSkirt}
              sectionNumber={1}
              onImageClick={setZoomedImage}
            />
            <SkirtSection
              skirtType={selectedSkirt}
              sectionNumber={2}
              onImageClick={setZoomedImage}
            />
            <SkirtSection
              skirtType={selectedSkirt}
              sectionNumber={3}
              onImageClick={setZoomedImage}
            />
          </div>
        </PopupWindow>
      )}

      {/* Image Zoom Popup */}
      {zoomedImage && (
        <ImageZoomPopup
          imagePath={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  )
}

export default App
