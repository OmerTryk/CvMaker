/**
 * Live preview pane — used in split-view editor.
 * Includes the template/theme picker above the A4 canvas.
 */

import { useCVStore } from '@/store'
import { TemplateRenderer } from '@/templates'
import { PreviewCanvas } from './PreviewCanvas'
import { TemplatePicker } from './TemplatePicker'

interface PreviewPaneProps {
  /** Show the picker controls above the canvas. Default true. */
  showPicker?: boolean
}

export function PreviewPane({ showPicker = true }: PreviewPaneProps) {
  const cv = useCVStore((s) => s.cv)

  return (
    <div className="flex flex-col gap-4">
      {showPicker && <TemplatePicker />}
      <PreviewCanvas>
        <TemplateRenderer cv={cv} />
      </PreviewCanvas>
    </div>
  )
}
