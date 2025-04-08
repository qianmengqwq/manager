import { createRootRoute, Outlet } from '@tanstack/react-router'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ActivitiesPage } from '../pages/dashboard/activities/ActivitiesPage'
import { ActivityDetailPage } from '../pages/dashboard/activities/ActivityDetailPage'
import { AnalyticsPage } from '../pages/dashboard/analytics/AnalyticsPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { DepartmentsPage } from '../pages/dashboard/departments/DepartmentsPage'
import { LogsPage } from '../pages/dashboard/logs/LogsPage'
import { RegistrationsPage } from '../pages/dashboard/registrations/RegistrationsPage'
import { UsersPage } from '../pages/dashboard/users/UsersPage'
import { LoginPage } from '../pages/login/LoginPage'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
