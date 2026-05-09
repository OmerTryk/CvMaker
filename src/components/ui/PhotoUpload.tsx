/**
 * PhotoUpload — click or drag-and-drop to upload a profile photo.
 * Converts the image to a base64 data URL stored in personal.photoUrl.
 */

import { useRef, useState } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  value: string
  onChange: (base64: string) => void
  onRemove: () => void
}

export function PhotoUpload({ value, onChange, onRemove }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (file: File) => {
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyası yüklenebilir.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya 5 MB’dan küçük olmalı.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex items-start gap-5">
      {/* Preview / upload area */}
      {value ? (
        <div className="relative shrink-0">
          <img
            src={value}
            alt="Profil fotoğrafı"
            className="h-24 w-24 rounded-full border-2 border-line object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            title="Fotoğrafı kaldır"
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper text-ink/50 shadow-sm transition-colors hover:bg-accent hover:text-paper"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-dashed transition-all duration-200',
            dragging
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-line text-ink/30 hover:border-ink/40 hover:text-ink/50',
          )}
        >
          <Camera size={20} strokeWidth={1.5} />
          <span className="font-mono text-[8px] uppercase tracking-wider">Foto</span>
        </button>
      )}

      {/* Info + actions */}
      <div className="flex flex-col gap-2 pt-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Profil Fotoğrafı
        </p>
        <p className="text-xs leading-relaxed text-ink/40">
          JPG, PNG veya WEBP · Maks 5 MB
        </p>
        {!value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-fit items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            <Upload size={11} />
            Yükle
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-fit items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            <Upload size={11} />
            Değiştir
          </button>
        )}
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-wide text-accent">
            {error}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
