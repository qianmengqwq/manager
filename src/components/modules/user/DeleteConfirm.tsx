import type { UserFromResponse } from '@/types/user'
import { Button } from '@/components/ui/button'

interface DeleteConfirmProps {
  username: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function DeleteConfirm({
  username,
  onConfirm,
  onCancel,
  isSubmitting,
}: DeleteConfirmProps) {
  return (
    <div className="space-y-4 py-2">
      <p>
        确定要删除用户"
        {username}
        "吗？此操作不可恢复。
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? '删除中...' : '删除'}
        </Button>
      </div>
    </div>
  )
}
