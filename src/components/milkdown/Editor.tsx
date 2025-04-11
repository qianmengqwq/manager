import { useMilkdownStore } from '@/store/milkdownStore'
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core'
import { automd } from '@milkdown/plugin-automd'
import { clipboard } from '@milkdown/plugin-clipboard'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { trailing } from '@milkdown/plugin-trailing'
import { upload, uploadConfig } from '@milkdown/plugin-upload'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { Milkdown, useEditor } from '@milkdown/react'
import { replaceAll } from '@milkdown/utils'
import { useEffect, useRef } from 'react'

import { MilkdownPluginsMenu } from './plugins/Menu'
import { customUploader, uploadWidgetFactory } from './plugins/uploader'

interface Props {
  valueMarkdown: string
  saveMarkdown: (markdown: string) => void
  placeholder?: string
}

export function MilkdownEditor({ valueMarkdown, saveMarkdown, placeholder }: Props) {
  const refreshContentStatus = useMilkdownStore(
    state => state.data.refreshContentStatus,
  )

  // 使用ref来跟踪编辑器内容是否被初始化
  const isInitializedRef = useRef(false)

  const editor = useEditor(root =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, valueMarkdown)

        const listener = ctx.get(listenerCtx)
        listener.markdownUpdated((_, markdown) => {
          // 只有在编辑器已经初始化后才调用saveMarkdown
          if (isInitializedRef.current) {
            saveMarkdown(markdown)
          }
        })

        ctx.update(uploadConfig.key, prev => ({
          ...prev,
          uploader: customUploader,
          uploadWidgetFactory,
        }))
      })
      .use(history)
      .use(commonmark)
      .use(gfm)
      .use(prism)
      .use(listener)
      .use(clipboard)
      .use(indent)
      .use(trailing)
      .use(upload)
      .use(automd),
  )

  // 只在编辑器首次加载或刷新内容状态变化时重置内容
  useEffect(() => {
    const editorInstance = editor.get()

    // 编辑器加载完成后标记为已初始化
    if (editorInstance && !isInitializedRef.current) {
      isInitializedRef.current = true
    }

    // 只在刷新内容状态变化时替换内容
    if (refreshContentStatus && editorInstance) {
      editorInstance.action(replaceAll(valueMarkdown, true))
    }
  }, [refreshContentStatus, editor, valueMarkdown])

  return (
    <div className="min-h-64 relative border rounded-md overflow-hidden">
      <MilkdownPluginsMenu editorInfo={editor} />
      <Milkdown />
      {editor.loading && (
        <div className="min-h-48 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">正在加载编辑器</span>
        </div>
      )}
      {!editor.loading && !valueMarkdown && placeholder && (
        <div
          className="absolute top-16 left-4 text-muted-foreground pointer-events-none"
          style={{ zIndex: -1 }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}
