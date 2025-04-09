import type { UserFromResponse } from '@/types/user'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  fetchUsers,
  useAddUserModal,
  useDeleteUserModal,
  useEditUserModal,
  useUserDetailModal,
} from '@/components/modules/user'
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
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const showDetailModal = useUserDetailModal()
  const showDeleteModal = useDeleteUserModal()
  const showAddModal = useAddUserModal()
  const showEditModal = useEditUserModal()

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
    () => fetchUsers(page, pageSize),
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

    // 按角色筛选
    if (roleFilter !== 'all') {
      const levelMap: Record<string, number> = {
        admin: 1,
        user: 2,
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
  }, [users, searchTerm, roleFilter])

  // 定义表格列
  const columns = useMemo<ColumnDef<UserFromResponse>[]>(() => [
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
        label: '角色',
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
              <DropdownMenuItem onClick={() => showEditModal(user)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑用户
              </DropdownMenuItem>
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
  ], [showDetailModal, showDeleteModal, showEditModal])

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

  // 双击行打开用户详情
  const handleRowDoubleClick = useCallback((row: UserFromResponse) => {
    showDetailModal(row.userid)
  }, [showDetailModal])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button onClick={showAddModal}>
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
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="所有角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="user">普通用户</SelectItem>
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
            onRowDoubleClick={handleRowDoubleClick}
          />
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
})
