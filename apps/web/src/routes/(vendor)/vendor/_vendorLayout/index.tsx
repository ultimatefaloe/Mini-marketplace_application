import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/admin/"!</div>
}
