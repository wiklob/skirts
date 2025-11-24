import './RestImages.css'

interface RestImagesProps {
  imageNumbers: number[]
  skirtType: string
  onImageClick: (imagePath: string, breadcrumb: string) => void
}

/**
 * Displays "rest" images centrally in the content area
 * These are images marked with "r-" in the mapping file
 */
export const RestImages = ({ imageNumbers, skirtType, onImageClick }: RestImagesProps) => {
  if (imageNumbers.length === 0) return null

  return (
    <div className="rest-images-container">
      <div className="rest-images-grid">
        {imageNumbers.map(imageNum => {
          const imagePath = `/skirt-folders/sections/${skirtType}/imagerow/${imageNum}.jpg`
          const breadcrumb = `/skirt-database/${skirtType}/imagerow/${imageNum}.jpg`

          return (
            <img
              key={imageNum}
              src={imagePath}
              alt={`Rest image ${imageNum}`}
              className="rest-image"
              onClick={() => onImageClick(imagePath, breadcrumb)}
            />
          )
        })}
      </div>
    </div>
  )
}
