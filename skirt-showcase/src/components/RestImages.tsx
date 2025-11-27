import type { RestImageMapping } from '../types/skirtContent'
import './RestImages.css'

interface RestImagesProps {
  imageNumbers: RestImageMapping[]
  skirtType: string
  onImageClick: (imagePath: string, breadcrumb: string, description?: string) => void
  title?: string // Optional title displayed as large header (for archive sections)
}

/**
 * Displays "rest" images centrally in the content area
 * These are images marked with "r-" in the mapping file
 * Supports click targets: display one image but open a different one on click
 * Also used for archive sections with an optional title
 */
export const RestImages = ({ imageNumbers, skirtType, onImageClick, title }: RestImagesProps) => {
  if (imageNumbers.length === 0) return null

  return (
    <div className="rest-images-container">
      {title && (
        <h1 className="rest-images-title">{title}</h1>
      )}
      <div className="rest-images-grid">
        {imageNumbers.map((mapping) => {
          // Path to display
          let displayPath: string
          let key: string

          if (typeof mapping.displayImage === 'number') {
            // JPG image
            displayPath = `/skirt-folders/sections/${skirtType}/imagerow/${mapping.displayImage}.jpg`
            key = `img-${mapping.displayImage}`
          } else {
            // GIF or other format
            displayPath = `/skirt-folders/sections/${skirtType}/imagerow/${mapping.displayImage}.gif`
            key = `gif-${mapping.displayImage}`
          }

          // Path to open when clicked
          let clickPath: string
          let clickBreadcrumb: string

          if (mapping.clickTarget) {
            // Open the click target GIF
            clickPath = `/skirt-folders/sections/${skirtType}/imagerow/${mapping.clickTarget}.gif`
            clickBreadcrumb = `/skirt-database/${skirtType}/imagerow/${mapping.clickTarget}.gif`
          } else {
            // Open the display image itself
            if (typeof mapping.displayImage === 'number') {
              clickPath = `/skirt-folders/sections/${skirtType}/imagerow/${mapping.displayImage}.jpg`
              clickBreadcrumb = `/skirt-database/${skirtType}/imagerow/${mapping.displayImage}.jpg`
            } else {
              clickPath = `/skirt-folders/sections/${skirtType}/imagerow/${mapping.displayImage}.gif`
              clickBreadcrumb = `/skirt-database/${skirtType}/imagerow/${mapping.displayImage}.gif`
            }
          }

          return (
            <div key={key} className="rest-image-item">
              <img
                src={displayPath}
                alt={`Rest image ${mapping.displayImage}`}
                className="rest-image"
                onClick={() => onImageClick(clickPath, clickBreadcrumb, mapping.description)}
              />
              {mapping.description && (
                <div className="rest-image-caption">
                  {mapping.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
