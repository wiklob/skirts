import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './App.css'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Transform scroll progress to animation states
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.3, 1.2])
  const splitAmount = useTransform(scrollYProgress, [0.3, 0.7], [0, 150])
  const opacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0])
  const contentOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1])

  return (
    <div className="app">
      {/* Opening Animation Section */}
      <div ref={containerRef} className="opening-section">
        <motion.div
          className="skirt-animation-container"
          style={{ opacity }}
        >
          {/* Left half of skirt */}
          <motion.div
            className="skirt-half skirt-left"
            style={{
              scale,
              x: useTransform(splitAmount, (v) => -v),
            }}
          >
            <svg viewBox="0 0 100 200" className="skirt-svg">
              <path
                d="M 50 20 L 30 40 L 10 180 L 50 180 L 50 20 Z"
                fill="#2c3e50"
                className="pleated-skirt"
              />
              {/* Pleats */}
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1={50 - (i * 5)}
                  y1={40 + (i * 3)}
                  x2={50 - (i * 5.7)}
                  y2={180}
                  stroke="#1a252f"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}
            </svg>
          </motion.div>

          {/* Right half of skirt */}
          <motion.div
            className="skirt-half skirt-right"
            style={{
              scale,
              x: useTransform(splitAmount, (v) => v),
            }}
          >
            <svg viewBox="0 0 100 200" className="skirt-svg">
              <path
                d="M 50 20 L 70 40 L 90 180 L 50 180 L 50 20 Z"
                fill="#2c3e50"
                className="pleated-skirt"
              />
              {/* Pleats */}
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1={50 + (i * 5)}
                  y1={40 + (i * 3)}
                  x2={50 + (i * 5.7)}
                  y2={180}
                  stroke="#1a252f"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}
            </svg>
          </motion.div>
        </motion.div>

        {/* Content revealed behind */}
        <motion.div
          className="revealed-content"
          style={{ opacity: contentOpacity }}
        >
          <h1>SKIRT DATABASE</h1>
        </motion.div>
      </div>

      {/* Main Content Section */}
      <section className="content-section">
        <div className="skirt-categories">
          <div className="category-grid">
            <div className="category-item">
              <div className="folder-icon">
                <div className="folder-tab"></div>
                <div className="folder-body"></div>
              </div>
              <span>crayon skirt</span>
            </div>

            <div className="category-item">
              <div className="folder-icon">
                <div className="folder-tab"></div>
                <div className="folder-body"></div>
              </div>
              <span>pleated skirt</span>
            </div>

            <div className="category-item">
              <div className="folder-icon">
                <div className="folder-tab"></div>
                <div className="folder-body"></div>
              </div>
              <span>trapeze skirt</span>
            </div>

            <div className="category-item">
              <div className="folder-icon">
                <div className="folder-tab"></div>
                <div className="folder-body"></div>
              </div>
              <span>wrap skirt</span>
            </div>
          </div>
        </div>

        {/* Pleated Skirt Detail Section */}
        <div className="skirt-detail">
          <h2>pleated skirt</h2>
          <div className="detail-content">
            <div className="detail-text">
              <p className="label">kręcący się napis wokół osi pionowej</p>
              <div className="text-lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
              <p className="label">tekst</p>
              <div className="image-placeholder"></div>
              <p className="label">zdjęcia</p>
              <p className="small-text">jak klikniesz to wyświetla się opis</p>
            </div>
            <div className="timeline">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot"></div>
                  {i === 5 && <div className="timeline-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
