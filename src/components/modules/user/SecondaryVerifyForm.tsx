import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// 二级验证表单验证schema
const secondaryVerifySchema = z.object({
  password: z.string().min(1, '请输入密码'),
})

type SecondaryVerifyFormValues = z.infer<typeof secondaryVerifySchema>

interface SecondaryVerifyFormProps {
  onSubmit: (password: string) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function SecondaryVerifyForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SecondaryVerifyFormProps) {
  const form = useForm<SecondaryVerifyFormValues>({
    resolver: zodResolver(secondaryVerifySchema),
    defaultValues: {
      password: '',
    },
  })

  const handleSubmit = async (values: SecondaryVerifyFormValues) => {
    await onSubmit(values.password)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <p className="text-sm text-muted-foreground mb-4">
          该操作需要进行二级验证，请输入您的密码。
        </p>
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="请输入密码" 
                  autoComplete="current-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '验证中...' : '验证'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 