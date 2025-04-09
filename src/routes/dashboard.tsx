import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/store/user'
import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { BarChart3, Building2, Calendar, ClipboardCheck, FileText, LayoutDashboard, LogOut, Settings, User, Users } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

interface NavItemProps {
  href: string
  title: string
  icon: React.ReactNode
  isActive?: boolean
  isChild?: boolean
}

function NavItem({ href, title, icon, isActive, isChild }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted',
        isChild && 'ml-6',
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  )
}

// 用户头像和下拉菜单组件
function UserMenu() {
  const { currentUser, logout } = useUserStore()
  const navigate = useNavigate()

  // 如果没有登录信息，则跳转到登录页面
  useEffect(() => {
    if (!currentUser) {
      navigate({ to: '/login' })
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    return null
  }

  // 获取用户姓名首字母作为头像备用显示
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // 获取用户角色文本
  const getUserRole = (level: number) => {
    switch (level) {
      case 1:
        return '管理员'
      case 2:
        return '部门主管'
      case 3:
        return '普通成员'
      default:
        return '用户'
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      // 调用登出接口
      const response = await fetch('/api/user/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: currentUser.userid,
          level: currentUser.level,
        }),
      })

      const data = await response.json()

      // 无论接口是否成功，都清除本地用户状态并跳转
      logout()

      if (data.code === 1000) {
        toast.success('已成功退出登录')
      }
      else {
        // 即使接口报错，也不阻止用户登出
        toast.success('已退出登录')
        console.warn('登出接口异常:', data.msg)
      }
    }
    catch (error) {
      console.error('登出请求失败:', error)
      // 出错时也清除本地状态
      logout()
      toast.success('已登出系统')
    }
    finally {
      // 无论如何都跳转回登录页
      navigate({ to: '/login' })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {currentUser.picture ? (
              <AvatarImage src={currentUser.picture} alt={currentUser.username} />
            ) : (
              <AvatarFallback>{getInitials(currentUser.username)}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {getUserRole(currentUser.level)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      {/* 侧边导航栏 */}
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="text-xl font-bold mb-6">后台管理系统</div>

        <nav className="space-y-1">
          <NavItem
            href="/dashboard"
            title="控制面板"
            icon={<LayoutDashboard className="h-5 w-5" />}
          />

          {/* 系统管理 */}
          <div className="pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">系统管理</div>
            <NavItem
              href="/dashboard/users"
              title="用户管理"
              icon={<Users className="h-5 w-5" />}
              isChild
            />
            <NavItem
              href="/dashboard/logs"
              title="日志记录"
              icon={<FileText className="h-5 w-5" />}
              isChild
            />
          </div>

          {/* 院系管理 */}
          <div className="pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">院系管理</div>
            <NavItem
              href="/dashboard/departments"
              title="院系管理"
              icon={<Building2 className="h-5 w-5" />}
              isChild
            />
          </div>

          {/* 活动管理 */}
          <div className="pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">活动管理</div>
            <NavItem
              href="/dashboard/activities"
              title="活动管理"
              icon={<Calendar className="h-5 w-5" />}
              isChild
            />
          </div>

          {/* 报名管理 */}
          <div className="pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">报名管理</div>
            <NavItem
              href="/dashboard/registrations"
              title="报名审核"
              icon={<ClipboardCheck className="h-5 w-5" />}
              isChild
            />
            <NavItem
              href="/dashboard/analytics"
              title="数据分析"
              icon={<BarChart3 className="h-5 w-5" />}
              isChild
            />
          </div>
        </nav>

        <div className="mt-auto pt-4">
          <div className="text-sm text-muted-foreground mb-2">v1.0.0</div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <header className="h-14 border-b px-6 flex items-center justify-end">
          <UserMenu />
        </header>

        {/* 内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
