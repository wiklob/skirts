import type { ContentSection, ParagraphImageMapping } from '../types/skirtContent'

/**
 * Windows-1252 to Unicode character mapping for RTF special characters
 * Handles the problematic 0x80-0x9F range
 */
const WIN1252_TO_UNICODE: Record<number, string> = {
  0x80: "\u20AC", // Euro sign
  0x82: "\u201A", // Single low-9 quotation mark
  0x83: "\u0192", // Latin small letter f with hook
  0x84: "\u201E", // Double low-9 quotation mark
  0x85: "\u2026", // Horizontal ellipsis
  0x86: "\u2020", // Dagger
  0x87: "\u2021", // Double dagger
  0x88: "\u02C6", // Modifier letter circumflex accent
  0x89: "\u2030", // Per mille sign
  0x8A: "\u0160", // Latin capital letter S with caron
  0x8B: "\u2039", // Single left-pointing angle quotation mark
  0x8C: "\u0152", // Latin capital ligature OE
  0x8E: "\u017D", // Latin capital letter Z with caron
  0x91: "\u2018", // Left single quotation mark
  0x92: "\u2019", // Right single quotation mark (apostrophe)
  0x93: "\u201C", // Left double quotation mark
  0x94: "\u201D", // Right double quotation mark
  0x95: "\u2022", // Bullet
  0x96: "\u2013", // En dash
  0x97: "\u2014", // Em dash
  0x98: "\u02DC", // Small tilde
  0x99: "\u2122", // Trade mark sign
  0x9A: "\u0161", // Latin small letter s with caron
  0x9B: "\u203A", // Single right-pointing angle quotation mark
  0x9C: "\u0153", // Latin small ligature oe
  0x9E: "\u017E", // Latin small letter z with caron
  0x9F: "\u0178", // Latin capital letter Y with diaeresis
}

/**
 * Better RTF to plain text converter
 * Preserves line breaks and structure
 */
function rtfToPlainText(rtfContent: string): string {
  let text = rtfContent

  // First, handle line breaks - RTF uses \\ for line breaks
  text = text.replace(/\\\\/g, '\n')

  // Remove RTF header blocks (but keep content inside them)
  text = text.replace(/\{\\rtf1.*?(?=\{|[^\\]#)/s, '')
  text = text.replace(/\{\\fonttbl[^}]*\}/g, '')
  text = text.replace(/\{\\colortbl[^}]*\}/g, '')
  text = text.replace(/\{\\stylesheet[^}]*\}/g, '')
  text = text.replace(/\{\\info[^}]*\}/g, '')
  text = text.replace(/\{\\listtable.*?\}\}/gs, '')
  text = text.replace(/\{\\listoverridetable.*?\}\}/gs, '')

  // Handle special characters BEFORE removing control words
  // Use Windows-1252 mapping for codes in the 0x80-0x9F range
  text = text.replace(/\\'([0-9a-f]{2})/gi, (_match, hex) => {
    const code = parseInt(hex, 16)
    // Use Windows-1252 mapping if in problematic range
    if (code >= 0x80 && code <= 0x9F && WIN1252_TO_UNICODE[code]) {
      return WIN1252_TO_UNICODE[code]
    }
    // Otherwise use direct Unicode conversion
    return String.fromCharCode(code)
  })

  // Handle Unicode characters
  text = text.replace(/\\u(\d+)\?/g, (_match, code) => {
    return String.fromCharCode(parseInt(code, 10))
  })

  // Remove paragraph formatting but keep line breaks
  text = text.replace(/\\par\b/g, '\n')
  text = text.replace(/\\pard[^\\]*/g, '')

  // Remove other common control words (but preserve structure)
  text = text.replace(/\\[a-z]+(-?\d+)?\b[ ]?/gi, ' ')

  // Remove remaining braces
  text = text.replace(/[{}]/g, '')

  // Remove stray backslashes (but not those in intentional text)
  text = text.replace(/\\(?![a-zA-Z0-9])/g, '')
  text = text.replace(/\\/g, '')

  // Clean up excessive whitespace but preserve intentional line breaks
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s+/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.replace(/^\s+/gm, '') // Remove leading whitespace from each line

  return text.trim()
}

/**
 * Parses RTF content into structured sections
 * Handles # (main sections) and ## (subsections/paragraphs)
 */
export function parseRTF(rtfContent: string): ContentSection[] {
  const plainText = rtfToPlainText(rtfContent)
  const sections: ContentSection[] = []

  // Split by lines but keep empty lines for now
  const lines = plainText.split('\n')

  let currentLevel1Section: ContentSection | null = null
  let paragraphCounter = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Check for main section (# header) - single # not followed by another #
    if (line.match(/^#[^#]/)) {
      let title = line.replace(/^#+\s*/, '').trim()

      // If title is empty (# on its own line), look at the next non-empty line
      if (!title) {
        let j = i + 1
        while (j < lines.length) {
          const nextLine = lines[j].trim()
          if (nextLine && !nextLine.startsWith('#')) {
            title = nextLine
            i = j // Skip the line we just used as title
            break
          }
          j++
        }
      }

      currentLevel1Section = {
        level: 1,
        title,
        content: ''
      }
      sections.push(currentLevel1Section)
      continue
    }

    // Check for subsection (## header)
    if (line.startsWith('##')) {
      paragraphCounter++
      const title = line.replace(/^##\s*/, '').trim()

      // Collect content lines until next header
      const contentLines: string[] = []
      let j = i + 1

      while (j < lines.length) {
        const nextLine = lines[j].trim()
        // Stop if we hit another header
        if (nextLine.startsWith('#')) break
        // Add non-empty lines to content
        if (nextLine) {
          contentLines.push(nextLine)
        }
        j++
      }

      const subsection: ContentSection = {
        level: 2,
        title,
        content: contentLines.join('\n\n'), // Use double newline for paragraph separation
        paragraphNumber: paragraphCounter
      }

      sections.push(subsection)

      // Skip the lines we've already processed
      i = j - 1
      continue
    }

    // Regular content (not a header)
    // Add to current level 1 section if exists
    if (currentLevel1Section && !line.startsWith('#')) {
      if (currentLevel1Section.content) {
        currentLevel1Section.content += '\n\n' + line
      } else {
        currentLevel1Section.content = line
      }
    }
  }

  return sections
}

/**
 * Applies image mappings to sections
 */
export function applySectionImageMappings(
  sections: ContentSection[],
  paragraphToImage: Map<number, ParagraphImageMapping>
): ContentSection[] {
  return sections.map(section => {
    if (section.level === 2 && section.paragraphNumber) {
      const mapping = paragraphToImage.get(section.paragraphNumber)
      if (mapping) {
        // If it's a number, it's a JPG image (imageNumber)
        if (typeof mapping.image === 'number') {
          return {
            ...section,
            imageNumber: mapping.image,
            imageDescription: mapping.description
          }
        }
        // If it's a string, it's a GIF or other format (imageFile)
        if (typeof mapping.image === 'string') {
          return {
            ...section,
            imageFile: mapping.image,
            imageDescription: mapping.description
          }
        }
      }
    }
    return section
  })
}
