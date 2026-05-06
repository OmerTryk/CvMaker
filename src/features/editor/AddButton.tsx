import { Plus } from 'lucide-react'

interface AddButtonProps {
  onClick: () => void
  label: string
}

/**
 * Dashed border "Add new item" button used at the bottom of sortable lists.
 */
export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-center gap-2 border border-dashed border-ink/20 bg-transparent py-4 font-mono text-[11px] uppercase tracking-widest text-ink/50 transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:text-accent"
    >
      <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
      {label}
    </button>
  )
}
