export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  limit: number;
  page: number;
  q: string;
  role: string;
  status: string;
}
