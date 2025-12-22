/**
 * User Queries
 * React Query hooks for user data fetching
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, type UpdateProfileData } from "./users.service";
import { toast } from "sonner";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
};

/**
 * Get current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersService.getMe(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => usersService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.me(), data);
      toast.success("อัปเดตโปรไฟล์สำเร็จ");
    },
    onError: () => {
      toast.error("ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่");
    },
  });
}

/**
 * Upload profile image mutation
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersService.uploadProfileImage(file),
    onSuccess: async (data) => {
      // Update profile with new image URL
      await usersService.updateProfile({ image: data.url });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      toast.success("อัปโหลดรูปโพรไฟล์สำเร็จ");
    },
    onError: () => {
      toast.error("ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่");
    },
  });
}
