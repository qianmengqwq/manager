import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/common')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/common"!</div>
}
