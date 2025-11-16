import { useState, useEffect } from 'react'
import './SkirtSection.css'

interface SkirtSectionProps {
  skirtType: string
  sectionNumber: number
}

export const SkirtSection = ({ skirtType, sectionNumber }: SkirtSectionProps) => {
  const [text, setText] = useState('')
  const [imageExpanded, setImageExpanded] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    // Load text content
    fetch(`/skirt-folders/sections/${skirtType}/text${sectionNumber}.txt`)
      .then(res => res.text())
      .then(content => setText(content || `Section ${sectionNumber} content for ${skirtType} skirt.`))
      .catch(() => setText(`Section ${sectionNumber} content for ${skirtType} skirt.`))

    // Check window width
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 768)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [skirtType, sectionNumber])

  const imagePath = `/skirt-folders/sections/${skirtType}/${sectionNumber}.png`

  return (
    <div className="skirt-section">
      <div className="section-content">
        <div className="text-column">
          <p>{text}</p>
        </div>

        {!isNarrow ? (
          <div className="image-column">
            <div className="sticky-image-container">
              <img src={imagePath} alt={`${skirtType} section ${sectionNumber}`} />
            </div>
          </div>
        ) : (
          <>
            <button
              className="image-toggle-arrow"
              onClick={() => setImageExpanded(!imageExpanded)}
              aria-label="Toggle image"
            >
              {imageExpanded ? '←' : '→'}
            </button>
            {imageExpanded && (
              <div className="image-drawer">
                <img src={imagePath} alt={`${skirtType} section ${sectionNumber}`} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
