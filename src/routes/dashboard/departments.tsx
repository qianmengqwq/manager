import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDataTable } from '@/hooks/use-data-table'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

// 部门类型定义
interface Department {
  id: string
  name: string
  code: string
  manager?: string
  parentId?: string
  parentName?: string
  description?: string
  createdAt: string
  updatedAt?: string
}

// 表单验证Schema
const departmentFormSchema = z.object({
  name: z.string().min(2, '部门名称至少需要2个字符'),
  code: z.string().min(2, '部门代码至少需要2个字符'),
  manager: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

// 模拟部门数据
const mockDepartments: Department[] = [
  {
    id: '1',
    name: '研发部',
    code: 'DEV',
    manager: '张三',
    description: '负责产品研发和技术创新',
    createdAt: '2023-04-10T08:00:00Z',
    updatedAt: '2023-07-15T10:30:00Z',
  },
  {
    id: '2',
    name: '市场部',
    code: 'MKT',
    manager: '李四',
    description: '负责市场推广和品牌建设',
    createdAt: '2023-04-10T09:15:00Z',
    updatedAt: '2023-06-20T14:45:00Z',
  },
  {
    id: '3',
    name: '人力资源部',
    code: 'HR',
    manager: '王五',
    description: '负责人才招聘和团队建设',
    createdAt: '2023-04-11T11:30:00Z',
  },
  {
    id: '4',
    name: '财务部',
    code: 'FIN',
    manager: '赵六',
    description: '负责财务管理和成本控制',
    createdAt: '2023-04-12T13:45:00Z',
    updatedAt: '2023-08-05T09:20:00Z',
  },
  {
    id: '5',
    name: '产品部',
    code: 'PRD',
    manager: '钱七',
    parentId: '1',
    parentName: '研发部',
    description: '负责产品设计和用户体验',
    createdAt: '2023-04-15T10:00:00Z',
  },
  {
    id: '6',
    name: '测试部',
    code: 'QA',
    manager: '孙八',
    parentId: '1',
    parentName: '研发部',
    description: '负责质量保证和产品测试',
    createdAt: '2023-04-16T14:20:00Z',
    updatedAt: '2023-08-10T16:30:00Z',
  },
]

// 创建/编辑部门模态框
function useDepartmentFormModal() {
  const { present } = useModalStack()

  return useCallback((department?: Department) => {
    const isEdit = !!department

    present({
      title: isEdit ? '编辑部门' : '创建部门',
      content: () => {
        // 默认值
        const defaultValues: Partial<DepartmentFormValues> = isEdit
          ? {
              name: department.name,
              code: department.code,
              manager: department.manager || '',
              parentId: department.parentId || '',
              description: department.description || '',
            }
          : {
              name: '',
              code: '',
              manager: '',
              parentId: '',
              description: '',
            }

        // 初始化表单
        const form = useForm<DepartmentFormValues>({
          resolver: zodResolver(departmentFormSchema),
          defaultValues,
        })

        // 提交表单
        const onSubmit = (data: DepartmentFormValues) => {
          console.log('Form submitted:', data)
          toast.success(isEdit ? '部门更新成功' : '部门创建成功')
        }

        return (
          <div className="p-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入部门名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门代码</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入部门代码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门负责人</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入部门负责人姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>上级部门</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">请选择上级部门</option>
                          {mockDepartments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入部门描述"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button">
                    取消
                  </Button>
                  <Button type="submit">
                    {isEdit ? '更新' : '创建'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )
      },
    })
  }, [present])
}

// 部门详情模态框
function useDepartmentDetailModal() {
  const { present } = useModalStack()

  return useCallback((department: Department) => {
    present({
      title: '部门详情',
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
                <p className="text-sm font-medium text-muted-foreground">部门名称</p>
                <p>{department.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">部门代码</p>
                <p>{department.code}</p>
              </div>
              {department.manager && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">部门负责人</p>
                  <p>{department.manager}</p>
                </div>
              )}
              {department.parentName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">上级部门</p>
                  <p>{department.parentName}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">部门描述</p>
                <p>{department.description || '暂无描述'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">创建时间</p>
                <p>{formatDate(department.createdAt)}</p>
              </div>
              {department.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">更新时间</p>
                  <p>{formatDate(department.updatedAt)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">关闭</Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 删除部门确认模态框
function useDeleteDepartmentModal() {
  const { present } = useModalStack()

  return useCallback((department: Department) => {
    present({
      title: '删除部门',
      content: () => {
        const onDelete = () => {
          console.log('Deleting department:', department.id)
          toast.success(`部门"${department.name}"已删除`)
        }

        return (
          <div className="space-y-4 py-2">
            <p>
              确定要删除部门
              {' '}
              <strong>{department.name}</strong>
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

function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const showFormModal = useDepartmentFormModal()
  const showDetailModal = useDepartmentDetailModal()
  const showDeleteModal = useDeleteDepartmentModal()

  // 过滤部门数据
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) {
      return mockDepartments
    }

    const term = searchTerm.toLowerCase()
    return mockDepartments.filter(dept =>
      dept.name.toLowerCase().includes(term)
      || dept.code.toLowerCase().includes(term)
      || (dept.manager && dept.manager.toLowerCase().includes(term))
      || (dept.description && dept.description.toLowerCase().includes(term)),
    )
  }, [searchTerm])

  // 定义表格列
  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="部门名称" />,
      enableColumnFilter: true,
      meta: {
        label: '部门名称',
      },
    },
    {
      id: 'code',
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="部门代码" />,
      enableColumnFilter: true,
      meta: {
        label: '部门代码',
      },
    },
    {
      id: 'manager',
      accessorKey: 'manager',
      header: ({ column }) => <DataTableColumnHeader column={column} title="负责人" />,
      enableColumnFilter: true,
      meta: {
        label: '负责人',
      },
    },
    {
      id: 'parentName',
      accessorKey: 'parentName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="上级部门" />,
      cell: ({ row }) => row.original.parentName || '-',
      enableColumnFilter: true,
      meta: {
        label: '上级部门',
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="创建时间" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return date.toLocaleDateString('zh-CN')
      },
      enableColumnFilter: true,
      meta: {
        label: '创建时间',
        variant: 'date',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const department = row.original

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
              <DropdownMenuItem onClick={() => showDetailModal(department)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showFormModal(department)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑部门
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => showDeleteModal(department)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除部门
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [showDetailModal, showFormModal, showDeleteModal])

  // 初始化表格
  const { table } = useDataTable({
    data: filteredDepartments,
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
        <h2 className="text-2xl font-bold">部门管理</h2>
        <Button onClick={() => showFormModal()}>
          <Plus className="mr-2 h-4 w-4" />
          新建部门
        </Button>
      </div>

      <div className="flex justify-between items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索部门..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/departments')({
  component: DepartmentsPage,
})
