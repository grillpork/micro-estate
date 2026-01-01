import Properties from "@/components/features/property/Properties";
import GallaryLoading from "@/components/loading/gallary-loading";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<GallaryLoading />}>
      <Properties searchParams={searchParams} />
    </Suspense>
  );
}
