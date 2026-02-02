import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/admin/_adminLayout/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/products"!</div>
}
