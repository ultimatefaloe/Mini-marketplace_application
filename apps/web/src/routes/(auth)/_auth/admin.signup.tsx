import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth/admin/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/_auth/admin/signup"!</div>
}
