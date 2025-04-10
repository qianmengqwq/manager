import { createFileRoute } from '@tanstack/react-router'
import CollegeManager from '@/components/modules/college'

function CollegePage() {
  return <CollegeManager />
}

export const Route = createFileRoute('/dashboard/departments')({
  component: CollegePage,
})
