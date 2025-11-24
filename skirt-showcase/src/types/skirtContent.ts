// Types for structured skirt content from RTF files

export interface SkirtContent {
  source: 'rtf' | 'legacy'
  sections: ContentSection[]
  imageMappings: ImageMapping
  restImages: number[] // Images displayed centrally, not tied to paragraphs
}

export interface ContentSection {
  level: 1 | 2 // # = level 1, ## = level 2
  title: string
  content: string
  paragraphNumber?: number // Only for level 2 (## subsections)
  imageNumber?: number // From mapping, for left overlay
  formatting?: TextFormatting[]
}

export interface ImageMapping {
  paragraphToImage: Map<number, number> // p1 -> i9, p2 -> i10, etc.
  restImages: number[] // Images for r-i23;i24;i25
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
