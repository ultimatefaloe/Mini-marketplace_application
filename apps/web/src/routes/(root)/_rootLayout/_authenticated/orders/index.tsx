import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/_authenticated/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_authenticated/orders/"!</div>
}
