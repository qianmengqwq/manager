import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Download, Edit, FileDown, Users } from "lucide-react"
import { useNavigate, useParams } from '@tanstack/react-router'
import { cn } from "@/lib/utils"

// 活动状态映射
const activityStatusMap = {
  draft: { label: "草稿", color: "secondary" },
  published: { label: "已发布", color: "success" },
  ended: { label: "已结束", color: "warning" },
  archived: { label: "已归档", color: "destructive" }
} as const

// 模拟活动详情数据
const mockActivityDetail = {
  id: "1",
  title: "迎新晚会",
  status: "published" as const,
  startTime: "2023-09-01 19:00",
  endTime: "2023-09-01 22:00",
  location: "大学礼堂",
  organizer: "学生会",
  createdBy: "管理员",
  createdAt: "2023-08-15",
  updatedAt: "2023-08-20",
  content: `<div>
    <h2>迎新晚会</h2>
    <p>欢迎新同学加入我们的大家庭！</p>
    <p>本次晚会将有精彩的文艺表演、游戏互动和抽奖环节。</p>
    <h3>活动流程：</h3>
    <ol>
      <li>开场致辞</li>
      <li>文艺表演</li>
      <li>互动游戏</li>
      <li>抽奖环节</li>
      <li>闭幕致辞</li>
    </ol>
    <p>期待您的参与！</p>
  </div>`,
  registrationCount: {
    total: 120,
    approved: 98,
    rejected: 12,
    pending: 10
  }
}

// 模拟活动数据库
const mockActivitiesDB: Record<string, typeof mockActivityDetail> = {
  "1": {
    id: "1",
    title: "迎新晚会",
    status: "published" as const,
    startTime: "2023-09-01 19:00",
    endTime: "2023-09-01 22:00",
    location: "大学礼堂",
    organizer: "学生会",
    createdBy: "管理员",
    createdAt: "2023-08-15",
    updatedAt: "2023-08-20",
    content: `<div>
      <h2>迎新晚会</h2>
      <p>欢迎新同学加入我们的大家庭！</p>
      <p>本次晚会将有精彩的文艺表演、游戏互动和抽奖环节。</p>
      <h3>活动流程：</h3>
      <ol>
        <li>开场致辞</li>
        <li>文艺表演</li>
        <li>互动游戏</li>
        <li>抽奖环节</li>
        <li>闭幕致辞</li>
      </ol>
      <p>期待您的参与！</p>
    </div>`,
    registrationCount: {
      total: 120,
      approved: 98,
      rejected: 12,
      pending: 10
    }
  },
  "2": {
    id: "2",
    title: "校园歌手大赛",
    status: "draft" as const,
    startTime: "2023-10-15 14:00",
    endTime: "2023-10-15 17:00",
    location: "大学礼堂",
    organizer: "学生会",
    createdBy: "教师用户",
    createdAt: "2023-09-20",
    updatedAt: "2023-09-25",
    content: `<div>
      <h2>校园歌手大赛</h2>
      <p>展示你的歌唱才华！</p>
      <p>本次比赛将评选出最佳歌手、最佳表演等奖项。</p>
      <h3>比赛流程：</h3>
      <ol>
        <li>初赛</li>
        <li>复赛</li>
        <li>决赛</li>
        <li>颁奖典礼</li>
      </ol>
      <p>期待您的参与！</p>
    </div>`,
    registrationCount: {
      total: 85,
      approved: 65,
      rejected: 10,
      pending: 10
    }
  }
}

// 模拟报名数据
const mockRegistrations = [
  {
    id: "1",
    studentId: "2023001",
    studentName: "张三",
    department: "计算机科学与技术系",
    status: "pending" as const,
    createdAt: "2023-08-20 10:30"
  },
  {
    id: "2",
    studentId: "2023002",
    studentName: "李四",
    department: "软件工程系",
    status: "approved" as const,
    createdAt: "2023-08-20 11:15"
  },
  {
    id: "3",
    studentId: "2022001",
    studentName: "王五",
    department: "电子工程系",
    status: "pending" as const,
    createdAt: "2023-08-21 14:45"
  },
  {
    id: "4",
    studentId: "2022003",
    studentName: "赵六",
    department: "通信工程系",
    status: "rejected" as const,
    createdAt: "2023-08-22 15:20"
  }
]

