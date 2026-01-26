import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_rootLayout')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
      <Header />
      <div className='className="min-h-screen bg-gradient-to-b from-mmp-neutral via-white to-mmp-neutral/30"'>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
