import type { EventLog } from '@/components/modules/log/logType'
import { DataTable } from '@/components/data-table/data-table'
import { useColumns } from '@/components/modules/log/columns'
import { useLogDetailModal } from '@/components/modules/log/LogModals'
import { exportEventLogs, fetchEventLogs } from '@/components/modules/log/LogService'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataTable } from '@/hooks/use-data-table'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Download, Search, X } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

function LogsPage() {
  const [_isPending, startTransition] = useTransition()
  const [username, setUsername] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<number>(0)

  const showLogDetail = useLogDetailModal()
  const { present } = useModalStack()

  // 使用 nuqs 管理分页状态
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10))

  // 分页设置
  const pagination = useMemo(() => ({
    pageIndex: page - 1, // 转换为 0-based 索引
    pageSize,
  }), [page, pageSize])

  // 准备过滤参数
  const filters = useMemo(() => {
    const filterParams: {
      module?: string
      username?: string
      level?: number
    } = {}

    if (moduleFilter && moduleFilter !== 'all')
      filterParams.module = moduleFilter
    if (username)
      filterParams.username = username
    if (levelFilter > 0)
      filterParams.level = levelFilter

    return filterParams
  }, [moduleFilter, username, levelFilter])

  // 获取日志列表数据
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/eventlog/selectall', page, pageSize, filters],
    ([_url, page, pageSize, filters]) => fetchEventLogs(page, pageSize, filters),
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

  // 获取可用的模块列表
  const moduleOptions = useMemo(() => {
    if (!logs.length)
      return []

    const modules = ['活动管理', '用户管理', '报名管理', '院系信息']
    return modules.sort()
  }, [logs])

  // 重置所有筛选器
  const resetFilters = () => {
    setUsername('')
    setModuleFilter('all')
    setLevelFilter(0)
    // 重置后刷新数据
    mutate()
  }

  // 定义表格列
  const columns = useColumns({ showLogDetail })

  // 初始化表格
  const { table } = useDataTable({
    data: logs,
    columns,
    pageCount,
    getRowId: row => row.eventid.toString(),
    initialState: {
      pagination,
    },
    enableRowSelection: true, // 启用行选择功能
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

  // 导出当前页日志
  const handleExportCurrentPage = async () => {
    try {
      await exportEventLogs(logs, `系统日志_第${page}页`)
      toast.success(`成功导出第 ${page} 页日志`)
    }
    catch (error) {
      console.error('导出当前页日志失败:', error)
      toast.error('导出日志失败')
    }
  }

  // 导出选中行
  const handleExportSelected = async () => {
    try {
      const selectedRows = table.getSelectedRowModel().rows
      if (selectedRows.length === 0) {
        toast.error('请至少选择一条日志记录')
        return
      }

      const selectedData = selectedRows.map(row => row.original)
      await exportEventLogs(selectedData, `系统日志_已选择_${selectedData.length}条`)
      toast.success(`成功导出 ${selectedData.length} 条选中的日志`)
    }
    catch (error) {
      console.error('导出选中日志失败:', error)
      toast.error('导出日志失败')
    }
  }

  // 导出所有符合筛选条件的日志数据
  const handleExportAllFilteredLogs = async () => {
    try {
      // 显示导出确认对话框
      present({
        title: '导出日志',
        content: () => {
          // 创建一个关闭当前模态框的函数
          const closeModal = () => present({ title: '', content: () => null })

          return (
            <div className="py-2">
              <p>
                您将导出所有筛选后的日志（共
                {totalLogs}
                {' '}
                条）。此操作可能需要一些时间。
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={closeModal}>
                  取消
                </Button>
                <Button
                  onClick={async () => {
                    closeModal()
                    toast.loading('正在导出所有筛选后的日志...', { id: 'export-loading' })
                    try {
                      // 如果数据量较大，可能需要分批获取全部数据
                      if (totalLogs > pageSize) {
                        // 一次性获取所有符合筛选条件的数据
                        const allData = await fetchEventLogs(1, totalLogs, filters)
                        if (allData && allData.data) {
                          await exportEventLogs(allData.data, `系统日志_筛选结果_${totalLogs}条`)
                          toast.success('成功导出所有筛选后的日志', { id: 'export-loading' })
                        }
                      }
                      else {
                        // 数据量较小，直接导出当前数据
                        await exportEventLogs(logs, `系统日志_筛选结果_${logs.length}条`)
                        toast.success('成功导出所有筛选后的日志', { id: 'export-loading' })
                      }
                    }
                    catch (error) {
                      console.error('导出所有筛选日志失败:', error)
                      toast.error('导出失败', { id: 'export-loading' })
                    }
                  }}
                >
                  确认导出
                </Button>
              </div>
            </div>
          )
        },
      })
    }
    catch (error) {
      console.error('导出日志失败:', error)
      toast.error('导出日志失败')
    }
  }

  // 双击行打开详情
  const handleRowDoubleClick = useCallback((row: EventLog) => {
    showLogDetail(row)
  }, [showLogDetail])

  // 当筛选条件变化时刷新数据
  const handleFilterChange = useCallback(() => {
    mutate()
  }, [mutate])

  // 获取选中行数
  const selectedCount = table.getSelectedRowModel().rows.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统日志</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出日志
              {selectedCount > 0 && (
                <span className="ml-1">
                  (
                  {selectedCount}
                  )
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCurrentPage}>
              导出当前页 (
              {logs.length}
              {' '}
              条)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportSelected}
              disabled={selectedCount === 0}
              className={selectedCount === 0 ? 'text-muted-foreground' : ''}
            >
              导出选中行 (
              {selectedCount}
              {' '}
              条)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportAllFilteredLogs}>
              导出所有筛选结果 (
              {totalLogs}
              {' '}
              条)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                  placeholder="搜索用户名..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onBlur={handleFilterChange}
                  onKeyDown={e => e.key === 'Enter' && handleFilterChange()}
                  className="pl-8 w-64"
                />
              </div>

              <Select
                value={moduleFilter}
                onValueChange={(value) => {
                  setModuleFilter(value)
                  startTransition(() => {
                    handleFilterChange()
                  })
                }}
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

              <Select
                value={levelFilter.toString()}
                onValueChange={(value) => {
                  setLevelFilter(Number.parseInt(value))
                  startTransition(() => {
                    handleFilterChange()
                  })
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="所有级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">所有级别</SelectItem>
                  <SelectItem value="1">管理员</SelectItem>
                  <SelectItem value="2">普通用户</SelectItem>
                </SelectContent>
              </Select>

              {(username || moduleFilter !== 'all' || levelFilter > 0) && (
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
              条日志
              {selectedCount > 0 && (
                <span className="ml-2">
                  已选择
                  {' '}
                  {selectedCount}
                  {' '}
                  条
                </span>
              )}
            </div>
          </div>

          <DataTable
            className={cn(
              'max-h-[583px]',
              '[&_tr[data-state=selected]]:bg-blue-100',
              '[&_tr:hover]:bg-muted/60',
              '[&_th:first-child]:pl-4',
              '[&_td:first-child]:pl-4',
            )}
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
