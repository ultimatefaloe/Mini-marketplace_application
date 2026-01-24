import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/__authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  console.log('Authentication')
  return (
    <div>
      <Outlet />
    </div>
  )
}
