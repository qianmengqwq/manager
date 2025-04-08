import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Search } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'

// 用户数据类型
interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '管理员',
    email: 'admin@example.com',
    role: '管理员',
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    name: '教师用户',
    email: 'teacher@example.com',
    role: '教师',
    createdAt: '2023-01-02',
  },
  {
    id: '3',
    name: '学生用户',
    email: 'student@example.com',
    role: '学生',
    createdAt: '2023-01-03',
  },
]

// 用户表格列定义
const columns = [
  {
    accessorKey: 'name',
    header: '用户名',
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'role',
    header: '角色',
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            编辑
          </Button>
          <Button variant="destructive" size="sm">
            删除
          </Button>
        </div>
      )
    },
  },
]

// 用户表单模态框组件
function useUserFormModal() {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '添加用户',
      content: () => (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">用户名</label>
            <Input placeholder="请输入用户名" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <Input type="email" placeholder="请输入邮箱" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">密码</label>
            <Input type="password" placeholder="请输入密码" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">角色</label>
            <Input placeholder="请输入角色" />
          </div>
          <div className="flex justify-end pt-4">
            <Button>提交</Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const showUserForm = useUserFormModal()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button onClick={showUserForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
          || user.email.toLowerCase().includes(searchTerm.toLowerCase())
          || user.role.toLowerCase().includes(searchTerm.toLowerCase()),
        )}
      />
    </div>
  )
}
