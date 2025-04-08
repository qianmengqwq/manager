import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { BarChart3, Building2, Calendar, ClipboardCheck, FileText, LayoutDashboard, Users } from 'lucide-react'

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
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
