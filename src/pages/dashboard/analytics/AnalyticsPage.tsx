import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ban, Calendar, CheckSquare, FileDown, Users } from 'lucide-react'
import { useState } from 'react'

// 模拟活动数据
const mockActivities = [
  { id: '1', title: '迎新晚会' },
  { id: '2', title: '校园歌手大赛' },
  { id: '3', title: '职业生涯规划讲座' },
  { id: '4', title: '毕业典礼' },
]

export function AnalyticsPage() {
  const [selectedActivity, setSelectedActivity] = useState<string>('1')

  // 模拟统计数据
  const stats = {
    1: {
      total: 120,
      approved: 98,
      rejected: 12,
      pending: 10,
      byDepartment: [
        { name: '计算机科学与技术系', value: 45 },
        { name: '软件工程系', value: 32 },
        { name: '电子工程系', value: 28 },
        { name: '通信工程系', value: 15 },
      ],
    },
    2: {
      total: 85,
      approved: 65,
      rejected: 10,
      pending: 10,
      byDepartment: [
        { name: '计算机科学与技术系', value: 20 },
        { name: '软件工程系', value: 15 },
        { name: '电子工程系', value: 30 },
        { name: '通信工程系', value: 20 },
      ],
    },
    3: {
      total: 200,
      approved: 180,
      rejected: 5,
      pending: 15,
      byDepartment: [
        { name: '计算机科学与技术系', value: 60 },
        { name: '软件工程系', value: 50 },
        { name: '电子工程系', value: 45 },
        { name: '通信工程系', value: 45 },
      ],
    },
    4: {
      total: 300,
      approved: 285,
      rejected: 15,
      pending: 0,
      byDepartment: [
        { name: '计算机科学与技术系', value: 80 },
        { name: '软件工程系', value: 75 },
        { name: '电子工程系', value: 70 },
        { name: '通信工程系', value: 75 },
      ],
    },
  }

  const currentStats = stats[selectedActivity as keyof typeof stats]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">数据分析</h2>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          导出数据
        </Button>
      </div>

      <div className="w-64">
        <Select value={selectedActivity} onValueChange={setSelectedActivity}>
          <SelectTrigger>
            <SelectValue placeholder="选择活动" />
          </SelectTrigger>
          <SelectContent>
            {mockActivities.map(activity => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 数据卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总报名人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              所有报名学生人数
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.approved}</div>
            <p className="text-xs text-muted-foreground">
              通过率
              {' '}
              {Math.round(currentStats.approved / currentStats.total * 100)}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              拒绝率
              {' '}
              {Math.round(currentStats.rejected / currentStats.total * 100)}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              待处理率
              {' '}
              {Math.round(currentStats.pending / currentStats.total * 100)}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 院系分布 */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>院系分布</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            {currentStats.byDepartment.map(dept => (
              <div key={dept.name} className="flex items-center">
                <div className="w-1/3 font-medium truncate pr-2">{dept.name}</div>
                <div className="w-2/3 flex items-center gap-2">
                  <div
                    className="h-2 bg-primary rounded"
                    style={{
                      width: `${Math.round(dept.value / currentStats.total * 100)}%`,
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {dept.value}
                    {' '}
                    (
                    {Math.round(dept.value / currentStats.total * 100)}
                    %)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
