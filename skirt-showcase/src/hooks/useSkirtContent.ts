import { useState, useEffect } from 'react'
import type { SkirtContent, LegacySkirtContent } from '../types/skirtContent'
import { parseRTF, applySectionImageMappings } from '../utils/rtfParser'
import { parseImageMapping } from '../utils/imageMappingParser'

type SkirtType = 'pencil' | 'pleated' | 'trapeze' | 'wrap' | 'aboutus' | 'sketchbook'

interface UseSkirtContentResult {
  content: SkirtContent | LegacySkirtContent | null
  loading: boolean
  error: string | null
}

/**
 * Hook to load and parse skirt content from RTF files or fallback to legacy text files
 */
export function useSkirtContent(skirtType: SkirtType | null): UseSkirtContentResult {
  const [content, setContent] = useState<SkirtContent | LegacySkirtContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!skirtType) {
      setContent(null)
      return
    }

    async function loadContent() {
      setLoading(true)
      setError(null)

      try {
        // Try to load RTF file
        const rtfFileName = `${skirtType!.toUpperCase()}_SKIRT_TEXT.rtf`
        const mappingFileName = `${skirtType!.toUpperCase()}_SKIRT_TEXT_IMAGES.txt`

        const rtfPath = `/skirt-folders/sections/${skirtType!}/${rtfFileName}`
        const mappingPath = `/skirt-folders/sections/${skirtType!}/${mappingFileName}`

        try {
          // Attempt to fetch RTF and mapping files
          const [rtfResponse, mappingResponse] = await Promise.all([
            fetch(rtfPath),
            fetch(mappingPath)
          ])

          if (rtfResponse.ok && mappingResponse.ok) {
            // Parse RTF content
            const rtfContent = await rtfResponse.text()
            const sections = parseRTF(rtfContent)

            // Parse image mappings
            const mappingContent = await mappingResponse.text()
            const imageMapping = parseImageMapping(mappingContent)

            // Apply image mappings to sections
            const sectionsWithImages = applySectionImageMappings(
              sections,
              imageMapping.paragraphToImage
            )

            console.log('📚 Parsed sections:', sections.length)
            console.log('🖼️  Image mappings:', imageMapping.paragraphToImage)
            console.log('✨ Sections with images:', sectionsWithImages.filter(s => s.imageNumber).length)

            setContent({
              source: 'rtf',
              sections: sectionsWithImages,
              imageMappings: imageMapping,
              restImages: imageMapping.restImages
            })
            setLoading(false)
            return
          }
        } catch (rtfError) {
          console.log('RTF files not found, falling back to legacy text files', rtfError)
        }

        // Fallback to legacy text files
        const legacySections = await Promise.all([
          fetch(`/skirt-folders/sections/${skirtType}/text1.txt`).then(r => r.text()),
          fetch(`/skirt-folders/sections/${skirtType}/text2.txt`).then(r => r.text()),
          fetch(`/skirt-folders/sections/${skirtType}/text3.txt`).then(r => r.text())
        ])

        setContent({
          source: 'legacy',
          sections: legacySections.map((text, index) => ({
            sectionNumber: index + 1,
            text: text.trim()
          }))
        })

      } catch (err) {
        console.error('Error loading skirt content:', err)
        setError('Failed to load skirt content')
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [skirtType])

  return { content, loading, error }
}
