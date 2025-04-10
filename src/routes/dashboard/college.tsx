import CollegeManager from '@/components/modules/college'
import { createFileRoute } from '@tanstack/react-router'

function CollegePage() {
  return <CollegeManager />
}

export const Route = createFileRoute('/dashboard/college')({
  component: CollegePage,
})
