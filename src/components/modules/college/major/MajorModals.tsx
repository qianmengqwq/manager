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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { addMajor, updateMajor, deleteMajor } from './MajorService'
import type { College } from '../collegeType'
import type { Major } from './majorType'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 表单验证Schema
const majorFormSchema = z.object({
  majorname: z.string().min(1, '专业名称不能为空'),
  collegeid: z.string().min(1, '请选择所属学院'),
})

type MajorFormValues = z.infer<typeof majorFormSchema>

// 添加/编辑专业模态框
export function useMajorFormModal(
  onSuccess: () => void, 
  colleges: College[],
  editData?: {
    majorid: number
    majorname: string
    collegeid: number
  }
) {
  const { present } = useModalStack()
  const isEdit = Boolean(editData)

  return useCallback(() => {
    present({
      title: isEdit ? '编辑专业' : '添加专业',
      content: () => {
        // 默认值
        const defaultValues: MajorFormValues = {
          majorname: editData?.majorname || '',
          collegeid: editData?.collegeid ? String(editData.collegeid) : '',
        }

        // 初始化表单
        const form = useForm<MajorFormValues>({
          resolver: zodResolver(majorFormSchema),
          defaultValues,
        })

        // 提交表单
        const onSubmit = async (data: MajorFormValues) => {
          try {
            const collegeid = parseInt(data.collegeid)
            
            if (isEdit && editData) {
              await updateMajor({
                majorid: editData.majorid,
                majorname: data.majorname,
                collegeid,
              })
              toast.success('专业更新成功')
            } else {
              await addMajor({
                majorname: data.majorname,
                collegeid,
              })
              toast.success('专业添加成功')
            }
            onSuccess()
          } catch (error) {
            console.error({ majorFormError: error })
            toast.error(error instanceof Error ? error.message : '操作失败')
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择所属学院" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colleges.map((college) => (
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
  }, [present, isEdit, editData, colleges, onSuccess])
}

// 删除确认模态框 - 专业
export function useDeleteMajorModal(
  majorId: number,
  majorName: string,
  onSuccess: () => void
) {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '删除专业',
      content: () => {
        const handleDelete = async () => {
          try {
            await deleteMajor(majorId)
            toast.success('专业删除成功')
            onSuccess()
          } catch (error) {
            console.error({ deleteMajorError: error })
            toast.error(error instanceof Error ? error.message : '删除失败')
          }
        }

        return (
          <div className="space-y-6">
            <p className="text-center">
              确定要删除
              <span className="font-medium text-destructive mx-1">
                {majorName}
              </span>
              专业吗？此操作不可恢复。
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
  }, [present, majorId, majorName, onSuccess])
} 