import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/_adminLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Admin LAyout goes in here</h1>
      <Outlet />
    </div>
  )
}
