import type { Activity } from '@/components/modules/activity/activityType'
import type { ActivitySignup } from '@/components/modules/signup/signupType'
import { DataTable } from '@/components/data-table/data-table'
import { useArchiveActivityModal } from '@/components/modules/activity/ActivityModals'
import { fetchActivities } from '@/components/modules/activity/ActivityService'
import { useColumns } from '@/components/modules/signup/columns'
import {
  useApproveSignupModal,
  useRejectSignupModal,
  useSignupDetailModal,
} from '@/components/modules/signup/SignupModals'
import { fetchActivitySignups } from '@/components/modules/signup/SignupService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataTable } from '@/hooks/use-data-table'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Archive, ArrowLeft, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import useSWR from 'swr'

function ActivitySignupPage() {
  const params = useParams({ from: '/dashboard/signup/$activityId' })
  const activityId = Number.parseInt(params.activityId, 10)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const goBack = useCallback(() => {
    navigate({ to: '/dashboard/signup' })
  }, [navigate])

  // 获取活动详情
  const { data: activityData } = useSWR(
    ['activity-detail', activityId],
    async () => {
      // 先获取活动列表中包含当前活动的页面
      const response = await fetchActivities(1, 50, { activityid: activityId })
      // 从结果中找到当前活动
      const activity = response.data.find((act: Activity) => act.activityid === activityId)
      if (!activity) {
        throw new Error('未找到活动信息')
      }
      return activity as Activity
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 缓存1分钟
    },
  )

  // 初始化模态框
  const showSignupDetail = useSignupDetailModal()
  const showApproveSignup = useApproveSignupModal()
  const showRejectSignup = useRejectSignupModal()
  const showArchiveActivity = useArchiveActivityModal()

  // 报名数据
  const { data: signupsData, mutate: refreshSignups } = useSWR(
    ['activity-signups', activityId, page, pageSize, searchTerm, statusFilter],
    async () => {
      // 创建筛选条件对象
      const filters: Record<string, any> = {
        page,
        PageSize: pageSize,
        activityid: activityId,
      }

      // 添加搜索条件
      if (searchTerm) {
        filters.name = searchTerm
        filters.studentid = searchTerm
        filters.email = searchTerm
        filters.telephone = searchTerm
      }

      // 添加状态筛选
      if (statusFilter !== 'all') {
        filters.ischeck = Number.parseInt(statusFilter, 10)
      }

      // 获取报名列表
      return await fetchActivitySignups(filters)
    },
    {
      revalidateOnFocus: false,
      onError: (error) => {
        console.error({ 获取报名数据失败: error })
      },
    },
  )

  // 刷新数据的回调函数
  const onDataChange = useCallback(() => {
    refreshSignups()
  }, [refreshSignups])

  // 审核通过回调
  const onApproveSignup = useCallback((signup: ActivitySignup) => {
    showApproveSignup(signup, onDataChange)
  }, [showApproveSignup, onDataChange])

  // 审核拒绝回调
  const onRejectSignup = useCallback((signup: ActivitySignup) => {
    showRejectSignup(signup, onDataChange)
  }, [showRejectSignup, onDataChange])

  // 归档活动回调
  const onArchiveActivity = useCallback(() => {
    if (activityData) {
      showArchiveActivity(activityData, () => {
        // 归档成功后重定向回报名列表页面
        navigate({ to: '/dashboard/signup' })
      })
    }
  }, [showArchiveActivity, activityData, navigate])

  // 定义表格列
  const columns = useColumns({
    showSignupDetail,
    showApproveSignup: onApproveSignup,
    showRejectSignup: onRejectSignup,
  })

  // 初始化表格
  const { table } = useDataTable({
    data: signupsData?.data || [],
    columns,
    pageCount: signupsData?.pageTotal || 1,
    getRowId: row => row.applyid.toString(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page - 1, pageSize })
        setPage(newState.pageIndex + 1)
        setPageSize(newState.pageSize)
      }
      else {
        setPage(updater.pageIndex + 1)
        setPageSize(updater.pageSize)
      }
    },
    initialState: {
      pagination: {
        pageSize,
        pageIndex: page - 1,
      },
    },
  })

  // 搜索词改变时处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1) // 重置到第一页
  }

  // 确定活动是否可归档（如果状态不是3-已归档）
  const canArchive = activityData && activityData.status !== 3

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            活动报名管理
            {activityData && ` - ${activityData.activityname}`}
          </h2>
        </div>

        {canArchive && (
          <Button
            variant="outline"
            onClick={onArchiveActivity}
            className="ml-auto"
          >
            <Archive className="mr-2 h-4 w-4" />
            归档活动
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索报名信息..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="0">未审核</SelectItem>
            <SelectItem value="1">已通过</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/signup/$activityId')({
  component: ActivitySignupPage,
})
