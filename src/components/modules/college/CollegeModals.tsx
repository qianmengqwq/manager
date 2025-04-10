import { useModalStack } from 'rc-modal-sheet'
import { useCallback } from 'react'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  addCollege, 
  updateCollege,
  deleteCollege,
} from './CollegeService'
import type { College } from './collegeType'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 表单验证Schema
const collegeFormSchema = z.object({
  collegename: z.string().min(1, '学院名称不能为空'),
})

type CollegeFormValues = z.infer<typeof collegeFormSchema>

// 添加/编辑学院模态框
export function useCollegeFormModal(
  onSuccess: () => void, 
  editData?: College
) {
  const { present } = useModalStack()
  const isEdit = Boolean(editData)

  return useCallback(() => {
    present({
      title: isEdit ? '编辑学院' : '添加学院',
      content: () => {
        // 默认值
        const defaultValues: CollegeFormValues = {
          collegename: editData?.collegename || '',
        }

        // 初始化表单
        const form = useForm<CollegeFormValues>({
          resolver: zodResolver(collegeFormSchema),
          defaultValues,
        })

        // 提交表单
        const onSubmit = async (data: CollegeFormValues) => {
          try {
            if (isEdit && editData) {
              await updateCollege({
                collegeid: editData.collegeid,
                collegename: data.collegename,
              })
              toast.success('学院更新成功')
            } else {
              await addCollege({
                collegename: data.collegename,
              })
              toast.success('学院添加成功')
            }
            onSuccess()
          } catch (error) {
            console.error({ collegeFormError: error })
            toast.error(error instanceof Error ? error.message : '操作失败')
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
                  onClick={() => form.reset()}
                >
                  重置
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? '提交中...' : '确认'}
                </Button>
              </div>
            </form>
          </Form>
        )
      },
    })
  }, [present, isEdit, editData, onSuccess])
}

// 删除确认模态框 - 学院
export function useDeleteCollegeModal(
  collegeId: number,
  collegeName: string,
  onSuccess: () => void
) {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '删除学院',
      content: () => {
        const handleDelete = async () => {
          try {
            await deleteCollege(collegeId)
            toast.success('学院删除成功')
            onSuccess()
          } catch (error) {
            console.error({ deleteCollegeError: error })
            toast.error(error instanceof Error ? error.message : '删除失败')
          }
        }

        return (
          <div className="space-y-6">
            <p className="text-center">
              确定要删除
              <span className="font-medium text-destructive mx-1">
                {collegeName}
              </span>
              学院吗？此操作不可恢复，该学院下的所有专业也将被删除。
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => window.rcModalSheet.dismiss()}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                确认删除
              </Button>
            </div>
          </div>
        )
      },
    })
  }, [present, collegeId, collegeName, onSuccess])
} 