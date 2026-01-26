import { createFileRoute } from '@tanstack/react-router'
import { ProductGrid } from '@/components/ui/product-card'
import type { IProductListItem } from '@/types'

export const Route = createFileRoute('/(root)/_rootLayout/products/')({
  component: RouteComponent,
})

const sampleProducts: IProductListItem[] = Array.from(
  { length: 50 },
  (_, i) => ({
    _id: `prod_${String(i + 1).padStart(3, '0')}`,
    name: [
      'Premium Leather Jacket',
      'Silk Evening Dress',
      'Designer Sneakers',
      'Luxury Watch',
      'Handbag Collection',
      'Sunglasses Pro',
      'Gold Necklace',
      'Yoga Outfit Set',
      'Designer Suit',
      'Casual T-Shirt',
      'Winter Coat',
      'Summer Dress',
      'Running Shoes',
      'Smart Watch',
      'Backpack',
      'Prescription Glasses',
      'Diamond Ring',
      'Gym Wear',
      'Formal Shirt',
      'Denim Jacket',
    ][i % 20],
    slug: `product-${i + 1}`,
    description: 'Premium fashion item with excellent quality and design',
    categoryId: `cat_${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
    brand: ['FashionKet', 'LuxStyle', 'UrbanWear', 'ClassicMode', 'TrendSet'][
      i % 5
    ],
    price: [
      89.99, 129.99, 199.99, 299.99, 49.99, 159.99, 399.99, 79.99, 249.99,
      99.99,
    ][i % 10],
    discount: i % 3 === 0 ? [10, 20, 30, 40, 50][i % 5] : 0,
    stock: Math.floor(Math.random() * 50) + 10,
    images: [
      `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=500&fit=crop`,
      `https://images.unsplash.com/photo-${1500000000001 + i}?w=400&h=500&fit=crop`,
    ],
    isActive: true,
    tags: ['fashion', 'premium', 'trending', 'new'],
    viewCount: Math.floor(Math.random() * 1000) + 100,
    soldCount: Math.floor(Math.random() * 500) + 50,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  }),
)

function RouteComponent() {
  return (
    <div className=''>
      <ProductGrid products={sampleProducts} />
    </div>
  )
}
