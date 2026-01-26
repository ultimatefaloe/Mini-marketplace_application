import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/admin/_adminLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/admin/"!</div>
}
