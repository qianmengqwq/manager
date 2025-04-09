import type { EventLog } from '@/components/modules/logs/logType'
import type { DateRange } from 'react-day-picker'
import { DataTable } from '@/components/data-table/data-table'
import { useColumns } from '@/components/modules/logs/columns'
import { useLogDetailModal } from '@/components/modules/logs/LogModals'
import { exportEventLogs, fetchEventLogs } from '@/components/modules/logs/LogService'
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
import { Download, Filter, Search, X } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

function LogsPage() {
  const [_isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const showLogDetail = useLogDetailModal()

  // 使用 nuqs 管理分页状态
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10))

  // 分页设置
  const pagination = useMemo(() => ({
    pageIndex: page - 1, // 转换为 0-based 索引
    pageSize,
  }), [page, pageSize])

  // 获取日志列表数据
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/eventlog/selectall', page, pageSize],
    ([_url, page, pageSize]) => fetchEventLogs(page, pageSize),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      keepPreviousData: true, // 保持之前的数据，避免闪烁
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
  const columns = useColumns({ showLogDetail })

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
    onPaginationChange: (updater) => {
      startTransition(() => {
        if (typeof updater === 'function') {
          const newPagination = updater(pagination)
          setPage(newPagination.pageIndex + 1)
          setPageSize(newPagination.pageSize)
        }
        else {
          setPage(updater.pageIndex + 1)
          setPageSize(updater.pageSize)
        }
        // 触发数据重新获取
        mutate()
      })
    },
    shallow: false, // 禁用浅层更新，确保每次分页变化都会触发网络请求
    throttleMs: 50, // 控制 URL 更新的频率
    startTransition, // 使用 startTransition 来处理状态更新
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
            className="max-h-[583px]"
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
