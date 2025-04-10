import type { College } from './collegeType'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { mutate } from 'swr'
import { z } from 'zod'
import {
  addCollege,
  deleteCollege,
  updateCollege,
} from './CollegeService'

// 表单验证Schema
const collegeFormSchema = z.object({
  collegename: z.string().min(1, '学院名称不能为空'),
})

type CollegeFormValues = z.infer<typeof collegeFormSchema>

// 添加学院模态框
export function useAddCollegeModal() {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '添加学院',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        // 初始化表单
        const form = useForm<CollegeFormValues>({
          resolver: zodResolver(collegeFormSchema),
          defaultValues: {
            collegename: '',
          },
        })

        // 提交表单
        const onSubmit = async (data: CollegeFormValues) => {
          setIsSubmitting(true)
          try {
            await addCollege({
              collegename: data.collegename,
            })
            toast.success('学院添加成功')
            props.dismiss()
            // 刷新数据
            mutate('colleges')
          }
          catch (error) {
            console.error({ collegeFormError: error })
            toast.error(error instanceof Error ? error.message : '操作失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="collegename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学院名称</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入学院名称"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={props.dismiss}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '提交中...' : '确认'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present])
}

// 删除确认模态框 - 学院
export function useDeleteCollegeModal() {
  const { present } = useModalStack()

  return useCallback((college: College) => {
    present({
      title: '删除学院',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const handleDelete = async () => {
          setIsSubmitting(true)
          try {
            await deleteCollege(college.collegeid)
            toast.success('学院删除成功')
            props.dismiss()
            // 刷新数据
            mutate('colleges')
          }
          catch (error) {
            console.error({ deleteCollegeError: error })
            toast.error(error instanceof Error ? error.message : '删除失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <div className="space-y-6">
            <p className="text-center">
              确定要删除
              <span className="font-medium text-destructive mx-1">
                {college.collegename}
              </span>
              学院吗？此操作不可恢复，该学院下的所有专业也将被删除。
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={props.dismiss}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? '删除中...' : '确认删除'}
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present])
}
