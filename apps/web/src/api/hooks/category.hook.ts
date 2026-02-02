import { useQuery } from '@tanstack/react-query';
import {
  categoriesQuery,
  categoryTreeQuery,
  categoryQuery,
  categoryBySlugQuery,
} from '../queries';

/**
 * Hook for fetching categories list
 */
export const useCategories = (filters?: Record<string, any>) => {
  return useQuery(categoriesQuery(filters));
};

/**
 * Hook for fetching category tree
 */
export const useCategoryTree = () => {
  return useQuery(categoryTreeQuery());
};

/**
 * Hook for fetching a single category by ID
 */
export const useCategory = (id: string, enabled = true) => {
  return useQuery({
    ...categoryQuery(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook for fetching a single category by slug
 */
export const useCategoryBySlug = (slug: string, enabled = true) => {
  return useQuery({
    ...categoryBySlugQuery(slug),
    enabled: !!slug && enabled,
  });
};