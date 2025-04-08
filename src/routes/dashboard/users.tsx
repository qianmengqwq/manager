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
import {
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

// 用户状态类型
type UserStatus = 'active' | 'inactive' | 'locked'

// 用户角色类型
type UserRole = 'admin' | 'manager' | 'member'

// 用户类型定义
interface User {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  role: UserRole
  status: UserStatus
  lastLogin?: string
  createdAt: string
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    department: '研发部',
    role: 'admin',
    status: 'active',
    lastLogin: '2023-09-15T08:30:00Z',
    createdAt: '2023-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    department: '市场部',
    role: 'manager',
    status: 'active',
    lastLogin: '2023-09-14T15:45:00Z',
    createdAt: '2023-02-15T09:30:00Z',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    department: '人力资源部',
    role: 'member',
    status: 'inactive',
    createdAt: '2023-03-20T14:20:00Z',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    department: '财务部',
    role: 'manager',
    status: 'active',
    lastLogin: '2023-09-10T11:20:00Z',
    createdAt: '2023-04-05T16:15:00Z',
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '13800138005',
    department: '产品部',
    role: 'member',
    status: 'locked',
    lastLogin: '2023-08-25T09:10:00Z',
    createdAt: '2023-05-12T13:40:00Z',
  },
  {
    id: '6',
    name: '孙八',
    email: 'sunba@example.com',
    phone: '13800138006',
    department: '测试部',
    role: 'member',
    status: 'active',
    lastLogin: '2023-09-13T14:30:00Z',
    createdAt: '2023-06-18T10:25:00Z',
  },
]

// 用户详情模态框
function useUserDetailModal() {
  const { present } = useModalStack()

  return useCallback((user: User) => {
    present({
      title: '用户详情',
      content: () => {
        // 格式化日期
        const formatDate = (dateString?: string) => {
          if (!dateString)
            return '暂无记录'
          return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        }

        // 用户状态标签
        const statusBadge = () => {
          switch (user.status) {
            case 'active':
              return <Badge className="bg-green-500">已激活</Badge>
            case 'inactive':
              return <Badge variant="outline">未激活</Badge>
            case 'locked':
              return <Badge variant="destructive">已锁定</Badge>
            default:
              return null
          }
        }

        // 用户角色标签
        const roleBadge = () => {
          switch (user.role) {
            case 'admin':
              return <Badge className="bg-blue-500">管理员</Badge>
            case 'manager':
              return <Badge className="bg-purple-500">部门主管</Badge>
            case 'member':
              return <Badge>普通成员</Badge>
            default:
              return null
          }
        }

        return (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex gap-2 mt-1">
                  {statusBadge()}
                  {roleBadge()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                <p>{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">手机号</p>
                  <p>{user.phone}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">所属部门</p>
                  <p>{user.department}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">创建时间</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">最后登录</p>
                <p>{formatDate(user.lastLogin)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">关闭</Button>
              {user.status === 'locked' && (
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  解锁账户
                </Button>
              )}
              {user.status === 'active' && (
                <Button variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-50">
                  <XCircle className="mr-2 h-4 w-4" />
                  锁定账户
                </Button>
              )}
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 删除用户确认模态框
function useDeleteUserModal() {
  const { present } = useModalStack()

  return useCallback((user: User) => {
    present({
      title: '删除用户',
      content: () => {
        const onDelete = () => {
          console.log('Deleting user:', user.id)
          toast.success(`用户"${user.name}"已删除`)
        }

        return (
          <div className="space-y-4 py-2">
            <p>
              确定要删除用户
              {' '}
              <strong>{user.name}</strong>
              {' '}
              吗？此操作不可撤销。
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline">取消</Button>
              <Button
                variant="destructive"
                onClick={onDelete}
              >
                删除
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const showDetailModal = useUserDetailModal()
  const showDeleteModal = useDeleteUserModal()

  // 过滤用户数据
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // 按角色筛选
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term)
        || (user.phone && user.phone.includes(term))
        || (user.department && user.department.toLowerCase().includes(term)),
      )
    }

    return filtered
  }, [searchTerm, statusFilter, roleFilter])

  // 定义表格列
  const columns = useMemo<ColumnDef<User>[]>(() => [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="邮箱" />,
      enableColumnFilter: true,
      meta: {
        label: '邮箱',
      },
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title="部门" />,
      cell: ({ row }) => row.original.department || '-',
      enableColumnFilter: true,
      meta: {
        label: '部门',
      },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="角色" />,
      cell: ({ row }) => {
        const role = row.getValue('role') as UserRole
        switch (role) {
          case 'admin':
            return <Badge className="bg-blue-500">管理员</Badge>
          case 'manager':
            return <Badge className="bg-purple-500">部门主管</Badge>
          case 'member':
            return <Badge>普通成员</Badge>
          default:
            return '-'
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '角色',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as UserStatus
        switch (status) {
          case 'active':
            return <Badge className="bg-green-500">已激活</Badge>
          case 'inactive':
            return <Badge variant="outline">未激活</Badge>
          case 'locked':
            return <Badge variant="destructive">已锁定</Badge>
          default:
            return '-'
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '状态',
      },
    },
    {
      id: 'lastLogin',
      accessorKey: 'lastLogin',
      header: ({ column }) => <DataTableColumnHeader column={column} title="最后登录" />,
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin
        if (!lastLogin)
          return '从未登录'
        return new Date(lastLogin).toLocaleDateString('zh-CN')
      },
      enableColumnFilter: true,
      meta: {
        label: '最后登录',
        variant: 'date',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const user = row.original

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
              <DropdownMenuItem onClick={() => showDetailModal(user)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                编辑用户
              </DropdownMenuItem>
              {user.status === 'active' && (
                <DropdownMenuItem className="text-amber-500 focus:text-amber-500">
                  <XCircle className="mr-2 h-4 w-4" />
                  锁定账户
                </DropdownMenuItem>
              )}
              {user.status === 'locked' && (
                <DropdownMenuItem className="text-green-500 focus:text-green-500">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  解锁账户
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => showDeleteModal(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除用户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [showDetailModal, showDeleteModal])

  // 初始化表格
  const { table } = useDataTable({
    data: filteredUsers,
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
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建用户
        </Button>
      </div>

      <div className="flex flex-wrap justify-between items-center py-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="所有状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">已激活</SelectItem>
              <SelectItem value="inactive">未激活</SelectItem>
              <SelectItem value="locked">已锁定</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="所有角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有角色</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
              <SelectItem value="manager">部门主管</SelectItem>
              <SelectItem value="member">普通成员</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          共
          {' '}
          {filteredUsers.length}
          {' '}
          个用户
        </div>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
})
