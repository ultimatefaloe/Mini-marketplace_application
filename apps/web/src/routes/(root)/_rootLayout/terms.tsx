import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_rootLayout/terms"!</div>
}
