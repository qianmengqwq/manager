import { MilkdownProvider } from '@milkdown/react'
import { useCallback, useRef, useState } from 'react'
import { MilkdownEditor } from './Editor'

interface Props {
  initialValue?: string
  onChange: (markdown: string) => void
  label?: string
  description?: string
  placeholder?: string
  className?: string
}

export function MilkdownWrapper({
  initialValue = '',
  onChange,
  label,
  description,
  placeholder,
  className,
}: Props) {
  const markdownRef = useRef(initialValue)
  const [initialMarkdown] = useState(initialValue)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const saveMarkdown = useCallback((value: string) => {
    markdownRef.current = value

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(value)
    }, 500)
  }, [onChange])

  return (
    <div className={className}>
      {(label || description) && (
        <div className="mb-2">
          {label && <div className="text-lg font-medium">{label}</div>}
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      )}
      <MilkdownProvider>
        <MilkdownEditor
          valueMarkdown={initialMarkdown}
          saveMarkdown={saveMarkdown}
          placeholder={placeholder}
        />
      </MilkdownProvider>
    </div>
  )
}
