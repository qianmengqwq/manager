import { createFileRoute } from '@tanstack/react-router'
import { ActivitiesPage } from '../../pages/dashboard/activities/ActivitiesPage'

export const Route = createFileRoute('/dashboard/activities')({
  component: ActivitiesPage,
}) 