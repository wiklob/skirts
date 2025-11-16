import { motion } from 'framer-motion'
import './ImageZoomPopup.css'

interface ImageZoomPopupProps {
  imagePath: string
  onClose: () => void
}

export const ImageZoomPopup = ({ imagePath, onClose }: ImageZoomPopupProps) => {
  return (
    <motion.div
      className="image-zoom-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="image-zoom-container"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button className="image-zoom-close" onClick={onClose}>
          ×
        </button>
        <img src={imagePath} alt="Zoomed view" />
      </motion.div>
    </motion.div>
  )
}
