import { type ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (fromIndex: number, toIndex: number) => void
  renderItem: (item: T, index: number) => ReactNode
  getKey?: (item: T) => string
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  getKey = (i) => i.id,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => getKey(i) === active.id)
    const newIndex = items.findIndex((i) => getKey(i) === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(oldIndex, newIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getKey)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <SortableRow key={getKey(item)} id={getKey(item)}>
              {renderItem(item, idx)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ─────────────────────────────────────────────────────────────
// Row wrapper — provides drag handle as render-prop context
// ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  id: string
  children: ReactNode
}

function SortableRow({ id, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/row relative flex items-stretch gap-2 border border-line bg-paper-cool transition-shadow',
        isDragging && 'z-10 shadow-lg',
      )}
    >
      <button
        type="button"
        aria-label="Sürükle sıralamayı değiştir"
        className="flex w-8 shrink-0 cursor-grab items-center justify-center border-r border-line/60 text-ink/30 transition-colors hover:bg-paper-warm hover:text-ink active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
