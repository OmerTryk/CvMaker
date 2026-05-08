/**
 * usePDFExport — wraps react-to-print to give us a clean
 * { ref, print, isPrinting } API used by ExportButton.
 *
 * The pageStyle below is critical for fitting content to A4 without
 * browser-side scaling. It explicitly sets the page size in mm and
 * forces the print iframe's body to match, so our 210×297mm content
 * lands 1:1 on the page with no auto-fit margins.
 */

import { useRef, useState, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useCVStore } from '@/store'

export function usePDFExport() {
  const ref = useRef<HTMLDivElement>(null)
  const title = useCVStore((s) => s.cv.title)
  const fullName = useCVStore((s) => s.cv.personal.fullName)
  const [isPrinting, setIsPrinting] = useState(false)

  // Build a friendly filename: "ada-yildiz-cv" or fallback
  const documentTitle = (() => {
    const slug = (fullName || title || 'cv')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9çğıöşü]+/gi, '-')
      .replace(/^-+|-+$/g, '')
    return slug ? `${slug}-cv` : 'cv'
  })()

  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle,
    onBeforePrint: async () => {
      setIsPrinting(true)
      // Wait for fonts to be ready so the print window has them
      if ('fonts' in document) {
        try {
          await document.fonts.ready
        } catch {
          // ignore — proceed anyway
        }
      }
    },
    onAfterPrint: () => setIsPrinting(false),
    pageStyle: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }

      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* The printable element must fill the page exactly */
        .printable-cv-page {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }

        /* Preserve all colors (sidebars, accents, dividers) */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  const print = useCallback(() => {
    handlePrint()
  }, [handlePrint])

  return { ref, print, isPrinting }
}
