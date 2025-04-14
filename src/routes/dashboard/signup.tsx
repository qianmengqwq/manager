import type { Activity } from '@/components/modules/activity/activityType'
import { useActivityDetailModal } from '@/components/modules/activity/ActivityModals'
import { fetchActivities, fetchActivityAnalysis } from '@/components/modules/signup/SignupService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { createFileRoute, Outlet, useMatches, useNavigate } from '@tanstack/react-router'
import { BarChart, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, Eye, Search, Users } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

function SignupPage() {
  // 检查是否有子路由激活
  const matches = useMatches()
  const isDetailRouteActive = matches.some(
    match => match.routeId.includes('$activityId'),
  )

  // 如果子路由激活，则渲染子路由内容
  if (isDetailRouteActive) {
    return <Outlet />
  }

  // 否则渲染活动列表
  return <SignupList />
}

// 活动列表组件
function SignupList() {
  const [_isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // 使用 nuqs 管理分页状态
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const pageSize = 9 // 每页显示9个活动（3x3网格）

  // 大页面请求一次性获取所有数据
  const fetchPageSize = 100 // 一次获取100条数据

  // 使用活动详情模态框
  const showActivityDetail = useActivityDetailModal()

  // 使用SWR获取活动数据
  const { data: allActivitiesData, isLoading, error } = useSWR(
    ['signup-activities', 1, fetchPageSize, searchTerm],
    async () => {
      // 创建筛选条件对象，根据搜索词选择性添加字段
      const filters: Record<string, any> = {}
      if (searchTerm) {
        filters.activityname = searchTerm
      }

      // 获取所有活动列表
      return await fetchActivities(1, fetchPageSize, filters)
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
      keepPreviousData: true, // 保持之前的数据，避免闪烁
      onError: (error) => {
        console.error({ 获取活动数据失败: error })
        toast.error('获取活动列表失败')
      },
    },
  )

  // 处理加载错误
  if (error) {
    console.error({ 获取活动列表错误: error })
  }

  // 在前端进行分页处理
  const activitiesData = useMemo(() => {
    if (!allActivitiesData)
      return null

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    // 对数据进行分页
    const paginatedData = allActivitiesData.data.slice(startIndex, endIndex)

    // 计算总页数
    const total = allActivitiesData.data.length
    const pageTotal = Math.ceil(total / pageSize)

    return {
      data: paginatedData,
      total,
      pageTotal,
      page,
      pageSize,
    }
  }, [allActivitiesData, page, pageSize])

  // 点击活动卡片跳转到报名详情页
  const onActivityClick = useCallback((activity: Activity) => {
    navigate({ to: `/dashboard/signup/$activityId`, params: { activityId: activity.activityid.toString() } })
  }, [navigate])

  // 搜索词改变时处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 处理搜索提交
  const handleSearchSubmit = useCallback(() => {
    startTransition(() => {
      setPage(1) // 重置到第一页
    })
  }, [setPage])

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString)
      return '-'
    const date = new Date(dateString.replace(/-/g, '/'))
    return date.toLocaleDateString('zh-CN')
  }

  // 计算总页数
  const pageTotal = useMemo(() => {
    return activitiesData?.pageTotal || 1
  }, [activitiesData])

  // 页码改变处理
  const handlePageChange = useCallback((newPage: number) => {
    startTransition(() => {
      setPage(newPage)
    })
  }, [setPage])

  // 获取活动分析数据
  const onGetAnalysis = useCallback((activity: Activity) => {
    navigate({ to: '/dashboard/analytics/$activityId', params: { activityId: activity.activityid.toString() } })
  }, [navigate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">报名管理</h2>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          className="ml-2"
          onClick={handleSearchSubmit}
        >
          搜索
        </Button>
      </div>

      {isLoading && !allActivitiesData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="bg-muted/50 h-24" />
              <CardContent className="pt-4 space-y-2">
                <div className="h-5 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-8 bg-muted rounded w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activitiesData?.data.map((activity: Activity) => (
              <Card
                key={activity.activityid}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onActivityClick(activity)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{activity.activityname}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    主讲人:
                    {activity.speaker}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    报名时间:
                    {' '}
                    {formatDate(activity.signtime)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    活动时间:
                    {' '}
                    {formatDate(activity.holdtime)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    人数限制:
                    {' '}
                    {activity.totalnumber}
                    人
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation() // 阻止事件冒泡，防止触发卡片点击
                      showActivityDetail(activity)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    活动详情
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation() // 阻止事件冒泡，防止触发卡片点击
                      onGetAnalysis(activity)
                    }}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    数据分析
                  </Button>
                  <Button variant="default" className="flex-1">
                    查看报名情况
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* 分页区域 - 始终显示 */}
          {activitiesData && (
            <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8 mt-6">
              <div className="flex-1 whitespace-nowrap text-muted-foreground text-sm">
                共
                {' '}
                {activitiesData.total || 0}
                {' '}
                条记录
              </div>
              <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                <div className="flex items-center justify-center font-medium text-sm">
                  第
                  {' '}
                  {page}
                  {' '}
                  /
                  {' '}
                  {Math.max(1, pageTotal)}
                  {' '}
                  页
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    aria-label="首页"
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1 || activitiesData.total === 0}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="上一页"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1 || activitiesData.total === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* 页码按钮组 */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.max(1, pageTotal)) }).map((_, i) => {
                      // 计算页码范围
                      let pageNum = 1
                      if (pageTotal <= 5) {
                        // 总页数小于等于5，直接显示1到pageTotal
                        pageNum = i + 1
                      }
                      else if (page <= 3) {
                        // 当前页在前3页，显示1-5
                        pageNum = i + 1
                      }
                      else if (page >= pageTotal - 2) {
                        // 当前页在后3页，显示最后5页
                        pageNum = pageTotal - 4 + i
                      }
                      else {
                        // 其他情况，显示当前页前后2页
                        pageNum = page - 2 + i
                      }

                      // 确保页码不超过总页数
                      pageNum = Math.min(pageNum, pageTotal)

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="hidden sm:inline-flex h-8 w-8"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={activitiesData.total === 0}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    aria-label="下一页"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handlePageChange(Math.min(pageTotal, page + 1))}
                    disabled={page >= pageTotal || activitiesData.total === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="末页"
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() => handlePageChange(pageTotal)}
                    disabled={page >= pageTotal || activitiesData.total === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/signup')({
  component: SignupPage,
})
