/**
 * Template + theme + font picker.
 * Lives above the preview canvas in split-view editor.
 */

import { useCVStore } from '@/store'
import {
  TEMPLATE_LIST,
  COLOR_THEMES,
  COLOR_THEME_LABELS,
  FONT_FAMILIES,
  FONT_FAMILY_LABELS,
} from '@/templates/shared/tokens'
import type { Template, ColorTheme, FontFamily } from '@/types/cv'
import { cn } from '@/lib/utils'

export function TemplatePicker() {
  const settings = useCVStore((s) => s.cv.settings)
  const update = useCVStore((s) => s.updateSettings)

  return (
    <div className="flex flex-col gap-5 border border-line bg-paper-cool/60 p-5">
      {/* TEMPLATES */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
          Şablon
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATE_LIST.map((tpl) => {
            const active = settings.template === tpl.key
            return (
              <button
                key={tpl.key}
                type="button"
                onClick={() => update({ template: tpl.key as Template })}
                className={cn(
                  'flex flex-col items-start gap-1 border px-3 py-2.5 text-left transition-all duration-200',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line bg-paper hover:border-ink/40',
                )}
              >
                <span className="font-display text-sm font-medium">
                  {tpl.name}
                </span>
                <span
                  className={cn(
                    'font-mono text-[9px] uppercase leading-tight tracking-wider',
                    active ? 'text-paper/70' : 'text-ink/40',
                  )}
                >
                  {tpl.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* COLORS */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
          Renk
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((key) => {
            const active = settings.colorTheme === key
            const colors = COLOR_THEMES[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ colorTheme: key })}
                title={COLOR_THEME_LABELS[key]}
                className={cn(
                  'group flex items-center gap-2 border px-2.5 py-1.5 transition-all duration-200',
                  active
                    ? 'border-ink'
                    : 'border-line hover:border-ink/40',
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: colors.primary }}
                />
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-wider',
                    active ? 'text-ink' : 'text-ink/60',
                  )}
                >
                  {COLOR_THEME_LABELS[key]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FONTS */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
          Tipografi
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FONT_FAMILIES) as FontFamily[]).map((key) => {
            const active = settings.fontFamily === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ fontFamily: key })}
                className={cn(
                  'border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink/60 hover:border-ink/40 hover:text-ink',
                )}
              >
                {FONT_FAMILY_LABELS[key]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
