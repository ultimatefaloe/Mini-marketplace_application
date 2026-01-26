import HomeClient from '@/components/home/home-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout/')({
  component: App,
})

function App() {
  return <HomeClient />
}
