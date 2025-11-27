import type { ImageMapping, RestImageMapping, ParagraphImageMapping, ArchiveSection } from '../types/skirtContent'

/**
 * Parses image mapping file format:
 * p1-i9       -> paragraph 1 maps to image 9.jpg
 * p2-i10-[description]      -> paragraph 2 maps to image 10.jpg with description
 * p10-gif1-[description]    -> paragraph 10 maps to gif1.gif with description
 * r-i23-gif2-[description];i24-gif3-[description] -> rest images with descriptions
 * u-i8-[description];i11-[description] -> unused images descriptions (for imagerow carousel)
 * a-[title]-i18-[description];i19-[description] -> archive section with title and images
 */
export function parseImageMapping(content: string): ImageMapping {
  const lines = content.trim().split('\n')
  const paragraphToImage = new Map<number, ParagraphImageMapping>()
  const restImages: RestImageMapping[] = []
  const unusedImageDescriptions = new Map<number | string, string>()
  const archiveSections: ArchiveSection[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Parse rest images: r-i23-gif2-[description];i24-gif3-[description]
    if (trimmedLine.startsWith('r-')) {
      const imagesPart = trimmedLine.substring(2) // Remove 'r-'
      const items = imagesPart.split(';').map(img => {
        // Check for image with click target and description: i23-gif2-[description]
        const withTargetAndDescMatch = img.match(/i(\d+)-(gif\d+)-\[([^\]]+)\]/)
        if (withTargetAndDescMatch) {
          return {
            displayImage: parseInt(withTargetAndDescMatch[1], 10),
            clickTarget: withTargetAndDescMatch[2],
            description: withTargetAndDescMatch[3]
          } as RestImageMapping
        }

        // Check for image with click target (no description): i23-gif2
        const withTargetMatch = img.match(/i(\d+)-(gif\d+)/)
        if (withTargetMatch) {
          return {
            displayImage: parseInt(withTargetMatch[1], 10),
            clickTarget: withTargetMatch[2]
          } as RestImageMapping
        }

        // Check for simple image number with description: i9-[description]
        const imgWithDescMatch = img.match(/^i(\d+)-\[([^\]]+)\]$/)
        if (imgWithDescMatch) {
          return {
            displayImage: parseInt(imgWithDescMatch[1], 10),
            description: imgWithDescMatch[2]
          } as RestImageMapping
        }

        // Check for simple image number (no description): i9
        const imgMatch = img.match(/^i(\d+)$/)
        if (imgMatch) {
          return { displayImage: parseInt(imgMatch[1], 10) } as RestImageMapping
        }

        // Check for gif with description: gif1-[description]
        const gifWithDescMatch = img.match(/^(gif\d+)-\[([^\]]+)\]$/)
        if (gifWithDescMatch) {
          return {
            displayImage: gifWithDescMatch[1],
            description: gifWithDescMatch[2]
          } as RestImageMapping
        }

        // Check for gif (no description): gif1
        const gifMatch = img.match(/^(gif\d+)$/)
        if (gifMatch) {
          return { displayImage: gifMatch[1] } as RestImageMapping
        }

        return null
      }).filter((item): item is RestImageMapping => item !== null)

      restImages.push(...items)
      continue
    }

    // Parse unused image descriptions: u-i8-[description];i11-[description]
    if (trimmedLine.startsWith('u-')) {
      const imagesPart = trimmedLine.substring(2) // Remove 'u-'
      const items = imagesPart.split(';')

      for (const item of items) {
        // Match i{number}-[description] or gif{number}-[description]
        const imgWithDescMatch = item.match(/^i(\d+)-\[([^\]]+)\]$/)
        if (imgWithDescMatch) {
          const imageNum = parseInt(imgWithDescMatch[1], 10)
          unusedImageDescriptions.set(imageNum, imgWithDescMatch[2])
          continue
        }

        const gifWithDescMatch = item.match(/^(gif\d+)-\[([^\]]+)\]$/)
        if (gifWithDescMatch) {
          unusedImageDescriptions.set(gifWithDescMatch[1], gifWithDescMatch[2])
        }
      }
      continue
    }

    // Parse archive sections: a-[title]-i18-[description];i19-[description]
    if (trimmedLine.startsWith('a-')) {
      const afterPrefix = trimmedLine.substring(2) // Remove 'a-'

      // Extract the title from first [...]
      const titleMatch = afterPrefix.match(/^\[([^\]]+)\]-?/)
      if (titleMatch) {
        const title = titleMatch[1]
        const imagesPart = afterPrefix.substring(titleMatch[0].length)

        // Parse images using same logic as rest images
        const images: RestImageMapping[] = []
        const imageItems = imagesPart.split(';').filter(s => s.trim())

        for (const img of imageItems) {
          // Check for image with click target and description: i23-gif2-[description]
          const withTargetAndDescMatch = img.match(/i(\d+)-(gif\d+)-\[([^\]]+)\]/)
          if (withTargetAndDescMatch) {
            images.push({
              displayImage: parseInt(withTargetAndDescMatch[1], 10),
              clickTarget: withTargetAndDescMatch[2],
              description: withTargetAndDescMatch[3]
            })
            continue
          }

          // Check for image with click target (no description): i23-gif2
          const withTargetMatch = img.match(/i(\d+)-(gif\d+)/)
          if (withTargetMatch) {
            images.push({
              displayImage: parseInt(withTargetMatch[1], 10),
              clickTarget: withTargetMatch[2]
            })
            continue
          }

          // Check for simple image number with description: i9-[description]
          const imgWithDescMatch = img.match(/^i(\d+)-\[([^\]]+)\]$/)
          if (imgWithDescMatch) {
            images.push({
              displayImage: parseInt(imgWithDescMatch[1], 10),
              description: imgWithDescMatch[2]
            })
            continue
          }

          // Check for simple image number (no description): i9
          const imgMatch = img.match(/^i(\d+)$/)
          if (imgMatch) {
            images.push({ displayImage: parseInt(imgMatch[1], 10) })
            continue
          }

          // Check for gif with description: gif1-[description]
          const gifWithDescMatch = img.match(/^(gif\d+)-\[([^\]]+)\]$/)
          if (gifWithDescMatch) {
            images.push({
              displayImage: gifWithDescMatch[1],
              description: gifWithDescMatch[2]
            })
            continue
          }

          // Check for gif (no description): gif1
          const gifMatch = img.match(/^(gif\d+)$/)
          if (gifMatch) {
            images.push({ displayImage: gifMatch[1] })
          }
        }

        if (images.length > 0) {
          archiveSections.push({ title, images })
        }
      }
      continue
    }

    // Parse paragraph mappings: p1-i9-[description] or p10-gif1-[description]
    // With description: p1-i9-[description]
    const imgWithDescMatch = trimmedLine.match(/p(\d+)-i(\d+)-\[([^\]]+)\]/)
    if (imgWithDescMatch) {
      const paragraphNum = parseInt(imgWithDescMatch[1], 10)
      const imageNum = parseInt(imgWithDescMatch[2], 10)
      paragraphToImage.set(paragraphNum, {
        image: imageNum,
        description: imgWithDescMatch[3]
      })
      continue
    }

    // Without description: p1-i9
    const imgMatch = trimmedLine.match(/p(\d+)-i(\d+)/)
    if (imgMatch) {
      const paragraphNum = parseInt(imgMatch[1], 10)
      const imageNum = parseInt(imgMatch[2], 10)
      paragraphToImage.set(paragraphNum, { image: imageNum })
      continue
    }

    // GIF with description: p10-gif1-[description]
    const gifWithDescMatch = trimmedLine.match(/p(\d+)-(gif\d+)-\[([^\]]+)\]/)
    if (gifWithDescMatch) {
      const paragraphNum = parseInt(gifWithDescMatch[1], 10)
      const gifName = gifWithDescMatch[2]
      paragraphToImage.set(paragraphNum, {
        image: gifName,
        description: gifWithDescMatch[3]
      })
      continue
    }

    // GIF without description: p10-gif1
    const gifMatch = trimmedLine.match(/p(\d+)-(gif\d+)/)
    if (gifMatch) {
      const paragraphNum = parseInt(gifMatch[1], 10)
      const gifName = gifMatch[2]
      paragraphToImage.set(paragraphNum, { image: gifName })
    }
  }

  return {
    paragraphToImage,
    restImages,
    unusedImageDescriptions,
    archiveSections
  }
}
