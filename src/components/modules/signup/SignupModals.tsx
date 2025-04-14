import type { ActivitySignup } from './signupType'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { autoFilterSignups, checkActivitySignup } from './SignupService'
import { formatDateTime } from './signupType'

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

// 审核通过模态框
export function useApproveSignupModal() {
  const { present } = useModalStack()

  return useCallback((signup: ActivitySignup, onSuccess?: () => void) => {
    const close = present({
      title: '通过报名',
      content: () => (
        <div className="space-y-4">
          <p>确定要通过该报名申请吗？</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => close()}
            >
              取消
            </Button>
            <Button
              onClick={async () => {
                try {
                  await checkActivitySignup(signup.applyid, 1)
                  toast.success('审核通过成功')
                  onSuccess?.()
                  close()
                }
                catch (error) {
                  toast.error('审核通过失败')
                  console.error({ 审核通过错误: error })
                }
              }}
            >
              确定
            </Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

// 审核拒绝模态框
export function useRejectSignupModal() {
  const { present } = useModalStack()

  return useCallback((signup: ActivitySignup, onSuccess?: () => void) => {
    const close = present({
      title: '拒绝报名',
      content: () => (
        <div className="space-y-4">
          <p>确定要拒绝该报名申请吗？</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => close()}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await checkActivitySignup(signup.applyid, 0)
                  toast.success('审核拒绝成功')
                  onSuccess?.()
                  close()
                }
                catch (error) {
                  toast.error('审核拒绝失败')
                  console.error({ 审核拒绝错误: error })
                }
              }}
            >
              确定
            </Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

// 自动筛选模态框内容组件
function AutoFilterModalContent({
  activityId,
  onSuccess,
  onClose,
}: {
  activityId: number
  onSuccess?: () => void
  onClose: () => void
}) {
  // 定义筛选条件类型
  interface FilterCondition {
    key: 'grade' | 'college' | 'major'
    value: string | null
  }

  const [conditions, setConditions] = useState<FilterCondition[]>([
    { key: 'grade', value: null },
    { key: 'college', value: null },
    { key: 'major', value: null },
  ])

  // 移动筛选条件优先级
  const moveCondition = (index: number, direction: 'up' | 'down') => {
    setConditions((prev) => {
      const newConditions = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1

      // 确保索引在合法范围内
      if (targetIndex < 0 || targetIndex >= newConditions.length)
        return prev

      // 交换位置
      const temp = newConditions[index]
      newConditions[index] = newConditions[targetIndex]
      newConditions[targetIndex] = temp

      return newConditions
    })
  }

  // 更新条件值
  const updateConditionValue = (index: number, value: string) => {
    setConditions((prev) => {
      const newConditions = [...prev]
      newConditions[index] = {
        ...newConditions[index],
        value: value.trim() === '' ? null : value,
      }
      return newConditions
    })
  }

  // 提交筛选
  const handleSubmit = async () => {
    try {
      // 过滤掉没有值的条件并创建符合autoFilterSignups要求的对象
      const validConditions = conditions
        .filter(c => c.value !== null)
        .reduce((acc, curr, index) => {
          // 添加优先级
          acc[curr.key] = {
            value: curr.value,
            priority: index,
          }
          return acc
        }, {} as Record<string, { value: string | null, priority: number }>)

      // 调用服务函数
      await autoFilterSignups(activityId, validConditions)
      toast.success('自动筛选成功')
      onSuccess?.()
      onClose()
    }
    catch (error) {
      toast.error('自动筛选失败')
      console.error({ 自动筛选错误: error })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        设置筛选条件，按照优先级从高到低排序。可以通过上下按钮调整优先级顺序。
      </p>

      {conditions.map((condition, index) => (
        <div key={condition.key} className="flex items-center gap-2 py-2 border-b">
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => moveCondition(index, 'up')}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={index === conditions.length - 1}
              onClick={() => moveCondition(index, 'down')}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="min-w-20 text-sm font-medium">
                {condition.key === 'grade' && '年级'}
                {condition.key === 'college' && '学院'}
                {condition.key === 'major' && '专业'}
              </span>
              <Input
                value={condition.value || ''}
                onChange={e => updateConditionValue(index, e.target.value)}
                placeholder={`输入${condition.key === 'grade' ? '年级' : condition.key === 'college' ? '学院' : '专业'}筛选条件`}
              />
              <Badge className="ml-2">{`优先级 ${index + 1}`}</Badge>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
        >
          确定
        </Button>
      </div>
    </div>
  )
}

// 自动筛选模态框钩子
export function useAutoFilterModal() {
  const { present } = useModalStack()

  return useCallback((activityId: number, onSuccess?: () => void) => {
    const close = present({
      title: '自动筛选设置',
      content: () => (
        <AutoFilterModalContent
          activityId={activityId}
          onSuccess={onSuccess}
          onClose={close}
        />
      ),
    })
  }, [present])
}
