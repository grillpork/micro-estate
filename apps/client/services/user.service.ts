import { api } from "@/lib/api";
import { User, UserFilters } from "@/types/user";

export const userService = {
  me: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },

  getAll: async (params: UserFilters) => {
    const res = await api.get("/users", { params });
    return res.data;
  },

  getById: async (id: string, options?: { headers?: any }) => {
    const res = await api.get(`/users/profile/${id}`, options);
    return res.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const res = await api.put("/users/me", data);
    return res.data;
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/users/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return (res as any).data;
  },

  searchUsers: async (query: string): Promise<any[]> => {
    const res: any = await api.get("/users/search", { params: { q: query } });
    return res.data;
  },
};
