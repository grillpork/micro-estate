import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import { queryKeys } from "@/lib/query-keys";
import { PropertyFilters } from "@/types/property";
import { toast } from "sonner";

// 1. Read Hooks (Queries)
export const useProperties = (filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: () => propertyService.getAll(filters),
    // Keep previous data while fetching new data (great for pagination/filtering)
    placeholderData: (previousData) => previousData,
  });
};

export const useProperty = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.properties.detail(slug),
    queryFn: () => propertyService.getBySlug(slug),
    enabled: !!slug, // Don't fetch if slug is empty
  });
};

// 2. Write Hooks (Mutations)
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      toast.success("Property created successfully");
      // Invalidate list to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });
    },
    onError: (error: any) => {
      // Error is handled by global interceptor, but specific UI logic can go here
      console.error(error);
    },
  });
};
