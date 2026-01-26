import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/account/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_rootLayout/_authenticated/account/"!</div>
}
