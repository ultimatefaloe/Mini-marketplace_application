import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_rootLayout/search"!</div>
}
