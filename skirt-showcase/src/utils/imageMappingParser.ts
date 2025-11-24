import type { ImageMapping } from '../types/skirtContent'

/**
 * Parses image mapping file format:
 * p1-i9       -> paragraph 1 maps to image 9
 * p2-i10      -> paragraph 2 maps to image 10
 * r-i23;i24;i25 -> rest images (not tied to paragraphs)
 */
export function parseImageMapping(content: string): ImageMapping {
  const lines = content.trim().split('\n')
  const paragraphToImage = new Map<number, number>()
  const restImages: number[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Parse rest images: r-i23;i24;i25
    if (trimmedLine.startsWith('r-')) {
      const imagesPart = trimmedLine.substring(2) // Remove 'r-'
      const imageNumbers = imagesPart.split(';').map(img => {
        const match = img.match(/i(\d+)/)
        return match ? parseInt(match[1], 10) : null
      }).filter((num): num is number => num !== null)

      restImages.push(...imageNumbers)
      continue
    }

    // Parse paragraph mappings: p1-i9
    const match = trimmedLine.match(/p(\d+)-i(\d+)/)
    if (match) {
      const paragraphNum = parseInt(match[1], 10)
      const imageNum = parseInt(match[2], 10)
      paragraphToImage.set(paragraphNum, imageNum)
    }
  }

  return {
    paragraphToImage,
    restImages
  }
}
