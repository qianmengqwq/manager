import { createFileRoute } from '@tanstack/react-router'
import { ActivityDetailPage } from '../../pages/dashboard/activities/ActivityDetailPage'

export const Route = createFileRoute('/dashboard/activities/$activityId')({
  component: ActivityDetailPage,
}) 