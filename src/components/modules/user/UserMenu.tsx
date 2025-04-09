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
import { useNavigate } from '@tanstack/react-router'
import { LogOut, Settings, User } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { fetchUserAvatar } from '../image/ImageService'
import { logoutUser } from './UserService'

export function UserMenu() {
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
        return '普通用户'
      default:
        return '未知角色'
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      // 调用登出接口
      const data = await logoutUser(currentUser.userid, currentUser.level)

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
