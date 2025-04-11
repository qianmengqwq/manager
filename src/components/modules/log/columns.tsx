import type { ColumnDef } from '@tanstack/react-table'
import type { EventLog } from './logType'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import { useMemo } from 'react'
import { getOperationType } from './logType'

interface UseColumnsProps {
  showLogDetail: (log: EventLog) => void
}

export function useColumns({ showLogDetail }: UseColumnsProps) {
  return useMemo<ColumnDef<EventLog>[]>(() => [
    {
      id: 'eventtime',
      accessorKey: 'eventtime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="时间" />,
      cell: ({ row }) => {
        const timestamp = row.original.eventtime
        return format(new Date(timestamp.replace(/-/g, '/')), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
      },
      enableColumnFilter: true,
      meta: {
        label: '时间',
        variant: 'date',
      },
    },
    {
      id: 'level',
      accessorKey: 'level',
      header: ({ column }) => <DataTableColumnHeader column={column} title="级别" />,
      cell: ({ row }) => {
        const level = row.original.level
        switch (level) {
          case 1:
            return <Badge className="bg-blue-500">管理员</Badge>
          case 2:
            return <Badge className="bg-purple-500">普通用户</Badge>
          default:
            return (
              <Badge>
                未知(
                {level}
                )
              </Badge>
            )
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '级别',
      },
    },
    {
      id: 'operation',
      header: ({ column }) => <DataTableColumnHeader column={column} title="操作类型" />,
      cell: ({ row }) => {
        const event = row.original.event
        const operation = getOperationType(event)

        const colorMap: Record<string, string> = {
          查询: 'bg-gray-100 text-gray-800',
          创建: 'bg-blue-100 text-blue-800',
          更新: 'bg-amber-100 text-amber-800',
          删除: 'bg-red-100 text-red-800',
          登录: 'bg-green-100 text-green-800',
          登出: 'bg-green-100 text-green-800',
          发送: 'bg-indigo-100 text-indigo-800',
          导入: 'bg-purple-100 text-purple-800',
          导出: 'bg-purple-100 text-purple-800',
        }

        const color = colorMap[operation] || 'bg-gray-100 text-gray-800'
        return <Badge variant="outline" className={color}>{operation}</Badge>
      },
      enableColumnFilter: true,
      meta: {
        label: '操作类型',
      },
    },
    {
      id: 'module',
      accessorKey: 'module',
      header: ({ column }) => <DataTableColumnHeader column={column} title="模块" />,
      enableColumnFilter: true,
      meta: {
        label: '模块',
      },
    },
    {
      id: 'event',
      accessorKey: 'event',
      header: ({ column }) => <DataTableColumnHeader column={column} title="事件内容" />,
      cell: ({ row }) => {
        const event = row.original.event
        return (
          <span className="truncate max-w-[200px] block" title={event}>
            {event.length > 50 ? `${event.substring(0, 50)}...` : event}
          </span>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '事件内容',
      },
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title="操作人" />,
      enableColumnFilter: true,
      meta: {
        label: '操作人',
      },
    },
    {
      id: 'ip',
      accessorKey: 'ip',
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP地址" />,
      enableColumnFilter: true,
      meta: {
        label: 'IP地址',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const log = row.original
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showLogDetail(log)}
          >
            <Eye className="h-4 w-4 mr-1" />
            详情
          </Button>
        )
      },
    },
  ], [showLogDetail])
}
