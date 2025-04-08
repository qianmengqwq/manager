import { createFileRoute } from '@tanstack/react-router'
import { LogsPage } from '../../pages/dashboard/logs/LogsPage'

export const Route = createFileRoute('/dashboard/logs')({
  component: LogsPage,
}) 