import type { ImageMapping } from '../types/skirtContent'

/**
 * Parses image mapping file format:
 * p1-i9       -> paragraph 1 maps to image 9.jpg
 * p2-i10      -> paragraph 2 maps to image 10.jpg
 * p10-gif1    -> paragraph 10 maps to gif1.gif
 * r-i23;i24;gif1 -> rest images (not tied to paragraphs)
 */
export function parseImageMapping(content: string): ImageMapping {
  const lines = content.trim().split('\n')
  const paragraphToImage = new Map<number, number | string>()
  const restImages: (number | string)[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Parse rest images: r-i23;i24;gif1
    if (trimmedLine.startsWith('r-')) {
      const imagesPart = trimmedLine.substring(2) // Remove 'r-'
      const items = imagesPart.split(';').map(img => {
        // Check for image number (i9)
        const imgMatch = img.match(/i(\d+)/)
        if (imgMatch) return parseInt(imgMatch[1], 10)

        // Check for gif (gif1)
        const gifMatch = img.match(/^(gif\d+)$/)
        if (gifMatch) return gifMatch[1]

        return null
      }).filter((item): item is number | string => item !== null)

      restImages.push(...items)
      continue
    }

    // Parse paragraph mappings: p1-i9 or p10-gif1
    const imgMatch = trimmedLine.match(/p(\d+)-i(\d+)/)
    if (imgMatch) {
      const paragraphNum = parseInt(imgMatch[1], 10)
      const imageNum = parseInt(imgMatch[2], 10)
      paragraphToImage.set(paragraphNum, imageNum)
      continue
    }

    const gifMatch = trimmedLine.match(/p(\d+)-(gif\d+)/)
    if (gifMatch) {
      const paragraphNum = parseInt(gifMatch[1], 10)
      const gifName = gifMatch[2]
      paragraphToImage.set(paragraphNum, gifName)
    }
  }

  return {
    paragraphToImage,
    restImages
  }
}
