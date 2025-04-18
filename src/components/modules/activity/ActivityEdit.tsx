import type { Activity, UpdateActivityRequest } from './activityType'
import { useMarkdownPreviewModal } from '@/components/milkdown'
import { MilkdownWrapper } from '@/components/milkdown/MilkdownWrapper'
import { MultiImageUpload } from '@/components/modules/image'
import { Button } from '@/components/ui/button'
import { DateTimePickerEnhanced } from '@/components/ui/date-time-picker-enhanced'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, ChevronUp, Eye, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { updateActivity } from './ActivityService'

// 表单验证Schema
const activityFormSchema = z.object({
  activityname: z.string().min(1, '活动名称不能为空'),
  speaker: z.string().min(1, '主讲人不能为空'),
  college: z.string().min(1, '学院不能为空'),
  signtime: z.string().min(1, '报名时间不能为空'),
  holdtime: z.string().min(1, '举办时间不能为空'),
  introduce: z.string().min(1, '活动介绍不能为空'),
  totalnumber: z.number().min(1, '活动人数必须大于0'),
  piclist: z.array(z.string()).optional(),
})

// 创建表单类型
type ActivityFormValues = z.infer<typeof activityFormSchema>

// 将ISO日期格式转换为 YYYY-MM-DD HH:MM:SS 格式
function formatDateForApi(isoDateString: string): string {
  if (!isoDateString)
    return ''
  const formattedDate = format(new Date(isoDateString), 'yyyy-MM-dd HH:mm:ss')
  console.log('原始日期字符串:', isoDateString, '转换后:', formattedDate)
  return formattedDate
}

interface ActivityEditProps {
  activity: Activity
  onSuccess?: () => void
}

export function ActivityEdit({ activity, onSuccess }: ActivityEditProps) {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false) // 添加折叠状态
  const showMarkdownPreview = useMarkdownPreviewModal()

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      activityname: activity.activityname,
      speaker: activity.speaker,
      college: activity.college,
      signtime: activity.signtime ? activity.signtime.split('.')[0] : '',
      holdtime: activity.holdtime ? activity.holdtime.split('.')[0] : '',
      introduce: activity.introduce || '',
      totalnumber: activity.totalnumber,
      piclist: activity.piclist || [],
    },
  })

  const onSubmit = async (data: ActivityFormValues) => {
    try {
      setSubmitting(true)
      // 转换日期格式
      const formattedData: UpdateActivityRequest = {
        activityid: activity.activityid,
        activityname: data.activityname,
        speaker: data.speaker,
        college: data.college,
        signtime: formatDateForApi(data.signtime),
        holdtime: formatDateForApi(data.holdtime),
        introduce: data.introduce,
        totalnumber: data.totalnumber,
        piclist: data.piclist || null,
      }

      console.log('提交的表单数据:', data)
      console.log('图片列表:', data.piclist)
      console.log('处理后的数据:', formattedData)

      await updateActivity(formattedData)
      toast.success('活动更新成功')
      onSuccess?.()
      // 更新成功后跳转回活动列表
      navigate({ to: '/dashboard/activities' })
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '更新活动失败')
    }
    finally {
      setSubmitting(false)
    }
  }

  // 处理图片上传完成事件
  const handleImagesUploaded = (piclist: string[]) => {
    form.setValue('piclist', piclist)
  }

  // 显示Markdown预览
  const handlePreview = () => {
    const introduceValue = form.getValues('introduce')
    showMarkdownPreview(introduceValue, '活动介绍预览')
  }

  return (
    <div className="space-y-6">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: '/dashboard/activities' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">编辑活动</h2>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard/activities' })}
          >
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            预览
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* 详细信息 - 可折叠区域 */}
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <button
              type="button"
              className="flex w-full justify-between p-4 text-left hover:bg-muted/10 transition-colors"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            >
              <span className="font-medium">活动详细信息</span>
              <div className="bg-muted/20 p-1 rounded-full">
                {isDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {isDetailsOpen && (
              <div className="p-4 pt-6 space-y-4 border-t">
                <FormField
                  control={form.control}
                  name="activityname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活动名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入活动名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="speaker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>主讲人</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入主讲人" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="college"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属学院</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入所属学院" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报名时间</FormLabel>
                        <FormControl>
                          <DateTimePickerEnhanced
                            date={field.value ? new Date(field.value) : undefined}
                            setDate={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd\'T\'HH:mm') : '')
                            }}
                            placeholder="选择报名时间"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="holdtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>举办时间</FormLabel>
                        <FormControl>
                          <DateTimePickerEnhanced
                            date={field.value ? new Date(field.value) : undefined}
                            setDate={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd\'T\'HH:mm') : '')
                            }}
                            placeholder="选择举办时间"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalnumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参与人数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="请输入参与人数"
                          {...field}
                          onChange={e => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="piclist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活动图片</FormLabel>
                      <FormControl>
                        <MultiImageUpload
                          existingImages={field.value || []}
                          onImagesUploaded={handleImagesUploaded}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* 活动介绍 - 单独区域（无边框） */}
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="text-lg font-medium">活动介绍</h3>
              <p className="text-sm text-muted-foreground mt-1">使用富文本编辑器完善您的活动介绍信息</p>
            </div>
            <FormField
              control={form.control}
              name="introduce"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MilkdownWrapper
                      initialValue={field.value}
                      onChange={field.onChange}
                      placeholder="请输入活动介绍（支持Markdown格式）"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  )
}
