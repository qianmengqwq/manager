import type { EventLog } from '@/components/modules/logs/logType'
import type { ColumnDef } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { useLogDetailModal } from '@/components/modules/logs/LogModals'
import { exportEventLogs, fetchEventLogs } from '@/components/modules/logs/LogService'
import { getLevelText, getOperationType } from '@/components/modules/logs/logType'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataTable } from '@/hooks/use-data-table'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Download, Eye, Filter, Search, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const showLogDetail = useLogDetailModal()

  // 分页设置
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // 计算当前页码和页大小
  const page = pagination.pageIndex + 1 // 转为1-based索引
  const pageSize = pagination.pageSize

  // 获取日志列表数据
  const { data, error, isLoading } = useSWR(
    ['/api/eventlog/selectall', pagination.pageIndex, pagination.pageSize],
    ([_url, page, size]) => fetchEventLogs(page, size),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
    },
  )

  const logs = data?.data || []
  const totalLogs = data?.total || 0
  const pageCount = Math.ceil(totalLogs / pageSize)

  // 处理加载错误
  if (error) {
    toast.error('获取日志列表失败')
    console.error('获取日志列表错误:', error)
  }

  // 过滤日志数据 - 仅针对当前页的数据进行筛选
  const filteredLogs = useMemo(() => {
    let filtered = logs || []

    // 按模块筛选
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter)
    }

    // 按日期范围筛选
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(log => new Date(log.eventtime.replace(/-/g, '/')) >= fromDate)
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(log => new Date(log.eventtime.replace(/-/g, '/')) <= toDate)
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log =>
        log.event.toLowerCase().includes(term)
        || log.username.toLowerCase().includes(term)
        || log.module.toLowerCase().includes(term)
        || log.ip.includes(term),
      )
    }

    return filtered
  }, [logs, searchTerm, moduleFilter, dateRange])

  // 获取可用的模块列表
  const moduleOptions = useMemo(() => {
    if (!logs.length)
      return []

    const modules = [...new Set(logs.map(log => log.module))]
    return modules.sort()
  }, [logs])

  // 重置所有筛选器
  const resetFilters = () => {
    setSearchTerm('')
    setModuleFilter('all')
    setDateRange(undefined)
  }

  // 导出日志数据
  const handleExportLogs = async () => {
    try {
      await exportEventLogs()
      toast.success('日志导出成功')
    }
    catch (error) {
      console.error('导出日志失败:', error)
      toast.error('导出日志失败')
    }
  }

  // 定义表格列
  const columns = useMemo<ColumnDef<EventLog>[]>(() => [
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
        // 截取一部分显示
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

  // 格式化日期显示
  const formatDateRange = () => {
    if (!dateRange?.from && !dateRange?.to)
      return '选择日期'

    let displayText = ''
    if (dateRange?.from) {
      displayText += format(dateRange.from, 'yyyy-MM-dd', { locale: zhCN })
    }

    if (dateRange?.to) {
      displayText += ` 至 ${format(dateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
    }
    else if (dateRange?.from) {
      displayText += ' 起'
    }

    return displayText
  }

  // 初始化表格
  const { table } = useDataTable({
    data: filteredLogs,
    columns,
    pageCount,
    getRowId: row => row.eventid.toString(),
    initialState: {
      pagination,
    },
    onPaginationChange: setPagination,
  })

  // 双击行打开详情
  const handleRowDoubleClick = useCallback((row: EventLog) => {
    showLogDetail(row)
  }, [showLogDetail])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统日志</h2>
        <Button variant="outline" onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          导出日志
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="py-8 text-center">加载中...</div>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center py-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索日志..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              <Select
                value={moduleFilter}
                onValueChange={setModuleFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="所有模块" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有模块</SelectItem>
                  {moduleOptions.map(module => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <Filter className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={zhCN}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

              {(searchTerm || moduleFilter !== 'all' || dateRange?.from || dateRange?.to) && (
                <Button variant="ghost" size="icon" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              共
              {' '}
              {totalLogs}
              {' '}
              条日志，当前显示
              {' '}
              {filteredLogs.length}
              {' '}
              条
            </div>
          </div>

          <DataTable
            table={table}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/logs')({
  component: LogsPage,
})
