import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BarChart2, BookOpen, CalendarDays, School, User, Users } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

// 系统概览数据
const systemOverview = {
  userCount: 120,
  departmentCount: 15,
  collegeCount: 5,
  activityCount: 28,
  registrationCount: 1250,
}

// 最近活动数据
const recentActivities = [
  {
    id: '1',
    title: '迎新晚会',
    status: 'published',
    date: '2023-09-01',
    registrations: 120,
  },
  {
    id: '2',
    title: '校园歌手大赛',
    status: 'draft',
    date: '2023-10-15',
    registrations: 85,
  },
  {
    id: '3',
    title: '职业生涯规划讲座',
    status: 'ended',
    date: '2023-05-20',
    registrations: 200,
  },
]

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统概览</h2>
      </div>

      {/* 数据卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/users' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.userCount}</div>
            <p className="text-xs text-muted-foreground">
              系统用户数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/departments' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学院总数</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.collegeCount}</div>
            <p className="text-xs text-muted-foreground">
              学院数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/departments' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系部总数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.departmentCount}</div>
            <p className="text-xs text-muted-foreground">
              系部数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/activities' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动总数</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.activityCount}</div>
            <p className="text-xs text-muted-foreground">
              所有活动数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/registrations' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">报名总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.registrationCount}</div>
            <p className="text-xs text-muted-foreground">
              所有报名数量
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <h3 className="text-lg font-semibold mt-6">最近活动</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {recentActivities.map(activity => (
          <Card
            key={activity.id}
            className="transition-all hover:shadow-md cursor-pointer"
            onClick={() => navigate({ to: `/dashboard/activities/${activity.id}` })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{activity.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  日期:
                  {activity.date}
                </span>
                <span>
                  报名:
                  {activity.registrations}
                </span>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 数据分析入口 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5" />
            数据分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">查看更详细的报名数据分析和统计图表</p>
          <Button onClick={() => navigate({ to: '/dashboard/analytics' })}>
            前往数据分析
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
