import ReactMarkdown from 'react-markdown'

interface MilkdownPreviewProps {
  content: string
  className?: string
}

/**
 * Markdown预览组件
 * 使用react-markdown直接渲染Markdown内容
 */
export function MilkdownPreview({ content, className = '' }: MilkdownPreviewProps) {
  return (
    <div className={`markdown-preview border rounded-md bg-card ${className}`}>
      {content ? (
        <div className="prose prose-sm max-w-none dark:prose-invert p-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-muted-foreground p-4">无内容</div>
      )}
    </div>
  )
} 