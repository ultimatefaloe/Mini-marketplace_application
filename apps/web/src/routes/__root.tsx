import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider } from '@/providers/auth-provider'
import type { QueryClient } from '@tanstack/react-query'


export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
      <AuthProvider>
        <Outlet />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </AuthProvider>
  ),
})
