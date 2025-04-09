import type { UserFromResponse } from '@/types/user'
import type { SubmitHandler } from 'react-hook-form'
import type { UserFormValues } from './userType'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { USER_ROLE_OPTIONS, userFormSchema } from './userType'

interface UserFormProps {
  initialValues?: Partial<UserFormValues>
  user?: UserFromResponse
  onSubmit: (values: UserFormValues) => Promise<void>
  onCancel: () => void
  submitText?: string
  isSubmitting?: boolean
}

export function UserForm({
  initialValues,
  user,
  onSubmit,
  onCancel,
  submitText = '保存',
  isSubmitting = false,
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userid: user?.userid ?? undefined,
      username: user?.username ?? '',
      account: user?.account ?? '',
      password: user?.password ?? '',
      email: user?.email ?? '',
      level: user?.level ?? 2,
      profilepicture: user?.profilepicture,
      ...initialValues,
    },
  })

  const handleSubmit: SubmitHandler<UserFormValues> = async (values) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem>
              <FormLabel>账号</FormLabel>
              <FormControl>
                <Input placeholder="请输入账号" {...field} />
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
                <Input
                  placeholder="请输入密码"
                  {...field}
                />
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

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>角色</FormLabel>
              <Select
                onValueChange={value => field.onChange(Number.parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择角色" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '处理中...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
