import type { ApiResponse } from '@/types/api'
import type { UserFromResponse, UserZustand } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCaptcha } from '@/hooks/use-captcha'
import { useUserStore } from '@/store/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

// 登录表单验证Schema
const loginFormSchema = z.object({
  account: z.string().min(2, '用户名至少需要2个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  code: z.string().min(4, '验证码不能为空'),
})

// 表单值类型
type LoginFormValues = z.infer<typeof loginFormSchema>

// 邮箱登录表单验证Schema
const emailLoginFormSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().min(4, '验证码不能为空'),
})

// 邮箱登录表单值类型
type EmailLoginFormValues = z.infer<typeof emailLoginFormSchema>

// 登录API请求
async function loginFetcher(url: string, { arg }: { arg: LoginFormValues }) {
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  // 检查是否有响应
  const text = await response.text()

  // 如果响应为空，则抛出错误
  if (!text) {
    throw new Error('服务器返回空响应')
  }

  try {
    // 尝试解析JSON
    const data = JSON.parse(text)

    // 检查响应状态
    if (!response.ok) {
      throw new Error(data.msg || `请求失败: ${response.status}`)
    }

    return data
  }
  catch (e) {
    console.error('JSON解析错误:', e, '原始响应:', text)
    throw new Error('服务器响应格式错误')
  }
}

// 邮箱登录API请求
async function emailLoginFetcher(url: string, { arg }: { arg: EmailLoginFormValues }) {
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  // 检查是否有响应
  const text = await response.text()

  // 如果响应为空，则抛出错误
  if (!text) {
    throw new Error('服务器返回空响应')
  }

  try {
    // 尝试解析JSON
    const data = JSON.parse(text)

    // 检查响应状态
    if (!response.ok) {
      throw new Error(data.msg || `请求失败: ${response.status}`)
    }

    return data
  }
  catch (e) {
    console.error('JSON解析错误:', e, '原始响应:', text)
    throw new Error('服务器响应格式错误')
  }
}

// 发送邮箱验证码API请求
async function sendEmailCodeFetcher(url: string, { arg }: { arg: { email: string } }) {
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  // 检查是否有响应
  const text = await response.text()

  // 如果响应为空，则抛出错误
  if (!text) {
    throw new Error('服务器返回空响应')
  }

  try {
    // 尝试解析JSON
    const data = JSON.parse(text)

    // 检查响应状态
    if (!response.ok) {
      throw new Error(data.msg || `请求失败: ${response.status}`)
    }

    return data
  }
  catch (e) {
    console.error('JSON解析错误:', e, '原始响应:', text)
    throw new Error('服务器响应格式错误')
  }
}

