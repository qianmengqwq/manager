import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // 重定向到活动列表
    throw redirect({ to: '/activities' })
  },
})
