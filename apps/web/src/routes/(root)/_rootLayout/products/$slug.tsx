

import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/(root)/_rootLayout/products/$slug'
)({
  component: RouteComponent,
  params: {
    parse: (params) =>
      z
        .object({
          slug: z.string().min(1),
        })
        .parse(params),
  },
})


function RouteComponent() {
  const { slug } = Route.useParams()
  return <div>This is {slug} for product details</div>
}
