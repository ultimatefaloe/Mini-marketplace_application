import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/_authenticated/cart/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_authenticated/cart/"!</div>
}
