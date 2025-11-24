import './RestImages.css'

interface RestImagesProps {
  imageNumbers: (number | string)[]
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
        {imageNumbers.map((imageRef, idx) => {
          let imagePath: string
          let breadcrumb: string
          let key: string

          if (typeof imageRef === 'number') {
            // JPG image
            imagePath = `/skirt-folders/sections/${skirtType}/imagerow/${imageRef}.jpg`
            breadcrumb = `/skirt-database/${skirtType}/imagerow/${imageRef}.jpg`
            key = `img-${imageRef}`
          } else {
            // GIF or other format
            imagePath = `/skirt-folders/sections/${skirtType}/imagerow/${imageRef}.gif`
            breadcrumb = `/skirt-database/${skirtType}/imagerow/${imageRef}.gif`
            key = `gif-${imageRef}`
          }

          return (
            <img
              key={key}
              src={imagePath}
              alt={`Rest image ${imageRef}`}
              className="rest-image"
              onClick={() => onImageClick(imagePath, breadcrumb)}
            />
          )
        })}
      </div>
    </div>
  )
}
