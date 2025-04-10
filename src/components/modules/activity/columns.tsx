import type { ColumnDef } from '@tanstack/react-table'
import type { Activity } from './activityType'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Archive, CheckCircle, Edit, Eye, ReplyAll, Trash2, XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { getStatusColor, getStatusText } from './activityType'

interface UseColumnsProps {
  showActivityDetail: (activity: Activity) => void
  showArchiveActivity: (activity: Activity) => void
  showDeleteActivity: (activity: Activity) => void
  showApproveActivity: (activity: Activity) => void
  showRejectActivity: (activity: Activity) => void
  showWithdrawActivity: (activity: Activity) => void
}

export function useColumns({
  showActivityDetail,
  showArchiveActivity,
  showDeleteActivity,
  showApproveActivity,
  showRejectActivity,
  showWithdrawActivity,
}: UseColumnsProps) {
  const navigate = useNavigate()

  return useMemo<ColumnDef<Activity>[]>(() => [
    {
      id: 'activityname',
      accessorKey: 'activityname',
      header: ({ column }) => <DataTableColumnHeader column={column} title="活动名称" />,
      cell: ({ row }) => {
        return (
          <div
            className="cursor-pointer font-medium"
            onClick={() => showActivityDetail(row.original)}
          >
            {row.getValue('activityname')}
          </div>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '活动名称',
      },
    },
    {
      id: 'speaker',
      accessorKey: 'speaker',
      header: ({ column }) => <DataTableColumnHeader column={column} title="主讲人" />,
      enableColumnFilter: true,
      meta: {
        label: '主讲人',
      },
    },
    {
      id: 'college',
      accessorKey: 'college',
      header: ({ column }) => <DataTableColumnHeader column={column} title="学院" />,
      enableColumnFilter: true,
      meta: {
        label: '学院',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
      cell: ({ row }) => {
        const status = row.original.status
        return <Badge variant={getStatusColor(status)}>{getStatusText(status)}</Badge>
      },
      enableColumnFilter: true,
      meta: {
        label: '状态',
        variant: 'select',
        options: [
          { label: '已保存', value: '0' },
          { label: '审核未通过', value: '1' },
          { label: '已发布', value: '2' },
          { label: '已归档', value: '3' },
        ],
      },
    },
    {
      id: 'signtime',
      accessorKey: 'signtime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="报名时间" />,
      cell: ({ row }) => {
        const timestamp = row.original.signtime
        if (!timestamp)
          return '-'
        try {
          return format(new Date(timestamp.replace(/-/g, '/')), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
        }
        catch {
          return timestamp
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '报名时间',
        variant: 'date',
      },
    },
    {
      id: 'holdtime',
      accessorKey: 'holdtime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="举办时间" />,
      cell: ({ row }) => {
        const timestamp = row.original.holdtime
        if (!timestamp)
          return '-'
        try {
          return format(new Date(timestamp.replace(/-/g, '/')), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
        }
        catch {
          return timestamp
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '举办时间',
        variant: 'date',
      },
    },
    {
      id: 'totalnumber',
      accessorKey: 'totalnumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title="参与人数" />,
      cell: ({ row }) => `${row.original.totalnumber} 人`,
      enableColumnFilter: true,
      meta: {
        label: '参与人数',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const activity = row.original
        const isArchived = activity.status === 3
        const needsApproval = activity.status === 0
        const isRejected = activity.status === 1
        const isPublished = activity.status === 2

        // 跳转到编辑页面
        const goToEdit = (e: React.MouseEvent) => {
          e.stopPropagation()
          // 使用TanStack Router的导航方式
          navigate({
            to: `/dashboard/activities/${activity.activityid}`,
          })
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // 阻止事件冒泡
                showActivityDetail(activity)
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              查看
            </Button>

            {!isArchived && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToEdit}
              >
                <Edit className="h-4 w-4 mr-1" />
                编辑
              </Button>
            )}

            {(needsApproval || isRejected) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-600"
                onClick={(e) => {
                  e.stopPropagation()
                  showApproveActivity(activity)
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                通过
              </Button>
            )}

            {needsApproval && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  showRejectActivity(activity)
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                拒绝
              </Button>
            )}

            {isPublished && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    showArchiveActivity(activity)
                  }}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  归档
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    showWithdrawActivity(activity)
                  }}
                >
                  <ReplyAll className="h-4 w-4 mr-1" />
                  撤回
                </Button>
              </>
            )}

            {!isArchived && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  showDeleteActivity(activity)
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            )}
          </div>
        )
      },
    },
  ], [showActivityDetail, showArchiveActivity, showDeleteActivity, showApproveActivity, showRejectActivity, showWithdrawActivity, navigate])
}
