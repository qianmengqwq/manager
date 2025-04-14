import type { Activity } from '@/components/modules/activity/activityType'
import { fetchColleges } from '@/components/modules/college'
import { fetchActivities, fetchActivitySignups } from '@/components/modules/signup/SignupService'
import { fetchUserDetail } from '@/components/modules/user/UserService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BarChart2, BookOpen, CalendarDays, School, User, Users } from 'lucide-react'
import useSWR from 'swr'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

// 系统概览数据
function useSystemOverview() {
  const { data: colleges } = useSWR('colleges', () => fetchColleges())
  const { data: activities } = useSWR('activities', () => fetchActivities(1, 100))
  const { data: signups } = useSWR('signups', () => fetchActivitySignups({ page: 1, PageSize: 100 }))

  return {
    collegeCount: colleges?.total || 0,
    activityCount: activities?.total || 0,
    registrationCount: signups?.total || 0,
  }
}

// 最近活动数据
function useRecentActivities() {
  const { data: activities } = useSWR('recent-activities', () => fetchActivities(1, 3))

  return activities?.data || []
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { collegeCount, activityCount, registrationCount } = useSystemOverview()
  const recentActivities = useRecentActivities()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统概览</h2>
      </div>

      {/* 数据卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/college' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学院总数</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collegeCount}</div>
            <p className="text-xs text-muted-foreground">
              学院数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/activities' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动总数</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCount}</div>
            <p className="text-xs text-muted-foreground">
              所有活动数量
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate({ to: '/dashboard/signup' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">报名总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationCount}</div>
            <p className="text-xs text-muted-foreground">
              所有报名数量
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <h3 className="text-lg font-semibold mt-6">最近活动</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {recentActivities.map((activity: Activity) => (
          <Card
            key={activity.activityid}
            className="transition-all hover:shadow-md cursor-pointer"
            onClick={() => navigate({ to: `/dashboard/activities/${activity.activityid}` })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{activity.activityname}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  日期:
                  {activity.holdtime}
                </span>
                <span>
                  报名:
                  {activity.totalnumber || 0}
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
          <Button onClick={() => navigate({ to: '/dashboard/signup' })}>
            前往报名数据分析
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
