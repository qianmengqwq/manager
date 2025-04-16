import type {
  Activity,
} from '@/components/modules/activity/activityType'
import { fetchActivities } from '@/components/modules/activity/ActivityService'
import {
  formatDateTime,
} from '@/components/modules/activity/activityType'
import { cancelActivityApply, getStudentActivities } from '@/components/modules/apply/applyService'
import { fetchActivityImage } from '@/components/modules/image/ImageService'
import { useStudentLoginModal } from '@/components/modules/student/StudentModals'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityStore } from '@/store/activity'
import { useStudentStore } from '@/store/student'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import AutoPlay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Loader2, LogOut, Users, XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

export const Route = createFileRoute('/activities/')({
  component: RouteComponent,
})

// 动画变体
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  hover: {
    y: -8,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

// 内容渐入动画
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 },
  },
}

// 轮播图动画
const carouselVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
}

// 取消按钮动画
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
}

// 封装活动卡片轮播图组件
function ActivityCarousel({ images, activityName }: { images: string[], activityName: string }) {
  // 创建自动播放插件实例，设置5秒切换一次
  const autoplayOptions = {
    delay: 5000,
    stopOnInteraction: false,
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [AutoPlay(autoplayOptions)])

  // 阻止点击事件冒泡并切换到上一张
  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (emblaApi)
      emblaApi.scrollPrev()
  }

  // 阻止点击事件冒泡并切换到下一张
  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (emblaApi)
      emblaApi.scrollNext()
  }

  return (
    <div className="w-full h-48 bg-muted/30 overflow-hidden relative">
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, index) => (
            <div className="h-full w-full flex-[0_0_100%] min-w-0" key={index}>
              <div className="h-full w-full flex items-center justify-center overflow-hidden">
                {src ? (
                  <img
                    src={src}
                    alt={`${activityName} 图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-70 hover:opacity-100 rounded-full bg-white/70"
            onClick={handlePrevClick}
          >
            <span className="sr-only">Previous</span>
            <span aria-hidden>‹</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-70 hover:opacity-100 rounded-full bg-white/70"
            onClick={handleNextClick}
          >
            <span className="sr-only">Next</span>
            <span aria-hidden>›</span>
          </Button>
        </>
      )}
    </div>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const showLoginModal = useStudentLoginModal()
  const { isLoggedIn, student, clearStudent } = useStudentStore()
  const { clearActivities } = useActivityStore()

  function handleCardClick(e: React.MouseEvent, activity: Activity) {
    e.stopPropagation()

    // 检查是否已登录，未登录则显示登录弹窗
    if (!isLoggedIn) {
      e.preventDefault()
      showLoginModal()
      return
    }

    navigate({ to: `/activities/${activity.activityid}` })
  }
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // 获取全部活动数据
  const { data: allActivitiesData, error, isLoading } = useSWR(
    'fetchAllActivities',
    () => fetchActivities(1, 100),
    {
      revalidateOnFocus: false,
    },
  )

  // 分页活动数据
  const [paginatedActivities, setPaginatedActivities] = useState<Activity[]>([])

  // 处理图片预加载
  const [activityImages, setActivityImages] = useState<Record<string, string>>({})

  // 获取学生已报名的活动
  const [appliedActivityIds, setAppliedActivityIds] = useState<number[]>([])
  const [isActionLoading, setIsActionLoading] = useState<Record<number, boolean>>({})

  // 获取学生已报名的活动
  useEffect(() => {
    const getAppliedActivities = async () => {
      if (isLoggedIn && student) {
        try {
          const activities = await getStudentActivities(student.studentNumber)
          const ids = activities.map(activity => activity.activityid)
          setAppliedActivityIds(ids)
        }
        catch (error) {
          console.error('获取学生报名活动失败:', error)
        }
      }
      else {
        // 未登录时清空已报名活动列表
        setAppliedActivityIds([])
      }
    }

    getAppliedActivities()
  }, [isLoggedIn, student])

  // 检查活动是否已报名
  const isActivityApplied = (activityId: number) => {
    return appliedActivityIds.includes(activityId)
  }

  // 处理取消报名
  const handleCancelApply = async (e: React.MouseEvent, activityId: number) => {
    e.stopPropagation()

    if (!isLoggedIn || !student) {
      return
    }

    try {
      setIsActionLoading(prev => ({ ...prev, [activityId]: true }))
      await cancelActivityApply(student.studentNumber, activityId)
      setAppliedActivityIds(prev => prev.filter(id => id !== activityId))
      toast.success('已取消报名')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '取消报名失败')
    }
    finally {
      setIsActionLoading(prev => ({ ...prev, [activityId]: false }))
    }
  }

  // 初始化分页数据
  useEffect(() => {
    if (allActivitiesData?.data) {
      setTotalPages(Math.ceil(allActivitiesData.data.length / pageSize))

      // 应用分页逻辑
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      setPaginatedActivities(allActivitiesData.data.slice(startIndex, endIndex))
    }
  }, [allActivitiesData, page, pageSize])

  // 预加载图片
  useEffect(() => {
    const loadImages = async () => {
      if (!paginatedActivities?.length)
        return

      const newImages: Record<string, string> = {}

      for (const activity of paginatedActivities) {
        if (activity.piclist && activity.piclist.length > 0) {
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
        }
      }

      setActivityImages(prev => ({ ...prev, ...newImages }))
    }

    loadImages()
  }, [paginatedActivities])

  // 处理页面变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // 处理登出
  const handleLogout = () => {
    clearStudent()
    clearActivities()
    toast.success('已退出登录')
  }

  // 获取活动的图片URL数组
  const getActivityImageUrls = (activity: Activity) => {
    if (!activity.piclist || activity.piclist.length === 0) {
      return []
    }

    return activity.piclist
      .map(pic => activityImages[pic] || '')
      .filter(url => url) // 过滤掉空URL
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">活动列表</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-32 w-full mt-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">活动列表</h1>
        <Card className="p-6 bg-red-50">
          <p className="text-red-600">
            加载活动数据失败:
            {error.message}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">活动列表</h1>
          <p className="text-muted-foreground mt-1">
            浏览所有可报名参加的活动
          </p>
        </div>

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

      {/* 活动卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedActivities.map((activity, index) => (
          <motion.div
            key={activity.activityid}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.05 }}
            onClick={e => handleCardClick(e, activity)}
            className="cursor-pointer h-full rounded-lg overflow-hidden"
          >
            <Card className="overflow-hidden h-full rounded-lg border-muted/20 bg-card/50">
              <div className="relative">
                {/* 图片轮播区域 - 使用封装的ActivityCarousel组件 */}
                <motion.div variants={carouselVariants}>
                  <ActivityCarousel
                    images={getActivityImageUrls(activity)}
                    activityName={activity.activityname}
                  />
                </motion.div>

                {/* 已报名标签 */}
                {isActivityApplied(activity.activityid) && (
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 text-xs px-2 py-1 bg-primary/90 text-primary-foreground font-medium z-20"
                  >
                    已报名
                  </Badge>
                )}

                {/* 活动信息部分 */}
                <motion.div variants={contentVariants} className="p-4">
                  <CardHeader className="p-0 mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl font-bold line-clamp-1">
                        {activity.activityname}
                      </CardTitle>

                      {/* 取消报名按钮 - 仅对已报名活动显示 */}
                      {isActivityApplied(activity.activityid) && (
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={e => handleCancelApply(e, activity.activityid)}
                          className="mt-1"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={isActionLoading[activity.activityid]}
                          >
                            {isActionLoading[activity.activityid] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XIcon className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    <CardDescription className="mt-1.5 text-sm text-muted-foreground">
                      主讲人:
                      {' '}
                      {activity.speaker}
                      {' '}
                      | 学院:
                      {' '}
                      {activity.college}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 space-y-3">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        <span className="font-medium mr-1">报名时间:</span>
                        <span>{formatDateTime(activity.signtime)}</span>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-3.5 w-3.5" />
                        <span className="font-medium mr-1">举办时间:</span>
                        <span>{formatDateTime(activity.holdtime)}</span>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-3.5 w-3.5" />
                        <span className="font-medium mr-1">参与人数:</span>
                        <span>
                          {activity.totalnumber}
                          人
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, () => {
              // 显示最多5个页码按钮，当前页居中
              let pageNumbers = []
              if (totalPages <= 5) {
                // 如果总页数小于等于5，显示所有页码
                pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
              }
              else {
                // 如果总页数大于5，显示当前页附近的页码
                let startPage = Math.max(1, page - 2)
                const endPage = Math.min(totalPages, startPage + 4)

                // 调整startPage，确保始终显示5个页码
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4)
                }

                pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
              }

              return pageNumbers.map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))
            })}

            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
