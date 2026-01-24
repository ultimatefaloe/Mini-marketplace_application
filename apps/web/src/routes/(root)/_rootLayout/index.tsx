import HomeClient from '@/components/clients/home/home-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/')({
  component: App,
})

function App() {
  return <HomeClient />
}
