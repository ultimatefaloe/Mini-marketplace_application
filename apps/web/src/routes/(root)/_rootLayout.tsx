import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>Header goes in here</h1>
    <Outlet />
  </div>
}
