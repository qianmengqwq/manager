import type { College } from '../collegeType'
import type { Major } from './majorType'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { mutate } from 'swr'
import { z } from 'zod'
import { addMajor, deleteMajor } from './MajorService'

// 表单验证Schema
const majorFormSchema = z.object({
  majorname: z.string().min(1, '专业名称不能为空'),
  collegeid: z.string().min(1, '请选择所属学院'),
})

type MajorFormValues = z.infer<typeof majorFormSchema>

// 添加专业模态框
export function useAddMajorModal(collegeList: College[]) {
  const { present } = useModalStack()

  return useCallback((preSelectedCollegeId?: number) => {
    present({
      title: '添加专业',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        // 初始化表单
        const form = useForm<MajorFormValues>({
          resolver: zodResolver(majorFormSchema),
          defaultValues: {
            majorname: '',
            collegeid: preSelectedCollegeId ? String(preSelectedCollegeId) : '',
          },
        })

        // 提交表单
        const onSubmit = async (data: MajorFormValues) => {
          setIsSubmitting(true)
          try {
            const collegeid = Number.parseInt(data.collegeid)
            // 获取选中学院的名称
            const selectedCollege = collegeList.find(college => college.collegeid === collegeid)
            if (!selectedCollege) {
              toast.error('无法获取所选学院信息')
              return
            }

            await addMajor({
              majorname: data.majorname,
              collegeid,
              collegename: selectedCollege.collegename,
            })
            toast.success('专业添加成功')
            props.dismiss()
            // 刷新数据
            mutate('majors')
            mutate('colleges')
          }
          catch (error) {
            console.error({ majorFormError: error })
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
                name="majorname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>专业名称</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入专业名称"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collegeid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属学院</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择所属学院" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collegeList.map(college => (
                          <SelectItem
                            key={college.collegeid}
                            value={college.collegeid.toString()}
                          >
                            {college.collegename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
  }, [present, collegeList])
}

// 删除确认模态框 - 专业
export function useDeleteMajorModal() {
  const { present } = useModalStack()

  return useCallback((major: Major) => {
    present({
      title: '删除专业',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const handleDelete = async () => {
          setIsSubmitting(true)
          try {
            await deleteMajor(major.majorid)
            toast.success('专业删除成功')
            props.dismiss()
            // 刷新数据
            mutate('majors')
            mutate('colleges')
          }
          catch (error) {
            console.error({ deleteMajorError: error })
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
                {major.majorname}
              </span>
              专业吗？此操作不可恢复。
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
