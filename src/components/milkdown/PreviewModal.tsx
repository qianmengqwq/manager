import { Button } from '@/components/ui/button'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback } from 'react'
import { MilkdownPreview } from './MilkdownPreview'

/**
 * Markdown预览弹窗Hook
 * 用于在命令式弹窗中显示Markdown内容预览
 */
export function useMarkdownPreviewModal() {
  const { present } = useModalStack()

  return useCallback((content: string, title: string = '预览') => {
    present({
      title,
      content: (props) => {
        return (
          <div className="p-2">
            <MilkdownPreview
              content={content}
              className="max-h-[70vh] overflow-y-auto"
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={props.dismiss}
              >
                关闭
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}
