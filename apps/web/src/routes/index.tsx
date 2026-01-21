import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center flex justify-center items-center h-100">
      <section className='flex flex-col gap-4'>
        <h1 className='text-gray-800 font-bold text-7xl'>Welcome to Mini MarketPlace</h1>
        <p className='text-sky-600 font-sans text-xl'>Ready to purchase your first product</p>
      </section>
    </div>
  )
}
