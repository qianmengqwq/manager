import { fetchActivities } from '@/components/modules/activity/ActivityService'
import { formatDateTime, getStatusColor, getStatusText } from '@/components/modules/activity/activityType'
import { useApplyActivityModal } from '@/components/modules/apply/ApplyModals'
import { cancelActivityApply, getStudentActivities } from '@/components/modules/apply/applyService'
import { fetchActivityImage } from '@/components/modules/image/ImageService'
import { useStudentLoginModal } from '@/components/modules/student/StudentModals'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityStore } from '@/store/activity'
import { useStudentStore } from '@/store/student'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'
import 'github-markdown-css/github-markdown.css'

export const Route = createFileRoute('/activities/$activityId')({
  component: ActivityDetail,
})

// 活动详情骨架屏组件
function ActivityDetailSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-60 w-full mt-6" />
      </div>
    </Card>
  )
}

function ActivityDetail() {
  const { activityId } = Route.useParams()
  const showLoginModal = useStudentLoginModal()
  const showApplyModal = useApplyActivityModal()
  const { isLoggedIn, student, clearStudent } = useStudentStore()
  const { clearActivities } = useActivityStore()
  const [activityImages, setActivityImages] = useState<Record<string, string>>({})
  const [isApplied, setIsApplied] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // 获取活动数据
  const { data: activitiesData, error, isLoading } = useSWR(
    'fetchAllActivities',
    () => fetchActivities(1, 100),
    {
      revalidateOnFocus: false,
    },
  )

  // 从列表中筛选当前活动
  const activity = activitiesData?.data?.find(
    act => act.activityid === Number(activityId),
  )

  // 阻止轮播图控制按钮的点击事件冒泡
  const handleCarouselControlClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // 预加载图片
  useEffect(() => {
    const loadImages = async () => {
      if (!activity?.piclist?.length)
        return

      const newImages: Record<string, string> = {}

      for (const pic of activity.piclist) {
        if (!activityImages[pic]) {
          try {
            const imageUrl = await fetchActivityImage(pic)
            newImages[pic] = imageUrl
          }
          catch (error) {
            console.error('加载图片失败:', error)
          }
        }
      }

      setActivityImages(prev => ({ ...prev, ...newImages }))
    }

    loadImages()
  }, [activity])

  // 检查学生是否已报名该活动
  useEffect(() => {
    const checkApplyStatus = async () => {
      if (isLoggedIn && student && activity) {
        try {
          const appliedActivities = await getStudentActivities(student.studentNumber)
          const hasApplied = appliedActivities.some(act => act.activityid === activity.activityid)
          setIsApplied(hasApplied)
        }
        catch (error) {
          console.error('检查报名状态失败:', error)
        }
      }
    }

    checkApplyStatus()
  }, [isLoggedIn, student, activity])

  // 处理报名按钮点击
  const handleApply = () => {
    if (!isLoggedIn) {
      showLoginModal()
      return
    }

    if (activity) {
      showApplyModal(activity)
    }
  }

  // 处理取消报名
  const handleCancelApply = async () => {
    if (!isLoggedIn || !student || !activity) {
      return
    }

    try {
      setIsActionLoading(true)
      await cancelActivityApply(student.studentNumber, activity.activityid)
      setIsApplied(false)
      toast.success('已取消报名')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '取消报名失败')
    }
    finally {
      setIsActionLoading(false)
    }
  }

  // 处理登出
  const handleLogout = () => {
    clearStudent()
    clearActivities()
    toast.success('已退出登录')
  }

  // 如果找不到活动，显示加载或错误状态
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link to="/activities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回活动列表
            </Link>
          </Button>
        </div>
        <ActivityDetailSkeleton />
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link to="/activities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回活动列表
            </Link>
          </Button>
        </div>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          活动加载失败或不存在
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" asChild>
          <Link to="/activities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回活动列表
          </Link>
        </Button>

        {!isLoggedIn ? (
          <Button onClick={showLoginModal}>学生登录</Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="bg-muted p-2 rounded-md">
              <span className="font-medium">已登录: </span>
              <span>
                {student?.name}
                {' '}
                (
                {student?.studentNumber}
                )
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} title="退出登录">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* 活动头部信息 */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{activity.activityname}</h1>
                <p className="text-gray-600">
                  主讲人:
                  {' '}
                  {activity.speaker}
                  {' '}
                  | 学院:
                  {' '}
                  {activity.college}
                </p>
              </div>
              <Badge variant={getStatusColor(activity.status)} className="text-sm px-3 py-1">
                {getStatusText(activity.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="font-medium w-24">报名时间:</span>
                  <span>{formatDateTime(activity.signtime)}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">举办时间:</span>
                  <span>{formatDateTime(activity.holdtime)}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">保存时间:</span>
                  <span>{formatDateTime(activity.savetime)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="font-medium w-24">发布时间:</span>
                  <span>{formatDateTime(activity.releasetime)}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">参与人数:</span>
                  <span>
                    {activity.totalnumber}
                    人
                  </span>
                </div>
              </div>
            </div>

            {/* 图片轮播 */}
            {activity.piclist && activity.piclist.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <Carousel opts={{ loop: true }}>
                  <CarouselContent>
                    {activity.piclist.map((pic, index) => (
                      <CarouselItem key={index}>
                        <div className="h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
                          {activityImages[pic] ? (
                            <img
                              src={activityImages[pic]}
                              alt={`${activity.activityname} 图片 ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Skeleton className="w-full h-full" />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" onClick={handleCarouselControlClick} />
                  <CarouselNext className="right-4" onClick={handleCarouselControlClick} />
                </Carousel>
              </div>
            )}

            {/* Markdown 渲染区域 */}
            <div>
              <h2 className="text-xl font-bold mb-4">活动简介</h2>
              <div className="markdown-body rounded-lg border p-6 bg-white dark:bg-slate-950">
                {activity.introduce ? (
                  <ReactMarkdown>{activity.introduce}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500">暂无活动简介</p>
                )}
              </div>
            </div>

            {/* 添加报名/取消报名按钮 */}
            <div className="mt-8">
              {isLoggedIn ? (
                isApplied ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto hover:bg-destructive/10"
                    onClick={handleCancelApply}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : '取消报名'}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={handleApply}
                  >
                    立即报名参加
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={showLoginModal}
                >
                  登录后报名参加
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
