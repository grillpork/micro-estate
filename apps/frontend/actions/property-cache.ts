"use server";

import { propertiesService, type SearchPropertiesParams } from "@/services";
import { cacheLife } from "next/cache";

// Function นี้จะถูก Cache โดย Next.js Server
// เมื่อมีการเรียกซ้ำด้วย params เดิม จะได้ข้อมูลจาก Cache ทันทีโดยไม่ยิง API Backend
export async function getCachedProperties(params: SearchPropertiesParams) {
  "use cache";

  // Cache ไว้นาน 15 นาที (หรือ custom ได้)
  cacheLife("minutes");

  return propertiesService.getAll(params);
}

export async function getCachedPropertyBySlug(slug: string) {
  "use cache";
  cacheLife("hours"); // Details change less frequently
  return propertiesService.getBySlug(slug);
}
