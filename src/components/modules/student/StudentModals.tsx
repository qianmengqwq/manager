import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useActivityStore } from '@/store/activity'
import { useStudentStore } from '@/store/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { fetchActivities } from '../activity/ActivityService'
import { getStudentInfo } from './studentService'

// 表单验证Schema
const studentLoginSchema = z.object({
  studentId: z.string().min(1, '学号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

// 登录表单类型
type StudentLoginFormValues = z.infer<typeof studentLoginSchema>

// 学生登录模态框
export function useStudentLoginModal() {
  const { present } = useModalStack()
  const setStudent = useStudentStore(state => state.setStudent)
  const setActivities = useActivityStore(state => state.setActivities)

  return useCallback(() => {
    present({
      title: '学生登录',
      content: (props) => {
        const [submitting, setSubmitting] = useState(false)
        const form = useForm<StudentLoginFormValues>({
          resolver: zodResolver(studentLoginSchema),
          defaultValues: {
            studentId: '202105403038',
            password: 'Hgq128275%',
          },
        })

        const onSubmit = async (data: StudentLoginFormValues) => {
          try {
            setSubmitting(true)
            // 登录验证
            const studentInfo = await getStudentInfo(data.studentId, data.password)

            // 存储学生信息到zustand
            setStudent(studentInfo)

            // 获取活动列表并存储
            const activitiesResult = await fetchActivities(1, 100)
            setActivities(activitiesResult.data)

            toast.success('登录成功')
            props.dismiss() // 关闭模态框
          }
          catch (error) {
            toast.error(error instanceof Error ? error.message : '登录失败')
          }
          finally {
            setSubmitting(false)
          }
        }

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="studentId"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="请输入密码" {...field} />
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
                      登录中...
                    </>
                  ) : '登录'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present, setStudent, setActivities])
}
