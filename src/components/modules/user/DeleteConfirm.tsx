import { Button } from '@/components/ui/button'
import { UserFromResponse } from '@/types/user'

interface DeleteConfirmProps {
  user: UserFromResponse
  onDelete: () => Promise<void>
  onCancel: () => void
  isDeleting?: boolean
}

export function DeleteConfirm({ 
  user, 
  onDelete, 
  onCancel,
  isDeleting = false 
}: DeleteConfirmProps) {
  return (
    <div className="space-y-4 py-2">
      <p>
        确定要删除用户
        {' '}
        <strong>{user.username}</strong>
        {' '}
        吗？此操作不可撤销。
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          取消
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '删除中...' : '删除'}
        </Button>
      </div>
    </div>
  )
} 