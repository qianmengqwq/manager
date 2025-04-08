import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
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
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState } from 'react'

// 日志类型
type LogLevel = 'info' | 'warning' | 'error' | 'critical'

// 日志操作类型
type LogOperation = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'view'

// 日志定义
interface Log {
  id: string
  timestamp: string
  level: LogLevel
  operation: LogOperation
  module: string
  message: string
  user: {
    id: string
    name: string
  }
  ip: string
  userAgent?: string
  details?: Record<string, any>
}

// 模拟日志数据
const mockLogs: Log[] = [
  {
    id: '1',
    timestamp: '2023-09-18T09:15:30Z',
    level: 'info',
    operation: 'login',
    module: '认证模块',
    message: '用户登录成功',
    user: {
      id: '101',
      name: '张三',
    },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  },
  {
    id: '2',
    timestamp: '2023-09-18T10:25:15Z',
    level: 'error',
    operation: 'update',
    module: '用户管理',
    message: '更新用户信息失败',
    user: {
      id: '102',
      name: '李四',
    },
    ip: '192.168.1.101',
    details: {
      error: '数据库连接超时',
      userId: '305',
      attemptedFields: ['email', 'phone'],
    },
  },
  {
    id: '3',
    timestamp: '2023-09-18T11:30:45Z',
    level: 'warning',
    operation: 'delete',
    module: '部门管理',
    message: '删除部门操作',
    user: {
      id: '101',
      name: '张三',
    },
    ip: '192.168.1.100',
    details: {
      departmentId: 'D-2023-09',
      departmentName: '财务部',
      affectedUsers: 12,
    },
  },
  {
    id: '4',
    timestamp: '2023-09-18T13:45:20Z',
    level: 'info',
    operation: 'export',
    module: '报表系统',
    message: '导出报表数据',
    user: {
      id: '103',
      name: '王五',
    },
    ip: '192.168.1.102',
    details: {
      reportType: '月度财务报表',
      format: 'Excel',
      period: '2023-08',
    },
  },
  {
    id: '5',
    timestamp: '2023-09-18T15:10:00Z',
    level: 'critical',
    operation: 'update',
    module: '系统配置',
    message: '系统配置修改失败',
    user: {
      id: '104',
      name: '管理员',
    },
    ip: '192.168.1.1',
    details: {
      configName: 'DATABASE_CONNECTION',
      error: '权限不足',
    },
  },
  {
    id: '6',
    timestamp: '2023-09-18T16:20:30Z',
    level: 'info',
    operation: 'create',
    module: '用户管理',
    message: '创建新用户',
    user: {
      id: '101',
      name: '张三',
    },
    ip: '192.168.1.100',
    details: {
      newUserId: '312',
      username: 'newuser@example.com',
      role: 'member',
    },
  },
  {
    id: '7',
    timestamp: '2023-09-18T17:05:10Z',
    level: 'info',
    operation: 'logout',
    module: '认证模块',
    message: '用户登出系统',
    user: {
      id: '103',
      name: '王五',
    },
    ip: '192.168.1.102',
  },
  {
    id: '8',
    timestamp: '2023-09-19T09:10:00Z',
    level: 'error',
    operation: 'import',
    module: '数据导入',
    message: '数据导入失败',
    user: {
      id: '102',
      name: '李四',
    },
    ip: '192.168.1.101',
    details: {
      fileName: 'employees_data.xlsx',
      error: '格式错误',
      position: 'Row 15, Column C',
    },
  },
  {
    id: '9',
    timestamp: '2023-09-19T10:30:45Z',
    level: 'warning',
    operation: 'view',
    module: '敏感数据',
    message: '查看敏感信息',
    user: {
      id: '102',
      name: '李四',
    },
    ip: '192.168.1.101',
    details: {
      dataType: '员工薪资信息',
      departmentId: 'D-2023-10',
    },
  },
  {
    id: '10',
    timestamp: '2023-09-19T11:45:20Z',
    level: 'info',
    operation: 'create',
    module: '部门管理',
    message: '创建新部门',
    user: {
      id: '104',
      name: '管理员',
    },
    ip: '192.168.1.1',
    details: {
      departmentId: 'D-2023-11',
      departmentName: '新媒体部',
      parentDepartment: '市场营销中心',
    },
  },
]

