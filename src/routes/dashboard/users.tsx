import type { UserFromResponse } from '@/types/user'
import { DataTable } from '@/components/data-table/data-table'
import {
  fetchUsers,
  useAddUserModal,
  useDeleteUserModal,
  useEditUserModal,
  useKickOutModal,
  useUserDetailModal,
} from '@/components/modules/user'
import { useColumns } from '@/components/modules/user/columns'
import { Button } from '@/components/ui/button'
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
  Plus,
  Search,
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
  const showKickOutModal = useKickOutModal()

  // 获取用户列表数据
  const { data, error, isLoading } = useSWR(
    'userList',
    () => fetchUsers(),
    {
      suspense: false,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  )

  const users = data?.result || []

  // 处理加载错误
  if (error) {
    toast.error('获取用户列表失败')
  }

  // 过滤用户数据 - 针对本地筛选
  const filteredUsers = useMemo(() => {
    let filtered = users

    // 按角色筛选
    if (roleFilter !== 'all') {
      const levelMap: Record<string, number> = {
        admin: 1,
        user: 2,
      }
      filtered = filtered.filter((user: UserFromResponse) => user.level === levelMap[roleFilter])
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((user: UserFromResponse) =>
        user.username.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term)
        || String(user.userid).includes(term),
      )
    }

    return filtered
  }, [users, searchTerm, roleFilter])

  // 获取表格列定义
  const columns = useColumns({
    showDetailModal,
    showEditModal,
    showDeleteModal,
    showKickOutModal,
  })

  // 初始化表格
  const { table } = useDataTable({
    data: filteredUsers,
    columns,
    getRowId: row => String(row.userid),
    pageCount: Math.ceil(filteredUsers.length / 10), // 每页10条数据
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
              {filteredUsers.length}
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
