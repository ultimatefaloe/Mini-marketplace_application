import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Auth LAyout goes in here</h1>
      <Outlet />
    </div>
  )
}
