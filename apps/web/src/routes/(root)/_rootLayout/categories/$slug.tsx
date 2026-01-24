import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/categories/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_rootLayout/categories/$slug"!</div>
}
