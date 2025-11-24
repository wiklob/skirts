import { useState } from 'react'
import type { ContentSection } from '../types/skirtContent'
import './SkirtSection.css'

interface RichTextSectionProps {
  section: ContentSection
  skirtType: string
  onImageClick: (imagePath: string, breadcrumb: string) => void
  isNarrow: boolean
}

/**
 * Renders a single ## subsection with its mapped image
 */
export const RichTextSection = ({ section, skirtType, onImageClick, isNarrow }: RichTextSectionProps) => {
  const [imageExpanded, setImageExpanded] = useState(false)

  // Debug logging
  if (section.level === 2) {
    console.log(`📄 Section "${section.title}": paragraph=${section.paragraphNumber}, image=${section.imageNumber}`)
  }

  // Level 1 sections are just headers - render them separately
  if (section.level === 1) {
    return (
      <div style={{
        width: '100%',
        padding: '2rem 2rem 1rem 2rem'
      }}>
        <h1 style={{
          fontSize: '2em',
          fontWeight: 'bold',
          margin: 0
        }}>
          {section.title}
        </h1>
      </div>
    )
  }

  // Only level 2 sections (## subsections) have images
  const hasImage = section.level === 2 && (section.imageNumber || section.imageFile)

  // Construct image path from imagerow
  let imagePath: string | null = null
  let breadcrumb = ''

  if (hasImage) {
    if (section.imageNumber) {
      // JPG image
      imagePath = `/skirt-folders/sections/${skirtType}/imagerow/${section.imageNumber}.jpg`
      breadcrumb = `/skirt-database/${skirtType}/imagerow/${section.imageNumber}.jpg`
    } else if (section.imageFile) {
      // GIF or other format
      imagePath = `/skirt-folders/sections/${skirtType}/imagerow/${section.imageFile}.gif`
      breadcrumb = `/skirt-database/${skirtType}/imagerow/${section.imageFile}.gif`
    }
  }

  return (
    <div className="skirt-section">
      {!isNarrow && imagePath && (
        <div className="image-overlay">
          <div className="sticky-image-container">
            <img
              src={imagePath}
              alt={`${section.title}`}
              onClick={() => onImageClick(imagePath, breadcrumb)}
            />
          </div>
        </div>
      )}

      <div className="section-content">
        <div className="text-container">
          {section.level === 2 && (
            <h2 style={{
              fontSize: '1.5em',
              fontWeight: 'bold',
              marginTop: '1.5em',
              marginBottom: '0.5em'
            }}>
              {section.title}
            </h2>
          )}

          {section.content && (
            <div>
              {section.content.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => {
                const trimmed = paragraph.trim()
                const isExample = trimmed.startsWith('**Example with description**') || trimmed.toLowerCase().startsWith('example with description')

                if (isExample) {
                  // Remove the "Example with description" header from the text
                  const contentWithoutHeader = trimmed.replace(/^\*\*Example with description\*\*\s*/i, '').replace(/^Example with description\s*/i, '')

                  return (
                    <p key={idx} style={{
                      marginBottom: '0.8em',
                      lineHeight: '1.6',
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    }}>
                      {contentWithoutHeader}
                    </p>
                  )
                }

                return (
                  <p key={idx} style={{ marginBottom: '0.8em', lineHeight: '1.6' }}>
                    {trimmed}
                  </p>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isNarrow && imagePath && (
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
                alt={`${section.title}`}
                onClick={() => onImageClick(imagePath, breadcrumb)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