// 处理用户登录成功后的操作
async function handleLoginSuccess(result: ApiResponse<UserFromResponse>, login: (user: UserZustand) => void, navigate: any) {
  // 获取用户头像
  try {
    // 检查profilepicture是否存在
    if (result.result.profilepicture) {
      const response = await fetch(`/api/user/getuserpic?key=${result.result.profilepicture}`)

      if (!response.ok) {
        throw new Error('获取头像失败')
      }

      const imageRes = await response.json()

      if (imageRes.code !== 1000) {
        throw new Error('获取头像失败')
      }

      const imageData = imageRes.result
      console.log('头像数据:', imageData)

      const pictureUrl = `data:image/jpeg;base64,${imageData}`

      // 格式化用户数据，包含picture字段
      const userData = {
        userid: result.result.userid,
        account: result.result.account,
        username: result.result.username,
        email: result.result.email,
        level: result.result.level,
        profilepicture: result.result.profilepicture,
        picture: pictureUrl, // 添加处理后的图片URL
      }

      console.log('用户数据:', userData)

      // 存储用户信息到store
      login(userData as UserZustand)
    }
    else {
      // 如果没有头像，使用默认头像
      const userData = {
        userid: result.result.userid,
        username: result.result.username,
        account: result.result.account,
        email: result.result.email,
        level: result.result.level,
        profilepicture: result.result.profilepicture,
        picture: '', // 默认为空字符串
      }

      // 存储用户信息到store
      login(userData as UserZustand)
    }

    toast.success('登录成功')

    navigate({ to: '/dashboard' })
  }
  catch (error) {
    console.error('获取头像错误:', error)
    // 即使获取头像失败，也允许用户登录
    const userData = {
      userid: result.result.userid,
      username: result.result.username,
      account: result.result.account,
      email: result.result.email,
      level: result.result.level,
      profilepicture: result.result.profilepicture,
      picture: '', // 默认为空字符串
    }

    login(userData as UserZustand)
    toast.success('登录成功，但获取头像失败')
    navigate({ to: '/dashboard' })
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const { captchaImage, isLoading: isCaptchaLoading, refreshCaptcha } = useCaptcha()
  // 存储验证码图片URL
  const [captchaUrl, setCaptchaUrl] = useState<string | null>(null)
  const login = useUserStore(state => state.login)

  // 邮箱验证码倒计时状态
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0)

  // 使用SWR Mutation进行登录请求
  const { trigger, isMutating } = useSWRMutation('/user/logon', loginFetcher)

  // 使用SWR Mutation进行邮箱登录请求
  const { trigger: triggerEmailLogin, isMutating: isEmailLoginMutating } = useSWRMutation('/user/verifyemail', emailLoginFetcher)

  // 使用SWR Mutation发送邮箱验证码
  const { trigger: triggerSendEmailCode, isMutating: isSendingEmailCode } = useSWRMutation('/user/sendemail', sendEmailCodeFetcher)

  // 初始化账号密码登录表单
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      account: 'sayoriqwq',
      password: '203109Qy@',
      code: '',
    },
  })

  // 初始化邮箱登录表单
  const emailForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginFormSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  })

  // 当captchaImage（ArrayBuffer）更新时，转换为Blob URL
  useEffect(() => {
    if (captchaImage) {
      // 清理之前的URL
      if (captchaUrl) {
        URL.revokeObjectURL(captchaUrl)
      }

      try {
        // 将ArrayBuffer转换为Blob
        const blob = new Blob([captchaImage], { type: 'image/png' })
        // 创建可在img标签中使用的URL
        const url = URL.createObjectURL(blob)
        setCaptchaUrl(url)
      }
      catch (error) {
        console.error('创建验证码图片URL失败:', error)
      }
    }

    // 组件卸载时清理URL
    return () => {
      if (captchaUrl) {
        URL.revokeObjectURL(captchaUrl)
      }
    }
  }, [captchaImage])

  // 倒计时效果
  useEffect(() => {
    if (emailCodeCountdown <= 0)
      return

    const timer = setInterval(() => {
      setEmailCodeCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [emailCodeCountdown])

  // 账号密码登录表单提交
  const onSubmit = async (values: LoginFormValues) => {
    try {
      // 打印请求数据，方便调试
      console.log('登录请求数据:', { values })

      const result = await trigger(values) as ApiResponse<UserFromResponse>
      console.log('登录响应:', result)

      if (result && result.code === 1000) {
        await handleLoginSuccess(result, login, navigate)
      }
      else {
        toast.error(result?.msg || '登录失败')
        refreshCaptcha()
      }
    }
    catch (error) {
      console.error('登录错误:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      }
      else {
        toast.error('登录失败')
      }
      refreshCaptcha()
    }
  }

  // 邮箱登录表单提交
  const onEmailSubmit = async (values: EmailLoginFormValues) => {
    try {
      // 打印请求数据，方便调试
      console.log('邮箱登录请求数据:', { values })

      const result = await triggerEmailLogin(values) as ApiResponse<UserFromResponse>
      console.log('邮箱登录响应:', result)

      if (result && result.code === 1000) {
        await handleLoginSuccess(result, login, navigate)
      }
      else {
        toast.error(result?.msg || '登录失败')
      }
    }
    catch (error) {
      console.error('邮箱登录错误:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      }
      else {
        toast.error('登录失败')
      }
    }
  }

  // 获取验证码图片
  const onGetCaptcha = async () => {
    // 先清除当前验证码URL
    if (captchaUrl) {
      URL.revokeObjectURL(captchaUrl)
      setCaptchaUrl(null)
    }

    // 手动请求验证码
    try {
      await refreshCaptcha()
    }
    catch (error) {
      console.error('获取验证码失败:', error)
    }
  }

  // 发送邮箱验证码
  const onSendEmailCode = async () => {
    // 如果正在倒计时，不允许再次发送
    if (emailCodeCountdown > 0)
      return

    // 获取邮箱值并验证
    const email = emailForm.getValues('email')
    const emailResult = await emailForm.trigger('email')
    if (!emailResult || !email) {
      return
    }

    try {
      const result = await triggerSendEmailCode({ email })
      if (result && result.code === 1000) {
        toast.success('验证码已发送至邮箱')
        // 设30秒倒计时
        setEmailCodeCountdown(30)
      }
      else {
        toast.error(result?.msg || '发送验证码失败')
      }
    }
    catch (error) {
      console.error('发送邮箱验证码错误:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      }
      else {
        toast.error('发送验证码失败')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <Card className="w-[380px] shadow-lg border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">后台管理系统</CardTitle>
          <CardDescription className="text-center">请登录您的账号以继续访问</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">账号密码</TabsTrigger>
              <TabsTrigger value="email">邮箱登录</TabsTrigger>
            </TabsList>

            {/* 账号密码登录 */}
            <TabsContent value="password">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入用户名"
                            className="h-10"
                            {...field}
                          />
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
                            type="password"
                            placeholder="请输入密码"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>验证码</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <FormControl className="col-span-2">
                            <Input
                              placeholder="请输入验证码"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <div
                            className="relative border rounded cursor-pointer overflow-hidden flex items-center justify-center group h-10"
                            onClick={onGetCaptcha}
                          >
                            {isCaptchaLoading ? (
                              <div className="flex items-center justify-center w-full h-full">
                                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : captchaUrl ? (
                              <>
                                <img
                                  src={captchaUrl}
                                  alt="验证码"
                                  className="h-10"
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <RefreshCw className="w-4 h-4 text-background" />
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground px-2 text-center">
                                获取验证码
                              </div>
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium mt-2"
                    disabled={isMutating}
                  >
                    {isMutating ? '登录中...' : '登录'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* 邮箱登录 */}
            <TabsContent value="email">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="请输入邮箱"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>验证码</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <FormControl className="col-span-2">
                            <Input
                              placeholder="请输入验证码"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 whitespace-nowrap text-xs px-1"
                            onClick={onSendEmailCode}
                            disabled={isSendingEmailCode || emailCodeCountdown > 0}
                          >
                            {isSendingEmailCode
                              ? '发送中...'
                              : emailCodeCountdown > 0
                                ? `${emailCodeCountdown}秒后重试`
                                : '获取验证码'}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium mt-2"
                    disabled={isEmailLoginMutating}
                  >
                    {isEmailLoginMutating ? '登录中...' : '登录'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
