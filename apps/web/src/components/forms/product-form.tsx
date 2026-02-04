import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IProduct, ICategory } from '@/types';
import { Loader2, Upload, X } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  discount: z.number().min(0).max(100).optional(),
  tags: z.string().optional(),
  variantOptions: z.object({
    sizes: z.string().optional(),
    colors: z.string().optional(),
    materials: z.string().optional(),
    genders: z.string().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Partial<IProduct>;
  categories: ICategory[];
  onSubmit: (data: ProductFormData, images: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  isLoading,
}) => {
  const [images, setImages] = React.useState<string[]>(product?.images || []);
  const [imageInput, setImageInput] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.categoryId?.toString() || '',
      brand: product?.brand || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      discount: product?.discount || 0,
      tags: product?.tags?.join(', ') || '',
      variantOptions: {
        sizes: product?.variantOptions?.sizes?.join(', ') || '',
        colors: product?.variantOptions?.colors?.join(', ') || '',
        materials: product?.variantOptions?.materials?.join(', ') || '',
        genders: product?.variantOptions?.genders?.join(', ') || '',
      },
    },
  });

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data, images);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id.toString()} value={category._id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., fashion, summer, casual"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                {...register('discount', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variant Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes">Sizes (comma-separated)</Label>
              <Input
                id="sizes"
                {...register('variantOptions.sizes')}
                placeholder="e.g., S, M, L, XL"
              />
            </div>

            <div>
              <Label htmlFor="colors">Colors (comma-separated)</Label>
              <Input
                id="colors"
                {...register('variantOptions.colors')}
                placeholder="e.g., Red, Blue, Green"
              />
            </div>

            <div>
              <Label htmlFor="materials">Materials (comma-separated)</Label>
              <Input
                id="materials"
                {...register('variantOptions.materials')}
                placeholder="e.g., Cotton, Polyester"
              />
            </div>

            <div>
              <Label htmlFor="genders">Genders (comma-separated)</Label>
              <Input
                id="genders"
                {...register('variantOptions.genders')}
                placeholder="e.g., Male, Female, Unisex"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Enter image URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <Button type="button" onClick={handleAddImage} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-mmp-primary hover:bg-mmp-primary2">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};