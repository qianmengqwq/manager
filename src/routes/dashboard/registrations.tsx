import { createFileRoute } from '@tanstack/react-router'
import { RegistrationsPage } from '../../pages/dashboard/registrations/RegistrationsPage'

export const Route = createFileRoute('/dashboard/registrations')({
  component: RegistrationsPage,
}) 