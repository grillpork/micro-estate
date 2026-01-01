"use server";

import { userService } from "@/services/user.service";
import { UserFilters } from "@/types/user";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

// Cache รายการ User (เช่น หน้า Admin List, หรือ Search Agent)
export async function getCachedUsers(params: UserFilters) {
  "use cache";

  cacheLife("minutes"); // รายชื่อ User ไม่ได้เปลี่ยนบ่อยมาก

  return userService.getAll(params);
}

// Cache รายละเอียด User รายบุคคล
export async function getCachedUserById(id: string) {
  "use cache";
  cacheLife("hours"); // Profile เปลี่ยนยากกว่า List

  return userService.getById(id);
}

// สำหรับข้อมูลตัวเอง (Me) ใช้ React cache สำหรับ Request-level caching
export const getMyProfile = cache(async () => {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.toString();

    // เรียก API ตรงไปที่ backend พร้อมส่ง cookie ไปด้วย
    const res = await api.get("/users/me", {
      headers: {
        Cookie: cookie,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching profile on server:", error);
    return null;
  }
});
