import { ActivityEdit } from '@/components/modules/activity/ActivityEdit'
import { fetchActivities } from '@/components/modules/activity/ActivityService'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useCallback } from 'react'
import useSWR from 'swr'

function ActivityDetailPage() {
  const navigate = useNavigate()
  const { activityId } = useParams({ from: '/dashboard/activities/$activityId' })

  // 加载活动数据
  const { data, mutate } = useSWR(
    ['activity', activityId],
    async () => {
      // 这里我们用fetchActivities并加上activityid筛选来获取单个活动
      const result = await fetchActivities(1, 1, { activityid: Number(activityId) })
      return result?.data?.[0] || null
    },
  )

  // 更新成功回调
  const onSuccess = useCallback(() => {
    mutate() // 刷新数据
    navigate({ to: '/dashboard/activities' })
  }, [mutate, navigate])

  // 加载中或未找到活动
  if (!data) {
    return <div className="py-10 text-center">加载中...</div>
  }

  return (
    <ActivityEdit activity={data} onSuccess={onSuccess} />
  )
}

export const Route = createFileRoute('/dashboard/activities/$activityId')({
  component: ActivityDetailPage,
})
