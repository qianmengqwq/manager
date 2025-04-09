import type { UserFromResponse } from '@/types/user'
import type { SubmitHandler } from 'react-hook-form'
import type { UserFormValues } from './userType'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { uploadUserPicture } from './UserService'
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userid: user?.userid ?? null,
      username: user?.username ?? '',
      account: '',
      password: '',
      email: user?.email ?? '',
      level: user?.level ?? 2,
      profilepicture: user?.profilepicture ?? '',
      ...initialValues,
    },
  })

  // 加载现有头像（如果有）
  useEffect(() => {
    // 添加调试日志
    console.log('UserForm 组件接收到的用户数据:', user)

    if (user?.profilepicture) {
      console.log('检测到 profilepicture:', user.profilepicture)

      const fetchAvatar = async () => {
        try {
          console.log('开始请求头像:', `/api/user/getuserpic?key=${user.profilepicture}`)
          const response = await fetch(`/api/user/getuserpic?key=${user.profilepicture}`)

          if (!response.ok) {
            throw new Error('获取头像失败')
          }

          const data = await response.json()
          console.log('获取头像响应:', data)

          if (data.code !== 1000) {
            throw new Error('获取头像失败')
          }

          const imageData = data.result
          const pictureUrl = `data:image/jpeg;base64,${imageData}`
          console.log('设置头像URL完成')
          setPreviewUrl(pictureUrl)
        }
        catch (error) {
          console.error('获取头像失败:', error)
        }
      }

      fetchAvatar()
    }
  }, [user?.profilepicture])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 如果用户已存在（编辑模式），则上传图片
    if (user?.userid) {
      setUploadingImage(true)
      try {
        const result = await uploadUserPicture(user.userid, file)
        console.log('图片上传结果:', result)

        // 处理返回的用户信息
        if (result?.code === 1000 && result.result) {
          console.log('上传成功，返回的用户信息:', result.result)

          // 更新表单中的 profilepicture 字段，从返回的用户信息中获取
          if (result.result.profilepicture) {
            form.setValue('profilepicture', result.result.profilepicture)

            // 加载并显示新上传的头像
            try {
              const response = await fetch(`/api/user/getuserpic?key=${result.result.profilepicture}`)

              if (!response.ok) {
                throw new Error('获取头像失败')
              }

              const imageData = await response.json()

              if (imageData.code === 1000 && imageData.result) {
                const pictureUrl = `data:image/jpeg;base64,${imageData.result}`
                setPreviewUrl(pictureUrl)
                console.log('获取新头像成功')
              }
            }
            catch (error) {
              console.error('获取新上传头像错误:', error)
            }
          }

          toast.success('头像上传成功')
        }
      }
      catch (error) {
        console.error('上传头像错误:', error)
        if (error instanceof Error) {
          toast.error(error.message)
        }
        else {
          toast.error('上传头像失败')
        }
      }
      finally {
        setUploadingImage(false)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit: SubmitHandler<UserFormValues> = (values) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        {/* 头像上传区域 */}
        <div className="flex flex-col items-center space-y-3 mb-3">
          <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
            <AvatarImage src={previewUrl || undefined} alt="用户头像" />
            <AvatarFallback className="text-2xl font-semibold">
              {user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadingImage || !user?.userid}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={uploadingImage || !user?.userid}
          >
            {uploadingImage ? '上传中...' : '选择头像'}
          </Button>

          {!user?.userid && (
            <p className="text-xs text-muted-foreground">
              请先保存用户信息后再上传头像
            </p>
          )}
        </div>

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
                <Input type="password" placeholder="请输入密码" {...field} />
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
          <Button type="submit" disabled={isSubmitting || uploadingImage}>
            {isSubmitting ? '处理中...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
