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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { IProduct, ICategory } from '@/types';
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  ArrowUpDown,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

// Product form schema
const productFormSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must not exceed 200 characters'),
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().max(100, 'Brand must not exceed 100 characters').optional(),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000000, 'Price is too high'),
  stock: z.number()
    .min(0, 'Stock must be positive')
    .max(10000, 'Stock is too high'),
  discount: z.number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
  variantOptions: z.object({
    sizes: z.string().optional(),
    colors: z.string().optional(),
    materials: z.string().optional(),
    genders: z.string().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// Image item type
type ImageItem = {
  type: 'url' | 'file';
  url?: string;
  file?: File;
  preview?: string;
  id: string;
  isMain?: boolean;
  order?: number;
};

interface ProductFormProps {
  product?: Partial<IProduct>;
  categories: ICategory[];
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  isUpdate?: boolean;
}

// Constants
const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

// Helper function to convert comma-separated string to array
const stringToArray = (str?: string): string[] => {
  if (!str) return [];
  return str.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

// Helper function to convert array to comma-separated string
const arrayToString = (arr?: string[]): string => {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
};

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  isLoading = false,
  isUpdate = false,
}) => {
  // Image state management
  const [imageItems, setImageItems] = React.useState<ImageItem[]>(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((url, index) => ({
        type: 'url',
        url,
        id: `url-${index}-${Date.now()}`,
        isMain: index === 0,
        order: index,
      }));
    }
    return [];
  });

  const [isUploading, setIsUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema as any),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.categoryId?.toString() || '',
      brand: product?.brand || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      discount: product?.discount || 0,
      tags: product?.tags ? arrayToString(product.tags) : '',
      isActive: product?.isActive ?? true,
      variantOptions: {
        sizes: product?.variantOptions?.sizes ? arrayToString(product.variantOptions.sizes) : '',
        colors: product?.variantOptions?.colors ? arrayToString(product.variantOptions.colors) : '',
        materials: product?.variantOptions?.materials ? arrayToString(product.variantOptions.materials) : '',
        genders: product?.variantOptions?.genders ? arrayToString(product.variantOptions.genders) : '',
      },
    },
  });

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      imageItems.forEach(item => {
        if (item.type === 'file' && item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    const filesArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - imageItems.length;

    if (filesArray.length > remainingSlots) {
      toast.warning(`You can only upload ${remainingSlots} more image(s)`);
      filesArray.splice(remainingSlots);
    }

    const newImageItems: ImageItem[] = [];
    const errors: string[] = [];

    filesArray.forEach((file) => {
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name}. Please upload images only.`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`File too large: ${file.name}. Max size is 10MB.`);
        return;
      }

      // Check for duplicate files
      const isDuplicate = imageItems.some(
        item => item.type === 'file' && item.file?.name === file.name && item.file?.size === file.size
      );

      if (isDuplicate) {
        errors.push(`Duplicate file: ${file.name}. File already added.`);
        return;
      }

      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);

      newImageItems.push({
        type: 'file',
        file,
        preview,
        id,
        order: imageItems.length + newImageItems.length,
      });
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    // Add valid files
    if (newImageItems.length > 0) {
      setImageItems(prev => {
        const updated = [...prev, ...newImageItems];
        return updated.map((item, index) => ({ ...item, order: index }));
      });
      toast.success(`Added ${newImageItems.length} image(s)`);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // Handle image actions
  const handleRemoveImage = (id: string) => {
    setImageItems(prev => {
      const item = prev.find(item => item.id === id);
      // Revoke object URL
      if (item?.type === 'file' && item.preview) {
        URL.revokeObjectURL(item.preview);
      }

      const updated = prev.filter(item => item.id !== id);
      // Update orders and check if we need a new main image
      return updated.map((item, index) => ({
        ...item,
        order: index,
        isMain: index === 0 ? true : item.isMain,
      }));
    });
  };

  const handleSetMainImage = (id: string) => {
    setImageItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;

      const updated = [...prev];
      // Remove the item and insert it at the beginning
      const [mainImage] = updated.splice(index, 1);
      updated.unshift({ ...mainImage, isMain: true });

      // Update orders and reset main flags
      return updated.map((item, idx) => ({
        ...item,
        order: idx,
        isMain: idx === 0,
      }));
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= imageItems.length || toIndex < 0 || toIndex >= imageItems.length) {
      return;
    }

    setImageItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      // Update orders and main image flag
      return newItems.map((item, idx) => ({
        ...item,
        order: idx,
        isMain: idx === 0,
      }));
    });
  };

  // Form submission
  const onFormSubmit = async (data: ProductFormData) => {
    if (imageItems.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();

      // Add text fields
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('categoryId', data.categoryId);
      if (data.brand) formData.append('brand', data.brand);
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('discount', data.discount.toString());
      formData.append('isActive', data.isActive.toString());
      
      if (data.tags) {
        const tagsArray = stringToArray(data.tags);
        tagsArray.forEach(tag => formData.append('tags[]', tag));
      }

      // Add variant options
      if (data.variantOptions) {
        const variantData: any = {};
        
        if (data.variantOptions.sizes) {
          variantData.sizes = stringToArray(data.variantOptions.sizes);
        }
        if (data.variantOptions.colors) {
          variantData.colors = stringToArray(data.variantOptions.colors);
        }
        if (data.variantOptions.materials) {
          variantData.materials = stringToArray(data.variantOptions.materials);
        }
        if (data.variantOptions.genders) {
          variantData.genders = stringToArray(data.variantOptions.genders);
        }

        if (Object.keys(variantData).length > 0) {
          formData.append('variantOptions', JSON.stringify(variantData));
        }
      }

      // Add existing images (for update operations)
      if (isUpdate) {
        const existingUrls = imageItems
          .filter(item => item.type === 'url' && item.url)
          .map(item => item.url!);
        
        existingUrls.forEach(url => formData.append('existingImages[]', url));
      }

      // Add new files
      const newFiles = imageItems
        .filter(item => item.type === 'file' && item.file)
        .map(item => item.file!);

      newFiles.forEach(file => {
        formData.append('images', file);
      });

      // Add image order information
      imageItems.forEach((item, index) => {
        const imageKey = item.type === 'url' ? item.url : item.file?.name;
        if (imageKey) {
          formData.append(`imageOrder[${index}]`, imageKey);
        }
      });

      // Submit form data
      await onSubmit(formData);

      // Success notification
      toast.success(isUpdate ? 'Product updated successfully!' : 'Product created successfully!');

    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || `Failed to ${isUpdate ? 'update' : 'create'} product`);
    } finally {
      setIsUploading(false);
    }
  };

  const totalLoading = isLoading || isUploading;
  const canAddMoreImages = imageItems.length < MAX_IMAGES;
  const isFormValid = imageItems.length > 0 && isDirty;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Product Images Section */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-mmp-primary transition-colors overflow-hidden pb-6">
        <CardHeader className="bg-gradient-to-r from-mmp-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-mmp-primary" />
              Product Images
              <Badge variant="outline" className="ml-2">
                {imageItems.length}/{MAX_IMAGES}
              </Badge>
            </CardTitle>
            {canAddMoreImages && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-mmp-primary text-mmp-primary hover:bg-mmp-primary/10"
                disabled={totalLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Images
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            First image will be used as the main thumbnail. Drag to reorder.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Area */}
          {canAddMoreImages && (
            <div
              className={cn(
                'relative rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer',
                dragActive
                  ? 'border-mmp-primary bg-mmp-primary/5'
                  : 'border-gray-300 hover:border-mmp-primary hover:bg-gray-50',
                totalLoading && 'opacity-50 cursor-not-allowed'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !totalLoading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleFileInput}
                className="hidden"
                disabled={!canAddMoreImages || totalLoading}
              />

              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-mmp-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-mmp-primary" />
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {dragActive ? 'Drop images here' : 'Upload product images'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Drag & drop or click to browse
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    JPG, PNG, WEBP, GIF, SVG
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Max 10MB each
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Max {MAX_IMAGES} images
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {imageItems.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Preview {imageItems.length} image(s)
                </Label>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="h-3 w-3" />
                  <span>Drag to reorder, first image is main thumbnail</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      'relative group rounded-lg overflow-hidden border-2 transition-all',
                      item.isMain
                        ? 'border-mmp-primary ring-2 ring-mmp-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      moveImage(fromIndex, index);
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={item.type === 'file' ? item.preview : item.url}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Main Image Badge */}
                    {item.isMain && (
                      <div className="absolute top-2 left-2 bg-mmp-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Main
                      </div>
                    )}

                    {/* Order Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {index + 1}
                    </div>

                    {/* Image Info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="text-white text-xs truncate">
                        {item.type === 'file'
                          ? item.file?.name
                          : 'Existing Image'}
                      </div>
                      {item.type === 'file' && item.file && (
                        <div className="text-white/70 text-[10px]">
                          {(item.file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!item.isMain && (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                          onClick={() => handleSetMainImage(item.id)}
                          title="Set as main image"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => {
                          const imageUrl = item.type === 'file' ? item.preview : item.url;
                          if (imageUrl) {
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        title="View full size"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {index > 0 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                          onClick={() => moveImage(index, index - 1)}
                          title="Move up"
                        >
                          <ArrowUpDown className="h-4 w-4 -rotate-90" />
                        </Button>
                      )}

                      {index < imageItems.length - 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                          onClick={() => moveImage(index, index + 1)}
                          title="Move down"
                        >
                          <ArrowUpDown className="h-4 w-4 rotate-90" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 bg-red-500/90 hover:bg-red-600"
                        onClick={() => handleRemoveImage(item.id)}
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add More Slot */}
                {canAddMoreImages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={totalLoading}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-mmp-primary hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Add More</span>
                    <span className="text-xs text-gray-500">
                      {MAX_IMAGES - imageItems.length} left
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border-mmp-primary/20 shadow-sm pb-6">
        <CardHeader className="bg-gradient-to-r from-mmp-primary/5 to-transparent">
          <CardTitle className="text-mmp-primary2">Basic Information</CardTitle>
          <p className="text-sm text-gray-600">Essential product details</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">
              Product Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter product name"
              className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
              disabled={totalLoading}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description..."
              rows={4}
              className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary resize-none"
              disabled={totalLoading}
            />
            <div className="mt-1 text-xs text-gray-500">
              {watch('description')?.length || 0}/2000 characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId" className="text-gray-700">
                Category *
              </Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
                disabled={totalLoading}
              >
                <SelectTrigger className="mt-1.5 border-gray-300 focus:ring-mmp-primary">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id.toString()}
                      value={category._id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="brand" className="text-gray-700">
                Brand
              </Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Enter brand name"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className="text-gray-700">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., fashion, summer, casual, premium"
              className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
              disabled={totalLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas. Example: "summer, casual, cotton"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card className="border-mmp-primary/20 shadow-sm pb-6">
        <CardHeader className="bg-gradient-to-r from-mmp-primary/5 to-transparent">
          <CardTitle className="text-mmp-primary2">Pricing & Inventory</CardTitle>
          <p className="text-sm text-gray-600">Set pricing and stock information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-700">
                Price (₦) *
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-8 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                  disabled={totalLoading}
                />
              </div>
              {errors.price && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="stock" className="text-gray-700">
                Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
              {errors.stock && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="discount" className="text-gray-700">
                Discount (%)
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  {...register('discount', { valueAsNumber: true })}
                  placeholder="0"
                  className="border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                  disabled={totalLoading}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {watch('discount') > 0 && (
                <p className="mt-1 text-sm text-green-600">
                  Final price: ₦{((watch('price') || 0) * (1 - (watch('discount') || 0) / 100)).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-gray-700">
                Product Status
              </Label>
              <p className="text-sm text-gray-500">
                {watch('isActive') ? 'Product will be visible to customers' : 'Product will be hidden'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked: boolean) => setValue('isActive', checked)}
              disabled={totalLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Variant Options */}
      <Card className="border-mmp-primary/20 shadow-sm pb-6">
        <CardHeader className="bg-gradient-to-r from-mmp-primary/5 to-transparent">
          <CardTitle className="text-mmp-primary2">Variant Options</CardTitle>
          <p className="text-sm text-gray-600">Optional product variations</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes" className="text-gray-700">
                Sizes (comma-separated)
              </Label>
              <Input
                id="sizes"
                {...register('variantOptions.sizes')}
                placeholder="e.g., S, M, L, XL, XXL"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: "S, M, L, XL" or "38, 40, 42, 44"
              </p>
            </div>

            <div>
              <Label htmlFor="colors" className="text-gray-700">
                Colors (comma-separated)
              </Label>
              <Input
                id="colors"
                {...register('variantOptions.colors')}
                placeholder="e.g., Red, Blue, Black, White"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: "Red, Blue, Green" or "Navy Blue, Black, White"
              </p>
            </div>

            <div>
              <Label htmlFor="materials" className="text-gray-700">
                Materials (comma-separated)
              </Label>
              <Input
                id="materials"
                {...register('variantOptions.materials')}
                placeholder="e.g., Cotton, Polyester, Silk"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: "100% Cotton, Polyester Blend, Silk"
              </p>
            </div>

            <div>
              <Label htmlFor="genders" className="text-gray-700">
                Genders (comma-separated)
              </Label>
              <Input
                id="genders"
                {...register('variantOptions.genders')}
                placeholder="e.g., Male, Female, Unisex, Kids"
                className="mt-1.5 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                disabled={totalLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: "Men, Women, Unisex, Boys, Girls"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => reset()}
          disabled={totalLoading}
        >
          Reset Form
        </Button>
        <Button
          type="submit"
          disabled={totalLoading || !isFormValid}
          className={cn(
            "bg-gradient-to-r from-mmp-primary to-mmp-primary2 hover:from-mmp-primary2 hover:to-mmp-primary shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]",
            (totalLoading || !isFormValid) && "opacity-50 cursor-not-allowed"
          )}
        >
          {totalLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUpdate ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isUpdate ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Product
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};