// 报名状态映射
const registrationStatusMap = {
  pending: { label: "待审核", color: "secondary" },
  approved: { label: "已通过", color: "success" },
  rejected: { label: "已拒绝", color: "destructive" }
} as const

// 报名表格列定义
const registrationColumns = [
  {
    accessorKey: "studentName",
    header: "学生姓名",
  },
  {
    accessorKey: "studentId",
    header: "学号",
  },
  {
    accessorKey: "department",
    header: "所属院系",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as keyof typeof registrationStatusMap
      const { label, color } = registrationStatusMap[status]
      return <Badge variant={color as any}>{label}</Badge>
    }
  },
  {
    accessorKey: "createdAt",
    header: "报名时间",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as keyof typeof registrationStatusMap
      
      return (
        <div className="flex items-center gap-2">
          {status === "pending" && (
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
    }
  }
]

export function ActivityDetailPage() {
  const [activeTab, setActiveTab] = useState<'detail' | 'registrations'>('detail')
  const navigate = useNavigate()

  // 获取URL参数中的活动ID
  const params = useParams({ from: '/dashboard/activities/$activityId' })
  const activityId = params.activityId

  // 从模拟数据库中获取活动详情
  const activity = mockActivitiesDB[activityId] || mockActivityDetail
  const isArchived = activity.status === "archived"
  
  return (
    <div className="space-y-6">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: '/dashboard/activities' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{activity.title}</h2>
          <Badge variant={activityStatusMap[activity.status].color as any} className="ml-2">
            {activityStatusMap[activity.status].label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {!isArchived && (
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              编辑活动
            </Button>
          )}
          {activity.status === "ended" && (
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              归档活动
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报名表
          </Button>
        </div>
      </div>
      
      {/* 活动统计数据 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总报名人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activity.registrationCount.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
            <Badge variant="success" className="px-2 py-0 text-xs">
              {activity.registrationCount.approved}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              通过率 {Math.round(activity.registrationCount.approved / activity.registrationCount.total * 100)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Badge variant="secondary" className="px-2 py-0 text-xs">
              {activity.registrationCount.pending}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              待处理 {activity.registrationCount.pending} 条
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <Badge variant="destructive" className="px-2 py-0 text-xs">
              {activity.registrationCount.rejected}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              拒绝率 {Math.round(activity.registrationCount.rejected / activity.registrationCount.total * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 选项卡 */}
      <div className="border-b">
        <div className="flex -mb-px">
          <button
            className={cn(
              "py-2 px-4 border-b-2 font-medium text-sm",
              activeTab === 'detail' 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('detail')}
          >
            活动详情
          </button>
          <button
            className={cn(
              "py-2 px-4 border-b-2 font-medium text-sm",
              activeTab === 'registrations' 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('registrations')}
          >
            报名列表
          </button>
        </div>
      </div>
      
      {/* 选项卡内容 */}
      {activeTab === 'detail' ? (
        <div className="space-y-6">
          {/* 活动基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                开始时间
              </div>
              <div>{activity.startTime}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                结束时间
              </div>
              <div>{activity.endTime}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">地点</div>
              <div>{activity.location}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">主办方</div>
              <div>{activity.organizer}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">创建人</div>
              <div>{activity.createdBy}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">创建时间</div>
              <div>{activity.createdAt}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">更新时间</div>
              <div>{activity.updatedAt}</div>
            </div>
          </div>
          
          {/* 活动内容 */}
          <div className="prose max-w-none border rounded-md p-4 bg-card">
            <div dangerouslySetInnerHTML={{ __html: activity.content }} />
          </div>
        </div>
      ) : (
        <div>
          <DataTable 
            columns={registrationColumns} 
            data={mockRegistrations} 
          />
        </div>
      )}
    </div>
  )
} 