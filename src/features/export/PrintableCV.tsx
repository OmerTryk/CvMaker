/**
 * PrintableCV — full-resolution render of the active template for PDF export.
 *
 * Uses mm units for width (browser print engine maps 210mm → A4 width exactly).
 * Height is UNCONSTRAINED (min-height only) so content flows naturally
 * to page 2, 3, 4... — browser handles page breaks automatically.
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
          minHeight: `${A4.heightMM}mm`, // min only — allows page 2, 3, 4...
          background: '#ffffff',
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
