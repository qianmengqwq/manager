import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, PlusCircle, Search } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'

// 学院数据类型
interface College {
  id: string
  name: string
  shortName: string
  createdAt: string
  departments: Department[]
}

// 系部数据类型
interface Department {
  id: string
  collegeId: string
  name: string
  shortName: string
  createdAt: string
}

// 模拟学院数据
const mockColleges: College[] = [
  {
    id: '1',
    name: '计算机科学学院',
    shortName: '计科',
    createdAt: '2023-01-01',
    departments: [
      {
        id: '101',
        collegeId: '1',
        name: '计算机科学与技术系',
        shortName: '计科',
        createdAt: '2023-01-01',
      },
      {
        id: '102',
        collegeId: '1',
        name: '软件工程系',
        shortName: '软工',
        createdAt: '2023-01-01',
      },
    ],
  },
  {
    id: '2',
    name: '电子信息学院',
    shortName: '电信',
    createdAt: '2023-01-02',
    departments: [
      {
        id: '201',
        collegeId: '2',
        name: '电子工程系',
        shortName: '电工',
        createdAt: '2023-01-02',
      },
      {
        id: '202',
        collegeId: '2',
        name: '通信工程系',
        shortName: '通信',
        createdAt: '2023-01-02',
      },
    ],
  },
]

// 学院表格列定义
const collegeColumns = [
  {
    accessorKey: 'name',
    header: '学院名称',
  },
  {
    accessorKey: 'shortName',
    header: '简称',
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const college = row.original as College
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            编辑
          </Button>
          <Button variant="destructive" size="sm">
            删除
          </Button>
          <Button variant="outline" size="sm">
            <ChevronDown className="h-4 w-4 mr-1" />
            查看系部
          </Button>
        </div>
      )
    },
  },
]

// 系部表格列定义
const departmentColumns = [
  {
    accessorKey: 'name',
    header: '系部名称',
  },
  {
    accessorKey: 'shortName',
    header: '简称',
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

// 学院表单模态框组件
function useCollegeFormModal() {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '添加学院',
      content: () => (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">学院名称</label>
            <Input placeholder="请输入学院名称" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">简称</label>
            <Input placeholder="请输入简称" />
          </div>
          <div className="flex justify-end pt-4">
            <Button>提交</Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

// 系部表单模态框组件
function useDepartmentFormModal() {
  const { present } = useModalStack()

  return useCallback((collegeId: string, collegeName: string) => {
    present({
      title: `添加系部 (${collegeName})`,
      content: () => (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">系部名称</label>
            <Input placeholder="请输入系部名称" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">简称</label>
            <Input placeholder="请输入简称" />
          </div>
          <div className="flex justify-end pt-4">
            <Button>提交</Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

export function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)

  const showCollegeForm = useCollegeFormModal()
  const showDepartmentForm = useDepartmentFormModal()

  return (
    <div className="space-y-6">
      {/* 学院管理 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">学院管理</h2>
          <Button onClick={showCollegeForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加学院
          </Button>
        </div>

        <div className="flex items-center py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学院..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <DataTable
          columns={collegeColumns}
          data={mockColleges.filter(college =>
            college.name.toLowerCase().includes(searchTerm.toLowerCase())
            || college.shortName.toLowerCase().includes(searchTerm.toLowerCase()),
          )}
          onRowClick={row => setSelectedCollege(row.original as College)}
        />
      </div>

      {/* 系部管理 */}
      {selectedCollege && (
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {selectedCollege.name}
              {' '}
              - 系部管理
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedCollege(null)}>
                返回
              </Button>
              <Button onClick={() => showDepartmentForm(selectedCollege.id, selectedCollege.name)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                添加系部
              </Button>
            </div>
          </div>

          <DataTable
            columns={departmentColumns}
            data={selectedCollege.departments}
          />
        </div>
      )}
    </div>
  )
}
