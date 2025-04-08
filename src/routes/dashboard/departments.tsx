import { createFileRoute } from '@tanstack/react-router'
import { DepartmentsPage } from '../../pages/dashboard/departments/DepartmentsPage'

export const Route = createFileRoute('/dashboard/departments')({
  component: DepartmentsPage,
}) 