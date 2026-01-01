import { Metadata } from "next";
import { getHomeData } from "@/data/home";
import { HomeHero } from "@/components/home/HomeHero";
import { PropertyCategories } from "@/components/home/PropertyCategories";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeCTA } from "@/components/home/HomeCTA";

export const metadata: Metadata = {
  title: "Micro Estate - Find Your Dream Estate Smarter",
  description:
    "ค้นหาอสังหาริมทรัพย์ด้วยระบบ AI ที่แม่นยำที่สุด ฝากขาย-เช่า-ซื้อ ง่ายและปลอดภัย",
};

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black overflow-x-hidden">
      <HomeHero stats={data?.stats || null} />
      <PropertyCategories propertyTypes={data?.propertyTypeCounts || []} />
      <FeaturedListings properties={data?.featuredProperties || []} />
      <HomeFeatures />
      <HomeCTA />
    </div>
  );
}
