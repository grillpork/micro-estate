import api from "../api/api";

interface UploadResponse {
  key: string;
  url: string;
  size: number;
  type: string;
}

export const mediaService = {
  upload: async (file: File, type?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (type) {
      formData.append("type", type);
    }

    const response = await api.post<{ success: boolean; data: UploadResponse }>(
      "/media/upload",
      formData
    );
    return response.data;
  },

  delete: async (key: string) => {
    return api.delete(`/media/${key}`);
  },
};
