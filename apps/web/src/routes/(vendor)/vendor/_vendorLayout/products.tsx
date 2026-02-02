import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/products"!</div>
}
