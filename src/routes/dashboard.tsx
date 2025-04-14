import { UserMenu } from '@/components/modules/user'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { BookOpen, CalendarClock, ClipboardCheck, History, LayoutDashboard, PieChart, Users } from 'lucide-react'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

interface NavItemProps {
  href: string
  title: string
  icon: React.ReactNode
  isChild?: boolean
}

function NavItem({ href, title, icon, isChild = false }: NavItemProps) {
  return (
    <Link
      to={href}
      className={({ isActive }) =>
        cn(
          'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted',
          isChild && 'ml-4',
        )}
    >
      {icon}
      <span className="ml-3">{title}</span>
    </Link>
  )
}

const navigation = [
  { name: '概览', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: '活动管理', href: '/dashboard/activities', icon: <CalendarClock className="h-5 w-5" /> },
  { name: '报名管理', href: '/dashboard/signup', icon: <ClipboardCheck className="h-5 w-5" /> },
  { name: '日志记录', href: '/dashboard/logs', icon: <History className="h-5 w-5" /> },
  { name: '用户管理', href: '/dashboard/users', icon: <Users className="h-5 w-5" /> },
  { name: '学院管理', href: '/dashboard/college', icon: <BookOpen className="h-5 w-5" /> },
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      {/* 侧边导航栏 */}
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="text-xl font-bold mb-6">后台管理系统</div>

        <nav className="space-y-1">
          {navigation.map(item => (
            <NavItem
              key={item.name}
              href={item.href}
              title={item.name}
              icon={item.icon}
            />
          ))}
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
