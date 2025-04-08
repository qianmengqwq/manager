import { DataTable } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'

// 报名数据类型
interface Registration {
  id: string
  activityId: string
  activityTitle: string
  studentId: string
  studentName: string
  department: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// 报名状态映射
const registrationStatusMap = {
  pending: { label: '待审核', color: 'secondary' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'destructive' },
} as const

// 模拟活动数据
const mockActivities = [
  { id: '1', title: '迎新晚会' },
  { id: '2', title: '校园歌手大赛' },
  { id: '3', title: '职业生涯规划讲座' },
  { id: '4', title: '毕业典礼' },
]

// 模拟报名数据
const mockRegistrations: Registration[] = [
  {
    id: '1',
    activityId: '1',
    activityTitle: '迎新晚会',
    studentId: '2023001',
    studentName: '张三',
    department: '计算机科学与技术系',
    status: 'pending',
    createdAt: '2023-08-20 10:30',
  },
  {
    id: '2',
    activityId: '1',
    activityTitle: '迎新晚会',
    studentId: '2023002',
    studentName: '李四',
    department: '软件工程系',
    status: 'approved',
    createdAt: '2023-08-20 11:15',
  },
  {
    id: '3',
    activityId: '2',
    activityTitle: '校园歌手大赛',
    studentId: '2022001',
    studentName: '王五',
    department: '电子工程系',
    status: 'pending',
    createdAt: '2023-09-22 14:45',
  },
  {
    id: '4',
    activityId: '2',
    activityTitle: '校园歌手大赛',
    studentId: '2022003',
    studentName: '赵六',
    department: '通信工程系',
    status: 'rejected',
    createdAt: '2023-09-22 15:20',
  },
]

// 报名详情模态框组件
function useRegistrationDetailModal() {
  const { present } = useModalStack()

  return useCallback((registration: Registration) => {
    present({
      title: '报名详情',
      content: () => (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">活动名称</p>
              <p className="font-medium">{registration.activityTitle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">报名时间</p>
              <p className="font-medium">{registration.createdAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">学生姓名</p>
              <p className="font-medium">{registration.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">学号</p>
              <p className="font-medium">{registration.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">所属院系</p>
              <p className="font-medium">{registration.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">状态</p>
              <Badge variant={registrationStatusMap[registration.status].color as any}>
                {registrationStatusMap[registration.status].label}
              </Badge>
            </div>
          </div>

          {registration.status === 'pending' && (
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" size="sm">拒绝</Button>
              <Button size="sm">通过</Button>
            </div>
          )}
        </div>
      ),
    })
  }, [present])
}

// 报名表格列定义
const registrationColumns = [
  {
    accessorKey: 'activityTitle',
    header: '活动名称',
  },
  {
    accessorKey: 'studentName',
    header: '学生姓名',
  },
  {
    accessorKey: 'studentId',
    header: '学号',
  },
  {
    accessorKey: 'department',
    header: '所属院系',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('status') as Registration['status']
      const { label, color } = registrationStatusMap[status]
      return <Badge variant={color as any}>{label}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: '报名时间',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const registration = row.original as Registration

      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            查看
          </Button>
          {registration.status === 'pending' && (
            <>
              <Button variant="outline" size="sm">
                拒绝
              </Button>
              <Button size="sm">
                通过
              </Button>
            </>
          )}
        </div>
      )
    },
  },
]

export function RegistrationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const showRegistrationDetail = useRegistrationDetailModal()

  const filteredRegistrations = mockRegistrations.filter((registration) => {
    // 活动筛选
    const matchesActivity = selectedActivity === 'all' || registration.activityId === selectedActivity

    // 状态筛选
    const matchesStatus = selectedStatus === 'all' || registration.status === selectedStatus

    // 搜索筛选
    const matchesSearch
      = registration.activityTitle.toLowerCase().includes(searchTerm.toLowerCase())
        || registration.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        || registration.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        || registration.department.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesActivity && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">报名审核</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索报名信息..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>

        <div className="w-48">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger>
              <SelectValue placeholder="选择活动" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有活动</SelectItem>
              {mockActivities.map(activity => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-36">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={registrationColumns}
        data={filteredRegistrations}
        onRowClick={row => showRegistrationDetail(row.original as Registration)}
      />
    </div>
  )
}
