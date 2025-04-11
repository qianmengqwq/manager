import type { ActivitySignup } from './signupType'

import { Button } from '@/components/ui/button'
import { checkActivitySignup } from './SignupService'
import { formatDateTime } from './signupType'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

// 报名详情模态框
export function useSignupDetailModal() {
  const { present } = useModalStack()

  return useCallback((signup: ActivitySignup) => {
    present({
      title: '报名详情',
      content: () => (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">姓名</p>
              <p>{signup.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">性别</p>
              <p>{signup.sex}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">学号</p>
              <p>{signup.studentid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">邮箱</p>
              <p>{signup.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">QQ</p>
              <p>{signup.qq}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">电话</p>
              <p>{signup.telephone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">活动名称</p>
              <p>{signup.activityname}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">学院</p>
              <p>{signup.collegename}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">专业</p>
              <p>{signup.majorname}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">班级</p>
              <p>{signup.clazz}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">审核状态</p>
              <p>{signup.ischeck === 0 ? '未审核' : '已通过'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">报名时间</p>
              <p>{formatDateTime(signup.createtime)}</p>
            </div>
          </div>
        </div>
      ),
    })
  }, [present])
}

// 审核报名模态框
export function useApproveSignupModal() {
  const { present } = useModalStack()

  return useCallback((signup: ActivitySignup, onSuccess?: () => void) => {
    present({
      title: '通过报名',
      content: () => {
        const onApprove = async () => {
          try {
            await checkActivitySignup(signup.applyid, 1)
            toast.success(`已通过 ${signup.name} 的报名申请`)
            if (onSuccess)
              onSuccess()
          }
          catch (error) {
            toast.error(`审核失败: ${(error as Error).message}`)
          }
        }

        return (
          <div className="space-y-4">
            <p>确定要通过 {signup.name} 的报名申请吗？</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">
                取消
              </Button>
              <Button onClick={onApprove}>
                确认
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 拒绝报名模态框
export function useRejectSignupModal() {
  const { present } = useModalStack()

  return useCallback((signup: ActivitySignup, onSuccess?: () => void) => {
    present({
      title: '拒绝报名',
      content: () => {
        const onReject = async () => {
          try {
            await checkActivitySignup(signup.applyid, 0)
            toast.success(`已拒绝 ${signup.name} 的报名申请`)
            if (onSuccess)
              onSuccess()
          }
          catch (error) {
            toast.error(`审核失败: ${(error as Error).message}`)
          }
        }

        return (
          <div className="space-y-4">
            <p>确定要拒绝 {signup.name} 的报名申请吗？</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">
                取消
              </Button>
              <Button variant="destructive" onClick={onReject}>
                确认
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}