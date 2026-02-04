import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/settings/')({
  component: VendorSettings,
});

const settingsSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  description: z.string().optional(),
  location: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function VendorSettings() {
  const { vendor } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: vendor?.businessName || '',
      email: vendor?.email || '',
      phone: vendor?.phone || '',
      description: vendor?.description || '',
      location: vendor?.location || {
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
      },
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // In real app, call API here
      console.log('Settings update:', data);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-mmp-primary2">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                {...register('businessName')}
              />
              {errors.businessName && (
                <p className="text-sm text-red-600 mt-1">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Tell customers about your business"
              />
            </div>

            <div>
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-mmp-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-mmp-primary">
                    {vendor?.businessName?.charAt(0) || 'B'}
                  </span>
                </div>
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Location */}
        <Card>
          <CardHeader>
            <CardTitle>Business Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                {...register('location.street')}
              />
              {errors.location?.street && (
                <p className="text-sm text-red-600 mt-1">{errors.location.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('location.city')}
                />
                {errors.location?.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register('location.state')}
                />
                {errors.location?.state && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.state.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('location.country')}
                />
                {errors.location?.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.country.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isDirty}
            className="bg-mmp-primary hover:bg-mmp-primary2"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}