import { Button } from '@/components/ui/button'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const onLogin = () => {
    setIsLoading(true)
    // 模拟登录请求
    setTimeout(() => {
      setIsLoading(false)
      navigate({ to: '/dashboard' })
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-xl">后台管理系统</CardTitle>
          <CardDescription>请登录您的账号以继续访问</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">账号密码</TabsTrigger>
              <TabsTrigger value="email">邮箱登录</TabsTrigger>
            </TabsList>

            {/* 账号密码登录 */}
            <TabsContent value="password">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input id="username" placeholder="请输入用户名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" type="password" placeholder="请输入密码" />
                </div>
              </div>
            </TabsContent>

            {/* 邮箱登录 */}
            <TabsContent value="email">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="请输入邮箱" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-code">验证码</Label>
                  <div className="flex gap-2">
                    <Input id="email-code" placeholder="请输入验证码" />
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      获取验证码
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onLogin} disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
