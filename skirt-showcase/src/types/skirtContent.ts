// Types for structured skirt content from RTF files

export interface RTFSkirtContent {
  source: 'rtf'
  sections: ContentSection[]
  imageMappings: ImageMapping
  restImages: (number | string)[] // Images displayed centrally, not tied to paragraphs (can be numbers or gif names)
}

export interface ContentSection {
  level: 1 | 2 // # = level 1, ## = level 2
  title: string
  content: string
  paragraphNumber?: number // Only for level 2 (## subsections)
  imageNumber?: number // From mapping, for left overlay (JPG)
  imageFile?: string // From mapping, for GIF or other formats (e.g., "gif1" -> gif1.gif)
  formatting?: TextFormatting[]
}

export interface ImageMapping {
  paragraphToImage: Map<number, number | string> // p1 -> 9 or "gif1"
  restImages: (number | string)[] // Images for r-i23;i24;gif1
}

export interface TextFormatting {
  type: 'bold' | 'italic' | 'list'
  start: number
  end: number
}

// Legacy format for backward compatibility
export interface LegacySkirtContent {
  source: 'legacy'
  sections: {
    sectionNumber: number
    text: string
  }[]
}

// Union type for all content types
export type SkirtContent = RTFSkirtContent | LegacySkirtContent