// 日志详情模态框
function useLogDetailModal() {
  const { present } = useModalStack()

  return useCallback((log: Log) => {
    present({
      title: '日志详情',
      content: () => {
        // 格式化日期
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        }

        // 日志级别标签
        const getLevelBadge = (level: LogLevel) => {
          switch (level) {
            case 'info':
              return <Badge className="bg-blue-500">信息</Badge>
            case 'warning':
              return <Badge className="bg-yellow-500">警告</Badge>
            case 'error':
              return <Badge className="bg-red-500">错误</Badge>
            case 'critical':
              return <Badge className="bg-purple-700">严重</Badge>
            default:
              return null
          }
        }

        // 操作类型
        const getOperationText = (operation: LogOperation) => {
          const operationMap: Record<LogOperation, string> = {
            login: '登录',
            logout: '登出',
            create: '创建',
            update: '更新',
            delete: '删除',
            export: '导出',
            import: '导入',
            view: '查看',
          }
          return operationMap[operation] || operation
        }

        return (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getLevelBadge(log.level)}
                <span className="text-muted-foreground text-sm">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <Badge variant="outline">{log.module}</Badge>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{log.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">操作人</p>
                <p>
                  {log.user.name}
                  {' '}
                  (ID:
                  {' '}
                  {log.user.id}
                  )
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">操作类型</p>
                <p>{getOperationText(log.operation)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP地址</p>
                <p>{log.ip}</p>
              </div>
              {log.userAgent && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">客户端</p>
                  <p className="text-sm truncate">{log.userAgent}</p>
                </div>
              )}
            </div>

            {log.details && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">详细信息</p>
                <div className="bg-muted p-3 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline">关闭</Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [operationFilter, setOperationFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({})
  const showLogDetail = useLogDetailModal()

  // 过滤日志数据
  const filteredLogs = useMemo(() => {
    let filtered = mockLogs

    // 按级别筛选
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    // 按操作类型筛选
    if (operationFilter !== 'all') {
      filtered = filtered.filter(log => log.operation === operationFilter)
    }

    // 按日期范围筛选
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate)
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate)
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term)
        || log.user.name.toLowerCase().includes(term)
        || log.module.toLowerCase().includes(term)
        || log.ip.includes(term),
      )
    }

    // 按时间倒序排序（最新的在前面）
    return [...filtered].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [searchTerm, levelFilter, operationFilter, dateRange])

  // 重置所有筛选器
  const resetFilters = () => {
    setSearchTerm('')
    setLevelFilter('all')
    setOperationFilter('all')
    setDateRange({})
  }

  // 定义表格列
  const columns = useMemo<ColumnDef<Log>[]>(() => [
    {
      id: 'timestamp',
      accessorKey: 'timestamp',
      header: ({ column }) => <DataTableColumnHeader column={column} title="时间" />,
      cell: ({ row }) => {
        const timestamp = row.getValue('timestamp') as string
        return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
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
        const level = row.getValue('level') as LogLevel
        switch (level) {
          case 'info':
            return <Badge className="bg-blue-500">信息</Badge>
          case 'warning':
            return <Badge className="bg-yellow-500">警告</Badge>
          case 'error':
            return <Badge className="bg-red-500">错误</Badge>
          case 'critical':
            return <Badge className="bg-purple-700">严重</Badge>
          default:
            return null
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '级别',
      },
    },
    {
      id: 'operation',
      accessorKey: 'operation',
      header: ({ column }) => <DataTableColumnHeader column={column} title="操作类型" />,
      cell: ({ row }) => {
        const operation = row.getValue('operation') as LogOperation
        const operationMap: Record<LogOperation, { text: string, color: string }> = {
          login: { text: '登录', color: 'bg-green-100 text-green-800' },
          logout: { text: '登出', color: 'bg-green-100 text-green-800' },
          create: { text: '创建', color: 'bg-blue-100 text-blue-800' },
          update: { text: '更新', color: 'bg-amber-100 text-amber-800' },
          delete: { text: '删除', color: 'bg-red-100 text-red-800' },
          export: { text: '导出', color: 'bg-purple-100 text-purple-800' },
          import: { text: '导入', color: 'bg-purple-100 text-purple-800' },
          view: { text: '查看', color: 'bg-gray-100 text-gray-800' },
        }

        const { text, color } = operationMap[operation] || { text: operation, color: 'bg-gray-100 text-gray-800' }
        return <Badge variant="outline" className={color}>{text}</Badge>
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
      id: 'message',
      accessorKey: 'message',
      header: ({ column }) => <DataTableColumnHeader column={column} title="消息" />,
      enableColumnFilter: true,
      meta: {
        label: '消息',
      },
    },
    {
      id: 'user',
      accessorKey: 'user.name',
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
    if (!dateRange.from && !dateRange.to)
      return '选择日期'

    let displayText = ''
    if (dateRange.from) {
      displayText += format(dateRange.from, 'yyyy-MM-dd', { locale: zhCN })
    }

    if (dateRange.to) {
      displayText += ` 至 ${format(dateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
    }
    else if (dateRange.from) {
      displayText += ' 起'
    }

    return displayText
  }

  // 初始化表格
  const { table } = useDataTable({
    data: filteredLogs,
    columns,
    pageCount: 1,
    getRowId: row => row.id,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统日志</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出日志
        </Button>
      </div>

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
            value={levelFilter}
            onValueChange={setLevelFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="所有级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有级别</SelectItem>
              <SelectItem value="info">信息</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="error">错误</SelectItem>
              <SelectItem value="critical">严重</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={operationFilter}
            onValueChange={setOperationFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="所有操作" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有操作</SelectItem>
              <SelectItem value="login">登录</SelectItem>
              <SelectItem value="logout">登出</SelectItem>
              <SelectItem value="create">创建</SelectItem>
              <SelectItem value="update">更新</SelectItem>
              <SelectItem value="delete">删除</SelectItem>
              <SelectItem value="export">导出</SelectItem>
              <SelectItem value="import">导入</SelectItem>
              <SelectItem value="view">查看</SelectItem>
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

          {(searchTerm || levelFilter !== 'all' || operationFilter !== 'all' || dateRange.from || dateRange.to) && (
            <Button variant="ghost" size="icon" onClick={resetFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          共
          {' '}
          {filteredLogs.length}
          {' '}
          条日志
        </div>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/logs')({
  component: LogsPage,
})
