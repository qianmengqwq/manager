import type { Activity, CreateActivityRequest, UpdateActivityRequest } from './activityType'
import { MilkdownPreview } from '@/components/milkdown'
import { MultiImageUpload } from '@/components/modules/image'
import { ImageGrid } from '@/components/modules/image/ImagePreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateTimePickerEnhanced } from '@/components/ui/date-time-picker-enhanced'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { archiveActivity, checkActivity, createActivity, deleteActivity, updateActivity } from './ActivityService'
import { formatDateTime, getStatusColor, getStatusText } from './activityType'

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

// 活动详情模态框
export function useActivityDetailModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity) => {
    present({
      title: '活动详情',
      content: (_props) => {
        return (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{activity.activityname}</h3>
              <Badge variant={getStatusColor(activity.status) as any}>
                {getStatusText(activity.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">主讲人</p>
                <p>{activity.speaker}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">所属学院</p>
                <p>{activity.college}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">报名时间</p>
                <p>{formatDateTime(activity.signtime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">举办时间</p>
                <p>{formatDateTime(activity.holdtime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">创建时间</p>
                <p>{formatDateTime(activity.savetime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">发布时间</p>
                <p>{activity.releasetime ? formatDateTime(activity.releasetime) : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">活动ID</p>
                <p>{activity.activityid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">参与人数</p>
                <p>
                  {activity.totalnumber}
                  人
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">活动介绍</p>
              <MilkdownPreview content={activity.introduce || ''} className="bg-muted rounded-md" />
            </div>

            {activity.piclist && activity.piclist.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">活动图片</p>
                <ImageGrid imageKeys={activity.piclist} />
              </div>
            )}
          </div>
        )
      },
    })
  }, [present])
}

// 活动表单模态框（创建）
export function useCreateActivityModal() {
  const { present } = useModalStack()

  return useCallback((onSuccess?: () => void) => {
    present({
      title: '创建活动',
      content: (props) => {
        const [submitting, setSubmitting] = useState(false)
        const form = useForm<ActivityFormValues>({
          resolver: zodResolver(activityFormSchema),
          defaultValues: {
            activityname: '',
            speaker: '',
            college: '',
            signtime: '',
            holdtime: '',
            introduce: '',
            totalnumber: 0,
            piclist: [],
          },
        })

        const onSubmit = async (data: ActivityFormValues) => {
          try {
            setSubmitting(true)
            // 转换日期格式
            const formattedData: CreateActivityRequest = {
              ...data,
              signtime: formatDateForApi(data.signtime),
              holdtime: formatDateForApi(data.holdtime),
              piclist: data.piclist || null,
            }

            console.log('提交的数据:', formattedData)
            await createActivity(formattedData)
            toast.success('活动创建成功')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '创建活动失败')
          }
          finally {
            setSubmitting(false)
          }
        }

        // 处理图片上传完成事件
        const handleImagesUploaded = (piclist: string[]) => {
          form.setValue('piclist', piclist)
        }

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                name="introduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>活动介绍</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入活动介绍"
                        className="min-h-[100px]"
                        {...field}
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={props.dismiss} disabled={submitting}>
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : '提交'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present])
}

// 活动表单模态框（编辑）
export function useEditActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '编辑活动',
      content: (props) => {
        const [submitting, setSubmitting] = useState(false)
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
            console.log('完整的请求数据JSON:', JSON.stringify(formattedData, null, 2))

            await updateActivity(formattedData)
            props.dismiss() // 关闭模态框
            toast.success('活动更新成功')
            onSuccess?.()
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

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                name="introduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>活动介绍</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入活动介绍"
                        className="min-h-[100px]"
                        {...field}
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={props.dismiss} disabled={submitting}>
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : '保存修改'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present])
}

// 活动归档模态框
export function useArchiveActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '归档活动',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const onArchive = async () => {
          try {
            setIsSubmitting(true)
            // 使用专门的归档接口
            await archiveActivity(activity.activityid)
            toast.success('活动已归档')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '归档活动失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-4 py-2">
            <p>您确定要将以下活动归档吗？归档后活动将不能再编辑或删除。</p>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{activity.activityname}</p>
              <p className="text-sm text-muted-foreground">
                主讲人:
                {' '}
                {activity.speaker}
                {' '}
                | 举办时间:
                {' '}
                {formatDateTime(activity.holdtime)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={props.dismiss}>
                取消
              </Button>
              <Button variant="default" onClick={onArchive} disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '确认归档'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 活动删除模态框
export function useDeleteActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '删除活动',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const onDelete = async () => {
          try {
            setIsSubmitting(true)
            await deleteActivity(activity.activityid)
            toast.success('活动已删除')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '删除活动失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-4 py-2">
            <p className="text-destructive font-medium">警告：此操作不可撤销！</p>
            <p>您确定要删除以下活动吗？</p>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{activity.activityname}</p>
              <p className="text-sm text-muted-foreground">
                主讲人:
                {' '}
                {activity.speaker}
                {' '}
                | 举办时间:
                {' '}
                {formatDateTime(activity.holdtime)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={props.dismiss}>
                取消
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '确认删除'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 活动审核模态框 - 通过
export function useApproveActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '审核通过活动',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const onApprove = async () => {
          try {
            setIsSubmitting(true)
            // 使用审核接口，status=2表示审核通过并发布
            await checkActivity(activity.activityid, 2)
            toast.success('活动审核通过并发布')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '活动审核失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-4 py-2">
            <p>您确定要审核通过并发布以下活动吗？</p>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{activity.activityname}</p>
              <p className="text-sm text-muted-foreground">
                主讲人:
                {' '}
                {activity.speaker}
                {' '}
                | 举办时间:
                {' '}
                {formatDateTime(activity.holdtime)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={props.dismiss}>
                取消
              </Button>
              <Button variant="default" onClick={onApprove} disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '确认通过并发布'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 活动审核模态框 - 拒绝
export function useRejectActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '审核拒绝活动',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const onReject = async () => {
          try {
            setIsSubmitting(true)
            // 使用审核接口，status=1表示审核未通过
            await checkActivity(activity.activityid, 1)
            toast.success('已拒绝该活动')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '操作失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-4 py-2">
            <p className="text-destructive font-medium">确定要拒绝此活动吗？</p>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{activity.activityname}</p>
              <p className="text-sm text-muted-foreground">
                主讲人:
                {' '}
                {activity.speaker}
                {' '}
                | 举办时间:
                {' '}
                {formatDateTime(activity.holdtime)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={props.dismiss}>
                取消
              </Button>
              <Button variant="destructive" onClick={onReject} disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '拒绝活动'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}

// 活动撤回模态框
export function useWithdrawActivityModal() {
  const { present } = useModalStack()

  return useCallback((activity: Activity, onSuccess?: () => void) => {
    present({
      title: '撤回活动',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const onWithdraw = async () => {
          try {
            setIsSubmitting(true)
            // 使用审核接口，status=0表示撤回到已保存状态
            await checkActivity(activity.activityid, 0)
            toast.success('活动已撤回')
            props.dismiss() // 关闭模态框
            onSuccess?.()
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '活动撤回失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-4 py-2">
            <p>您确定要撤回以下活动吗？撤回后活动将回到待审核状态。</p>

            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{activity.activityname}</p>
              <p className="text-sm text-muted-foreground">
                主讲人:
                {' '}
                {activity.speaker}
                {' '}
                | 举办时间:
                {' '}
                {formatDateTime(activity.holdtime)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={props.dismiss}>
                取消
              </Button>
              <Button variant="default" onClick={onWithdraw} disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '确认撤回'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}
