// Types for structured skirt content from RTF files

export interface RTFSkirtContent {
  source: 'rtf'
  sections: ContentSection[]
  imageMappings: ImageMapping
  restImages: RestImageMapping[] // Images displayed centrally, not tied to paragraphs
  archiveSections: ArchiveSection[] // Archive sections with title + images, displayed after rest images
}

export interface ContentSection {
  level: 1 | 2 // # = level 1, ## = level 2
  title: string
  content: string
  paragraphNumber?: number // Only for level 2 (## subsections)
  imageNumber?: number // From mapping, for left overlay (JPG)
  imageFile?: string // From mapping, for GIF or other formats (e.g., "gif1" -> gif1.gif)
  imageDescription?: string // Description for the image
  formatting?: TextFormatting[]
}

export interface RestImageMapping {
  displayImage: number | string // What to display (i23 or gif1)
  clickTarget?: string // What to open when clicked (gif2)
  description?: string // Description for the image
}

export interface ArchiveSection {
  title: string // The title from first [] (e.g., "SS26")
  images: RestImageMapping[] // Images in the archive section
}

export interface ParagraphImageMapping {
  image: number | string // Image reference (number for JPG, string for GIF)
  description?: string // Optional description
}

export interface ImageMapping {
  paragraphToImage: Map<number, ParagraphImageMapping> // p1 -> {image: 9, description: "..."}
  restImages: RestImageMapping[] // Images for r-i23-gif2;i24-gif3
  unusedImageDescriptions: Map<number | string, string> // u-i8-[desc] -> descriptions for imagerow
  archiveSections: ArchiveSection[] // a-[title]-images... -> archive sections after rest images
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
