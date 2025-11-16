import { useState, useEffect } from 'react'
import './SkirtSection.css'

interface SkirtSectionProps {
  skirtType: string
  sectionNumber: number
  onImageClick: (imagePath: string) => void
}

export const SkirtSection = ({ skirtType, sectionNumber, onImageClick }: SkirtSectionProps) => {
  const [text, setText] = useState('Loading...')
  const [imageExpanded, setImageExpanded] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    // Load text content
    fetch(`/skirt-folders/sections/${skirtType}/text${sectionNumber}.txt`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.text()
      })
      .then(content => {
        const trimmedContent = content.trim()
        setText(trimmedContent || `Section ${sectionNumber} content for ${skirtType} skirt.`)
      })
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
      {!isNarrow && (
        <div className="image-overlay">
          <div className="sticky-image-container">
            <img
              src={imagePath}
              alt={`${skirtType} section ${sectionNumber}`}
              onClick={() => onImageClick(imagePath)}
            />
          </div>
        </div>
      )}

      <div className="section-content">
        <div className="text-container">
          <p>{text}</p>
        </div>
      </div>

      {isNarrow && (
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
              <img
                src={imagePath}
                alt={`${skirtType} section ${sectionNumber}`}
                onClick={() => onImageClick(imagePath)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
