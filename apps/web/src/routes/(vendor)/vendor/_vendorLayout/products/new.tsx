import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { categoriesQuery } from '@/api/queries';
import { useCreateProduct } from '@/api/mutations';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ProductForm } from '@/components/forms/product-form';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/products/new')({
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: NewProduct,
  pendingComponent: LoadingState,
  errorComponent: ErrorState,
});

function NewProduct() {
  const navigate = useNavigate();
  const categories = Route.useLoaderData()
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  if (!categories) return null;

  const handleSubmit = async (data: any, images: string[]) => {
    try {
      // Transform form data
      const createData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
        variantOptions: {
          sizes: data.variantOptions?.sizes ? data.variantOptions.sizes.split(',').map((s: string) => s.trim()) : [],
          colors: data.variantOptions?.colors ? data.variantOptions.colors.split(',').map((c: string) => c.trim()) : [],
          materials: data.variantOptions?.materials ? data.variantOptions.materials.split(',').map((m: string) => m.trim()) : [],
          genders: data.variantOptions?.genders ? data.variantOptions.genders.split(',').map((g: string) => g.trim()) : [],
        },
        images,
      };

      await createProduct(createData);
      toast.success('Product created successfully');
      navigate({ to: '/vendor/products' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/vendor/products' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-mmp-primary2">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product for your store</p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}