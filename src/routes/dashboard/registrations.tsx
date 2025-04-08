import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { createFileRoute } from '@tanstack/react-router'
import { Check, Eye, MoreHorizontal, Search, X } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

// 定义注册信息类型
interface Registration {
  id: string
  name: string
  email: string
  phone: string
  department?: string
  position?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt?: string
}

// 状态映射
const statusMap = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
}

// 模拟注册数据
const mockRegistrations: Registration[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    department: '研发部',
    position: '前端开发工程师',
    status: 'pending',
    createdAt: '2023-05-10T08:30:00Z',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    department: '产品部',
    position: '产品经理',
    status: 'approved',
    createdAt: '2023-05-09T14:20:00Z',
    updatedAt: '2023-05-10T10:15:00Z',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    department: '市场部',
    position: '市场专员',
    status: 'rejected',
    createdAt: '2023-05-08T11:45:00Z',
    updatedAt: '2023-05-09T09:30:00Z',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    department: '人力资源部',
    position: 'HR专员',
    status: 'pending',
    createdAt: '2023-05-11T15:40:00Z',
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '13800138005',
    department: '财务部',
    position: '财务主管',
    status: 'approved',
    createdAt: '2023-05-07T09:20:00Z',
    updatedAt: '2023-05-08T14:25:00Z',
  },
  {
    id: '6',
    name: '孙八',
    email: 'sunba@example.com',
    phone: '13800138006',
    department: '运营部',
    position: '运营经理',
    status: 'pending',
    createdAt: '2023-05-12T10:10:00Z',
  },
]

// 注册详情模态框
function useRegistrationDetailModal() {
  const { present } = useModalStack()

  return useCallback((registration: Registration) => {
    present({
      title: '注册申请详情',
      content: () => {
        // 格式化日期
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        }

        return (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">姓名</p>
                <p>{registration.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">电子邮箱</p>
                <p>{registration.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">手机号码</p>
                <p>{registration.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">申请状态</p>
                <Badge className={statusMap[registration.status].color}>
                  {statusMap[registration.status].label}
                </Badge>
              </div>
              {registration.department && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">部门</p>
                  <p>{registration.department}</p>
                </div>
              )}
              {registration.position && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">职位</p>
                  <p>{registration.position}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">申请时间</p>
                <p>{formatDate(registration.createdAt)}</p>
              </div>
              {registration.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">处理时间</p>
                  <p>{formatDate(registration.updatedAt)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">关闭</Button>
              {registration.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => toast.success('已拒绝该注册申请')}
                  >
                    拒绝
                  </Button>
                  <Button
                    onClick={() => toast.success('已通过该注册申请')}
                  >
                    通过
                  </Button>
                </>
              )}
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 审核操作模态框
function useReviewModal() {
  const { present } = useModalStack()

  return useCallback((registration: Registration, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve'

    present({
      title: isApprove ? '通过申请' : '拒绝申请',
      content: ({ close }) => {
        const onApprove = () => {
          // 在实际应用中，这里会有API调用来更新状态
          console.warn({ action: 'Approving registration', id: registration.id })
          toast.success(`已批准 ${registration.name} 的注册申请`)
          close()
        }

        const onReject = () => {
          console.warn({ action: 'Rejecting registration', id: registration.id })
          toast.success(`已拒绝 ${registration.name} 的注册申请`)
          close()
        }

        return (
          <div className="space-y-4">
            <p>
              确定要
              {isApprove ? '通过' : '拒绝'}
              {' '}
              {registration.name}
              {' '}
              的注册申请吗？
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={close}>
                取消
              </Button>
              <Button
                variant={isApprove ? 'default' : 'destructive'}
                onClick={isApprove ? onApprove : onReject}
              >
                确认
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

function RegistrationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const showDetail = useRegistrationDetailModal()
  const showReviewModal = useReviewModal()

  // 过滤注册数据
  const filteredRegistrations = useMemo(() => {
    let filtered = mockRegistrations

    // 应用状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter)
    }

    // 应用搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(term)
        || reg.email.toLowerCase().includes(term)
        || reg.phone.includes(term)
        || (reg.department && reg.department.toLowerCase().includes(term))
        || (reg.position && reg.position.toLowerCase().includes(term)),
      )
    }

    return filtered
  }, [searchTerm, statusFilter])

  // 定义表格列
  const columns = useMemo<ColumnDef<Registration>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="姓名" />,
      enableColumnFilter: true,
      meta: {
        label: '姓名',
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="电子邮箱" />,
      enableColumnFilter: true,
      meta: {
        label: '电子邮箱',
      },
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="手机号码" />,
      enableColumnFilter: true,
      meta: {
        label: '手机号码',
      },
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title="部门" />,
      enableColumnFilter: true,
      meta: {
        label: '部门',
      },
    },
    {
      id: 'position',
      accessorKey: 'position',
      header: ({ column }) => <DataTableColumnHeader column={column} title="职位" />,
      enableColumnFilter: true,
      meta: {
        label: '职位',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusMap
        return (
          <Badge className={statusMap[status].color}>
            {statusMap[status].label}
          </Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '状态',
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="申请时间" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return date.toLocaleDateString('zh-CN')
      },
      enableColumnFilter: true,
      meta: {
        label: '申请时间',
        variant: 'date',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const registration = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">操作菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showDetail(registration)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              {registration.status === 'pending' && (
                <>
                  <DropdownMenuItem
                    onClick={() => showReviewModal(registration, 'approve')}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    通过申请
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => showReviewModal(registration, 'reject')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    拒绝申请
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [showDetail, showReviewModal])

  // 初始化表格
  const { table } = useDataTable({
    data: filteredRegistrations,
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
        <h2 className="text-2xl font-bold">注册管理</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索注册信息..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/registrations')({
  component: RegistrationsPage,
})
