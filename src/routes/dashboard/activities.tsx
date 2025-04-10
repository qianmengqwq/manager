import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDataTable } from '@/hooks/use-data-table'
import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import { PlusCircle, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useColumns } from '@/components/modules/activity/columns'
import { 
  useActivityDetailModal, 
  useCreateActivityModal, 
  useArchiveActivityModal,
  useDeleteActivityModal,
  useApproveActivityModal,
  useRejectActivityModal,
  useWithdrawActivityModal
} from '@/components/modules/activity/ActivityModals'
import { fetchActivities } from '@/components/modules/activity/ActivityService'
import useSWR from 'swr'
import type { Activity } from '@/components/modules/activity/activityType'

function ActivitiesPage() {
  // 检查是否有子路由激活
  const matches = useMatches()
  const isDetailRouteActive = matches.some(
    match => match.routeId.includes('$activityId')
  )

  // 如果子路由激活，则渲染子路由内容
  if (isDetailRouteActive) {
    return <Outlet />
  }

  // 否则渲染活动列表
  return <ActivitiesList />
}

// 原本的活动列表组件
function ActivitiesList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1) 
  const [pageSize, setPageSize] = useState(10)

  // 使用SWR获取活动数据
  const { data: activitiesData, mutate: refreshActivities } = useSWR(
    ['activities', page, pageSize, searchTerm],
    async () => {
      // 创建筛选条件对象，根据搜索词选择性添加字段
      const filters: Record<string, any> = {}
      if (searchTerm) {
        // 假设搜索词可以应用到多个字段
        filters.activityname = searchTerm
        // 其他字段也可以添加到搜索中
      }

      // 获取活动列表
      return await fetchActivities(page, pageSize, filters)
    },
    {
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('获取活动数据失败:', error)
      }
    }
  )

  // 初始化各种模态框
  const showActivityDetail = useActivityDetailModal()
  const showCreateActivity = useCreateActivityModal()
  const showArchiveActivity = useArchiveActivityModal()
  const showDeleteActivity = useDeleteActivityModal()
  const showApproveActivity = useApproveActivityModal()
  const showRejectActivity = useRejectActivityModal()
  const showWithdrawActivity = useWithdrawActivityModal()

  // 刷新数据的回调函数
  const onDataChange = useCallback(() => {
    refreshActivities()
  }, [refreshActivities])

  // 创建活动按钮回调
  const onCreateActivity = useCallback(() => {
    showCreateActivity(onDataChange)
  }, [showCreateActivity, onDataChange])

  // 归档活动按钮回调
  const onArchiveActivity = useCallback((activity: Activity) => {
    showArchiveActivity(activity, onDataChange)
  }, [showArchiveActivity, onDataChange])

  // 删除活动按钮回调
  const onDeleteActivity = useCallback((activity: Activity) => {
    showDeleteActivity(activity, onDataChange)
  }, [showDeleteActivity, onDataChange])

  // 审核通过活动按钮回调
  const onApproveActivity = useCallback((activity: Activity) => {
    showApproveActivity(activity, onDataChange)
  }, [showApproveActivity, onDataChange])

  // 审核拒绝活动按钮回调
  const onRejectActivity = useCallback((activity: Activity) => {
    showRejectActivity(activity, onDataChange)
  }, [showRejectActivity, onDataChange])

  // 撤回活动按钮回调
  const onWithdrawActivity = useCallback((activity: Activity) => {
    showWithdrawActivity(activity, onDataChange)
  }, [showWithdrawActivity, onDataChange])

  // 定义表格列
  const columns = useColumns({
    showActivityDetail,
    showArchiveActivity: onArchiveActivity,
    showDeleteActivity: onDeleteActivity,
    showApproveActivity: onApproveActivity,
    showRejectActivity: onRejectActivity,
    showWithdrawActivity: onWithdrawActivity
  })

  // 初始化表格
  const { table } = useDataTable({
    data: activitiesData?.data || [],
    columns,
    pageCount: activitiesData?.pageTotal || 1,
    manualPagination: true,
    getRowId: row => row.activityid.toString(),
    onPaginationChange: ({ pageIndex, pageSize: newPageSize }) => {
      setPage(pageIndex + 1)
      setPageSize(newPageSize)
    },
    initialState: {
      pagination: { 
        pageSize: pageSize, 
        pageIndex: page - 1 
      },
    },
  })

  // 搜索词改变时处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1) // 重置到第一页
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">活动管理</h2>
        <Button onClick={onCreateActivity}>
          <PlusCircle className="mr-2 h-4 w-4" />
          添加活动
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={!activitiesData}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/activities')({
  component: ActivitiesPage,
}) 