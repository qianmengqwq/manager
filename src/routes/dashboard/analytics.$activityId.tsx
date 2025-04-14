import { AnalyticsPage } from '@/pages/dashboard/analytics/AnalyticsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/analytics/$activityId')({
  component: AnalyticsPage,
})
