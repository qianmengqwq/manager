import type { UserFromResponse } from '@/types/user'
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
import useSWR from 'swr'

// API响应类型
interface ApiResponse<T> {
  code: number
  msg: string | null
  result: T
}

// 用户状态枚举
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked',
}

// 扩展用户类型
interface ExtendedUser extends UserFromResponse {
  status: UserStatus
  lastLogin?: string
}

// 获取用户列表
async function userFetcher(url: string, { page, pageSize }: { page: number, pageSize: number }) {
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page, pageSize }),
  })

  if (!response.ok) {
    throw new Error('获取用户列表失败')
  }

  const data = await response.json() as ApiResponse<UserFromResponse[]>

  if (data.code !== 1000) {
    throw new Error(data.msg || '获取用户列表失败')
  }

  // 扩展用户数据，添加状态（这里模拟状态，实际项目中可以根据具体业务逻辑判断）
  const extendedUsers: ExtendedUser[] = data.result.map(user => ({
    ...user,
    status: Math.random() > 0.7
      ? (Math.random() > 0.5 ? UserStatus.Inactive : UserStatus.Locked)
      : UserStatus.Active,
    lastLogin: Math.random() > 0.3 ? new Date().toISOString() : undefined,
  }))

  return {
    data: extendedUsers,
    total: data.result.length ? data.result.length * 3 : 0, // 假设总数是当前页的3倍，实际应该从API返回
    page,
    pageSize,
  }
}

