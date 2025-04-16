import type { Activity } from '@/components/modules/activity/activityType'
import type { Student } from '@/types/student'
import type { ApplyRequest } from '@/types/apply'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { applyForActivity } from './applyService'
import { useStudentStore } from '@/store/student'

// 表单验证Schema
const applyFormSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  sex: z.string().min(1, '性别不能为空'),
  studentid: z.string().min(1, '学号不能为空'),
  email: z.string().email('请输入有效的邮箱地址').min(1, '邮箱不能为空'),
  qq: z.string().min(5, 'QQ号码不能少于5位数'),
  telephone: z.string().min(11, '请输入有效的手机号码').max(11, '请输入有效的手机号码'),
  collegename: z.string().min(1, '学院名称不能为空'),
  majorname: z.string().min(1, '专业名称不能为空'),
  clazz: z.string().min(1, '班级不能为空'),
})

// 申请表单类型
type ApplyFormValues = z.infer<typeof applyFormSchema>

// 活动报名模态框
export function useApplyActivityModal() {
  const { present } = useModalStack()
  const student = useStudentStore(state => state.student)

  return useCallback((activity: Activity) => {
    present({
      title: '活动报名',
      content: (props) => {
        const [submitting, setSubmitting] = useState(false)
        
        // 从学生信息中获取初始值
        const defaultValues: Partial<ApplyFormValues> = {
          name: student?.name || '',
          sex: student?.sex || '',
          studentid: student?.studentNumber || '',
          collegename: student?.college || '',
          majorname: student?.major || '',
          clazz: student?.clazz || '',
          email: '',
          qq: '',
          telephone: '',
        }
        
        const form = useForm<ApplyFormValues>({
          resolver: zodResolver(applyFormSchema),
          defaultValues,
        })

        const onSubmit = async (data: ApplyFormValues) => {
          try {
            setSubmitting(true)
            
            // 构建报名请求数据
            const applyData: ApplyRequest = {
              ...data,
              activityid: activity.activityid,
              activityname: activity.activityname,
            }
            
            // 提交报名请求
            await applyForActivity(applyData)
            
            toast.success('活动报名成功')
            props.dismiss() // 关闭模态框
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '报名失败')
          }
          finally {
            setSubmitting(false)
          }
        }

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>性别</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入性别" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学号</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="请输入邮箱" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QQ</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入QQ号码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号码</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入手机号码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="collegename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学院</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学院" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="majorname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>专业</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入专业" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clazz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>班级</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入班级" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  您即将报名参加: <span className="font-medium">{activity.activityname}</span>
                </p>
              </div>

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
                  ) : '提交报名'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present, student])
} 