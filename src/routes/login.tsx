import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCaptcha } from '@/hooks/use-captcha'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { captchaImage, isLoading: isCaptchaLoading, refreshCaptcha } = useCaptcha()
  const [captchaInput, setCaptchaInput] = useState('')
  // 下划线前缀表示此变量虽然定义但在某些地方未直接使用
  const [_activeTab, setActiveTab] = useState('password')
  // 存储验证码图片URL
  const [captchaUrl, setCaptchaUrl] = useState<string | null>(null)

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

  const onLogin = () => {
    setIsLoading(true)
    // 模拟登录请求
    setTimeout(() => {
      setIsLoading(false)
      navigate({ to: '/dashboard' })
    }, 1000)
  }

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

  const onTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <Card className="w-[380px] shadow-lg border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">后台管理系统</CardTitle>
          <CardDescription className="text-center">请登录您的账号以继续访问</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full" onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">账号密码</TabsTrigger>
              <TabsTrigger value="email">邮箱登录</TabsTrigger>
            </TabsList>

            {/* 账号密码登录 */}
            <TabsContent value="password">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="请输入用户名"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captcha">验证码</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      id="captcha"
                      placeholder="请输入验证码"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      className="col-span-2 h-10"
                    />
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
                </div>
              </div>
            </TabsContent>

            {/* 邮箱登录 */}
            <TabsContent value="email">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="请输入邮箱" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-code">验证码</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input id="email-code" placeholder="请输入验证码" className="col-span-2 h-10" />
                    <Button variant="outline" size="default" className="whitespace-nowrap h-10">
                      获取验证码
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-10 font-medium"
            onClick={onLogin}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
