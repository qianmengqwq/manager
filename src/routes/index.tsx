import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // 重定向到登录页面
    throw redirect({ to: '/login' })
  },
})
