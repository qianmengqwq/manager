import { createFileRoute } from '@tanstack/react-router'
import { UsersPage } from '../../pages/dashboard/users/UsersPage'

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
}) 