import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productBySlugQuery, categoriesQuery } from '@/api/queries';
import { useCreateProduct, useUpdateProduct } from '@/api/mutations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ProductForm } from '@/components/forms/product-form';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/products/$slug')({
  loader: async ({ context, params }) => {
    const queryClient = context.queryClient;
    const [product, categories] = await Promise.all([
      queryClient.ensureQueryData(productBySlugQuery(params.slug)),
      queryClient.ensureQueryData(categoriesQuery()),
    ]);
    return { product, categories };
  },
  component: VendorProductDetail,
  pendingComponent: LoadingState,
  errorComponent: ErrorState,
});

function VendorProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: product } = useQuery(productBySlugQuery(slug));
  const { data: categories } = useQuery(categoriesQuery());
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutateAsync: createProduct, isPending } = useCreateProduct()
  
  // const { mutateAsync: deactivateProduct, isPending: isDeactivating } = useDeactivateProduct();

  if (!product || !categories) return null;

  const handleSubmit = async (data: FormData) => {
    try {
      await createProduct(data)
      navigate({ to: '/vendor/products' })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async () => {
    try {
      await updateProduct({
        id: product._id.toString(),
        data: { isActive: !product.isActive },
      });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/vendor/products' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-mmp-primary2">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product details and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={product.isActive ? 'default' : 'secondary'} className="text-sm">
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="outline"
            onClick={handleToggleActive}
            // disabled={isDeactivating}
            className={product.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {product.isActive ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Views</div>
            <div className="text-2xl font-bold text-mmp-primary2">{product.viewCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Sold</div>
            <div className="text-2xl font-bold text-mmp-primary2">{product.soldCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Stock</div>
            <div className="text-2xl font-bold text-mmp-primary2">{product.stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-bold text-mmp-primary2">
              ₦{(product.price * product.soldCount).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Form */}
      <ProductForm
        product={product}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isUpdating || isPending}
      />
    </div>
  );
}