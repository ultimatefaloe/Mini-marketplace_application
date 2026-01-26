import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IProductQueryFilters } from '@/types';

interface ProductFiltersProps {
  filters: IProductQueryFilters;
  onFilterChange: (filters: Partial<IProductQueryFilters>) => void;
  brands: string[];
  tags: string[];
  maxPrice: number;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  brands,
  tags,
  maxPrice,
  className,
}) => {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || maxPrice,
  ]);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({
    price: true,
    brand: true,
    tags: true,
  });

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceCommit = () => {
    onFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      categoryId: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      tags: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
    setPriceRange([0, maxPrice]);
  };

  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, section, children }) => (
    <div className="border-b border-gray-200 pb-6">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left"
        onClick={() => toggleSection(section)}
      >
        <span className="font-semibold text-gray-900">{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {expandedSections[section] && children}
    </div>
  );

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="sr-only">
          Search products
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Sort */}
      <div>
        <Label htmlFor="sort" className="mb-2 block text-sm font-medium">
          Sort by
        </Label>
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) =>
            onFilterChange({ sortBy: value as IProductQueryFilters['sortBy'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Newest</SelectItem>
            <SelectItem value="price">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-4 pt-2">
          <Slider
            min={0}
            max={maxPrice}
            step={1000}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceCommit}
            className="py-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Min: {priceRange[0].toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-gray-600">
              Max: {priceRange[1].toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" section="brand">
        <div className="space-y-3 pt-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brand === brand}
                onCheckedChange={(checked) =>
                  onFilterChange({ brand: checked ? brand : undefined })
                }
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="ml-3 cursor-pointer text-sm text-gray-700"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Tags */}
      <FilterSection title="Tags" section="tags">
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={filters.tags === tag ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'rounded-full',
                filters.tags === tag
                  ? 'bg-mmp-primary text-white hover:bg-mmp-primary2'
                  : ''
              )}
              onClick={() =>
                onFilterChange({ tags: filters.tags === tag ? undefined : tag })
              }
            >
              {tag}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {(filters.search || filters.brand || filters.minPrice || filters.maxPrice || filters.tags) && (
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className={cn('hidden lg:block', className)}>
        <div className="sticky top-24">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {(filters.search || filters.brand || filters.minPrice || filters.maxPrice || filters.tags) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
          {filterContent}
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters & Sort
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-6">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};