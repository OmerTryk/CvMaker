/**
 * PrintableCV — full A4 render of the active template, sized in mm units
 * for pixel-perfect PDF output.
 *
 * Why mm and not px? Browser print engines compute page size in physical
 * units. When the printable element matches the @page size *exactly* in
 * the same unit (mm), no scaling/margin auto-fitting is applied.
 *
 * This element lives off-screen during normal browsing (.print-source)
 * and is the source react-to-print copies into the print iframe.
 */

import { forwardRef } from 'react'
import type { CVDocument } from '@/types/cv'
import { TemplateRenderer } from '@/templates'
import { A4 } from '@/templates/shared/tokens'

interface PrintableCVProps {
  cv: CVDocument
}

export const PrintableCV = forwardRef<HTMLDivElement, PrintableCVProps>(
  ({ cv }, ref) => {
    return (
      <div
        ref={ref}
        className="printable-cv-page"
        style={{
          width: `${A4.widthMM}mm`,
          height: `${A4.heightMM}mm`,
          background: '#ffffff',
          overflow: 'hidden',
          // Reset any inherited box-sizing/margin from app context
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <TemplateRenderer cv={cv} />
      </div>
    )
  },
)

PrintableCV.displayName = 'PrintableCV'
