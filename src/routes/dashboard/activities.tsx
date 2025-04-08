import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDataTable } from '@/hooks/use-data-table'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, FileDown, PlusCircle, Search } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState } from 'react'

// 活动数据类型
interface Activity {
  id: string
  title: string
  status: 'draft' | 'published' | 'ended' | 'archived'
  startTime: string
  endTime: string
  createdBy: string
  createdAt: string
}

// 活动状态映射
const activityStatusMap = {
  draft: { label: '草稿', color: 'secondary' },
  published: { label: '已发布', color: 'success' },
  ended: { label: '已结束', color: 'warning' },
  archived: { label: '已归档', color: 'destructive' },
} as const

// 模拟活动数据
const mockActivities: Activity[] = [
  {
    id: '1',
    title: '迎新晚会',
    status: 'published',
    startTime: '2023-09-01 19:00',
    endTime: '2023-09-01 22:00',
    createdBy: '管理员',
    createdAt: '2023-08-15',
  },
  {
    id: '2',
    title: '校园歌手大赛',
    status: 'draft',
    startTime: '2023-10-15 14:00',
    endTime: '2023-10-15 17:00',
    createdBy: '教师用户',
    createdAt: '2023-09-20',
  },
  {
    id: '3',
    title: '职业生涯规划讲座',
    status: 'ended',
    startTime: '2023-05-20 10:00',
    endTime: '2023-05-20 12:00',
    createdBy: '管理员',
    createdAt: '2023-05-01',
  },
  {
    id: '4',
    title: '毕业典礼',
    status: 'archived',
    startTime: '2023-06-30 09:00',
    endTime: '2023-06-30 11:30',
    createdBy: '管理员',
    createdAt: '2023-06-01',
  },
]

// 活动表单模态框组件
function useActivityFormModal() {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '添加活动',
      content: () => (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">活动名称</label>
            <Input placeholder="请输入活动名称" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">开始时间</label>
            <Input type="datetime-local" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">结束时间</label>
            <Input type="datetime-local" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">活动描述</label>
            <div className="border rounded-md p-2 h-40 bg-muted/30">
              <p className="text-muted-foreground text-center mt-10">富文本编辑器将在这里集成</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button variant="outline">保存为草稿</Button>
            <Button>发布活动</Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const showActivityForm = useActivityFormModal()

  // 定义表格列
  const columns = useMemo<ColumnDef<Activity>[]>(() => [
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="活动名称" />,
      enableColumnFilter: true,
      meta: {
        label: '活动名称',
        placeholder: '搜索活动名称...',
      },
      cell: ({ row }) => {
        return (
          <div
            className="cursor-pointer"
            onClick={() => navigate({ to: '/dashboard/activities/$activityId', params: { activityId: row.original.id } })}
          >
            {row.getValue('title')}
          </div>
        )
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as Activity['status']
        const { label, color } = activityStatusMap[status]
        return <Badge variant={color as any}>{label}</Badge>
      },
      enableColumnFilter: true,
      meta: {
        label: '状态',
        variant: 'select',
        options: [
          { label: '草稿', value: 'draft' },
          { label: '已发布', value: 'published' },
          { label: '已结束', value: 'ended' },
          { label: '已归档', value: 'archived' },
        ],
      },
    },
    {
      id: 'startTime',
      accessorKey: 'startTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="开始时间" />,
      enableColumnFilter: true,
      meta: {
        label: '开始时间',
        variant: 'date',
      },
    },
    {
      id: 'endTime',
      accessorKey: 'endTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="结束时间" />,
      enableColumnFilter: true,
      meta: {
        label: '结束时间',
        variant: 'date',
      },
    },
    {
      id: 'createdBy',
      accessorKey: 'createdBy',
      header: ({ column }) => <DataTableColumnHeader column={column} title="创建人" />,
      enableColumnFilter: true,
      meta: {
        label: '创建人',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const activity = row.original
        const isArchived = activity.status === 'archived'

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // 阻止事件冒泡
                navigate({ to: '/dashboard/activities/$activityId', params: { activityId: activity.id } })
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              查看
            </Button>
            {!isArchived && (
              <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                编辑
              </Button>
            )}
            {activity.status === 'ended' && (
              <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                <FileDown className="h-4 w-4 mr-1" />
                归档
              </Button>
            )}
            {!isArchived && (
              <Button variant="destructive" size="sm" onClick={e => e.stopPropagation()}>
                删除
              </Button>
            )}
          </div>
        )
      },
    },
  ], [navigate])

  // 过滤后的数据
  const filteredData = useMemo(() => {
    return mockActivities.filter(activity =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase())
      || activityStatusMap[activity.status].label.includes(searchTerm),
    )
  }, [searchTerm])

  // 初始化表格
  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1, // 由于是假数据，所以页数为1
    getRowId: row => row.id,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">活动管理</h2>
        <Button onClick={showActivityForm}>
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
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/activities')({
  component: ActivitiesPage,
})
