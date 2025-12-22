/**
 * Property Queries
 * React Query hooks for property data fetching
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  propertiesService,
  type SearchPropertiesParams,
} from "./properties.service";
import type { PropertyFormData } from "@/types";
import { toast } from "sonner";

// Query Keys
export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params?: SearchPropertiesParams) =>
    [...propertyKeys.lists(), params] as const,
  search: (params: SearchPropertiesParams) =>
    [...propertyKeys.all, "search", params] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  mine: () => [...propertyKeys.all, "mine"] as const,
  byAgent: (agentId: string) =>
    [...propertyKeys.all, "agent", agentId] as const,
};

/**
 * Get paginated properties
 */
export function useProperties(params?: SearchPropertiesParams) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => propertiesService.getAll(params),
  });
}

/**
 * Search properties
 */
export function useSearchProperties(params: SearchPropertiesParams) {
  return useQuery({
    queryKey: propertyKeys.search(params),
    queryFn: () => propertiesService.search(params),
    enabled: Boolean(params.q || params.propertyType || params.province),
  });
}

/**
 * Get single property by ID
 */
export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Get current agent's properties
 */
export function useMyProperties() {
  return useQuery({
    queryKey: propertyKeys.mine(),
    queryFn: () => propertiesService.getMine(),
  });
}

/**
 * Get properties by agent ID
 */
export function useAgentProperties(agentId: string) {
  return useQuery({
    queryKey: propertyKeys.byAgent(agentId),
    queryFn: () => propertiesService.getByAgent(agentId),
    enabled: Boolean(agentId),
  });
}

/**
 * Create property mutation
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PropertyFormData) => propertiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      toast.success("สร้างประกาศสำเร็จ");
    },
    onError: () => {
      toast.error("ไม่สามารถสร้างประกาศได้ กรุณาลองใหม่");
    },
  });
}

/**
 * Update property mutation
 */
export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PropertyFormData>) =>
      propertiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      toast.success("อัปเดตประกาศสำเร็จ");
    },
    onError: () => {
      toast.error("ไม่สามารถอัปเดตประกาศได้ กรุณาลองใหม่");
    },
  });
}

/**
 * Delete property mutation
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      toast.success("ลบประกาศสำเร็จ");
    },
    onError: () => {
      toast.error("ไม่สามารถลบประกาศได้ กรุณาลองใหม่");
    },
  });
}
