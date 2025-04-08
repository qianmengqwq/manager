import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsPage } from '../../pages/dashboard/analytics/AnalyticsPage'

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsPage,
}) 