// 获取单个用户详情 (暂模拟数据，实际项目中应该调用真实API)
async function getUserDetail(userId: number): Promise<ExtendedUser | null> {
  try {
    // 实际应该调用 `/api/user/detail/${userId}` 类似的接口
    const response = await fetch(`/api/user/selectall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page: 1, pageSize: 100 }), // 获取用户详情时暂时请求更多数据
    })

    if (!response.ok) {
      throw new Error('获取用户详情失败')
    }

    const data = await response.json() as ApiResponse<UserFromResponse[]>

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取用户详情失败')
    }

    // 查找对应用户
    const user = data.result.find(u => u.userid === userId)

    if (!user) {
      return null
    }

    // 扩展用户数据
    return {
      ...user,
      status: Math.random() > 0.7
        ? (Math.random() > 0.5 ? UserStatus.Inactive : UserStatus.Locked)
        : UserStatus.Active,
      lastLogin: Math.random() > 0.3 ? new Date().toISOString() : undefined,
    }
  }
  catch {
    console.error('获取用户详情失败')
    return null
  }
}

// 用户详情模态框
function useUserDetailModal() {
  const { present } = useModalStack()

  return useCallback((userId: number) => {
    present({
      title: '用户详情',
      content: () => {
        const [user, setUser] = useState<ExtendedUser | null>(null)
        const [isLoading, setIsLoading] = useState(true)

        // 获取用户详情
        useSWR(['userDetail', userId], async () => {
          setIsLoading(true)
          try {
            const detail = await getUserDetail(userId)
            setUser(detail)
          }
          catch {
            toast.error('获取用户详情失败')
          }
          finally {
            setIsLoading(false)
          }
        })

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
        const statusBadge = (status: UserStatus) => {
          switch (status) {
            case UserStatus.Active:
              return <Badge className="bg-green-500">已激活</Badge>
            case UserStatus.Inactive:
              return <Badge variant="outline">未激活</Badge>
            case UserStatus.Locked:
              return <Badge variant="destructive">已锁定</Badge>
            default:
              return null
          }
        }

        // 用户角色标签
        const roleBadge = (level: number) => {
          switch (level) {
            case 1:
              return <Badge className="bg-blue-500">管理员</Badge>
            case 2:
              return <Badge className="bg-purple-500">部门主管</Badge>
            case 3:
              return <Badge>普通成员</Badge>
            default:
              return (
                <Badge>
                  未知角色(
                  {level}
                  )
                </Badge>
              )
          }
        }

        if (isLoading) {
          return <div className="py-8 text-center">加载中...</div>
        }

        if (!user) {
          return <div className="py-8 text-center">用户不存在或已被删除</div>
        }

        return (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                {user.username.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.username}</h3>
                <div className="flex gap-2 mt-1">
                  {statusBadge(user.status)}
                  {roleBadge(user.level)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">用户ID</p>
                <p>{user.userid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">头像</p>
                <p className="truncate">{user.profilepicture || '无'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">最后登录</p>
                <p>{formatDate(user.lastLogin)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">关闭</Button>
              {user.status === UserStatus.Locked && (
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  解锁账户
                </Button>
              )}
              {user.status === UserStatus.Active && (
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

  return useCallback((user: ExtendedUser) => {
    present({
      title: '删除用户',
      content: () => {
        const onDelete = () => {
          console.log('Deleting user:', user.userid)
          toast.success(`用户"${user.username}"已删除`)
        }

        return (
          <div className="space-y-4 py-2">
            <p>
              确定要删除用户
              {' '}
              <strong>{user.username}</strong>
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

  // 分页设置
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // 计算当前页码和页大小
  const page = pagination.pageIndex + 1 // 转为1-based索引
  const pageSize = pagination.pageSize

  // 获取用户列表数据
  const { data, error, isLoading } = useSWR(
    ['/user/selectall', page, pageSize],
    () => userFetcher('/user/selectall', { page, pageSize }),
    {
      suspense: false,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  )

  const users = data?.data || []
  const totalUsers = data?.total || 0
  const pageCount = Math.ceil(totalUsers / pageSize)

  // 处理加载错误
  if (error) {
    toast.error('获取用户列表失败')
  }

  // 过滤用户数据 - 针对本地筛选
  const filteredUsers = useMemo(() => {
    let filtered = users || []

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // 按角色筛选
    if (roleFilter !== 'all') {
      const levelMap: Record<string, number> = {
        admin: 1,
        manager: 2,
        member: 3,
      }
      filtered = filtered.filter(user => user.level === levelMap[roleFilter])
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term)
        || String(user.userid).includes(term),
      )
    }

    return filtered
  }, [users, searchTerm, statusFilter, roleFilter])

  // 定义表格列
  const columns = useMemo<ColumnDef<ExtendedUser>[]>(() => [
    {
      id: 'userid',
      accessorKey: 'userid',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      enableColumnFilter: true,
      meta: {
        label: 'ID',
      },
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title="用户名" />,
      enableColumnFilter: true,
      meta: {
        label: '用户名',
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
      id: 'level',
      accessorKey: 'level',
      header: ({ column }) => <DataTableColumnHeader column={column} title="角色" />,
      cell: ({ row }) => {
        const level = row.original.level
        switch (level) {
          case 1:
            return <Badge className="bg-blue-500">管理员</Badge>
          case 2:
            return <Badge className="bg-purple-500">部门主管</Badge>
          case 3:
            return <Badge>普通成员</Badge>
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
          case UserStatus.Active:
            return <Badge className="bg-green-500">已激活</Badge>
          case UserStatus.Inactive:
            return <Badge variant="outline">未激活</Badge>
          case UserStatus.Locked:
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
              <DropdownMenuItem onClick={() => showDetailModal(user.userid)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                编辑用户
              </DropdownMenuItem>
              {user.status === UserStatus.Active && (
                <DropdownMenuItem className="text-amber-500 focus:text-amber-500">
                  <XCircle className="mr-2 h-4 w-4" />
                  锁定账户
                </DropdownMenuItem>
              )}
              {user.status === UserStatus.Locked && (
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
    pageCount,
    getRowId: row => String(row.userid),
    initialState: {
      pagination,
    },
    onPaginationChange: setPagination,
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

      {isLoading && !data ? (
        <div className="py-8 text-center">加载中...</div>
      ) : (
        <>
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
                  <SelectItem value={UserStatus.Active}>已激活</SelectItem>
                  <SelectItem value={UserStatus.Inactive}>未激活</SelectItem>
                  <SelectItem value={UserStatus.Locked}>已锁定</SelectItem>
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
              {totalUsers}
              {' '}
              个用户
            </div>
          </div>

          <DataTable
            table={table}
          />
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
})
