import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/orders/"!</div>
}