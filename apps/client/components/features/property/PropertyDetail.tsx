import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Calendar,
} from "lucide-react";
import { Property } from "@/types/property";
import { PropertyGallery } from "./PropertyGallery";

interface PropertyDetailProps {
  property: Property;
}

export const PropertyDetail = ({ property }: PropertyDetailProps) => {
  // Debug Data Structure
  // console.log("PropertyDetail Received:", JSON.stringify(property, null, 2));

  // Prepare images for carousel: Merge thumbnail and gallery images, remove duplicates
  const rawImages = [
    property.thumbnailUrl,
    ...(property.images?.map((img: any) =>
      typeof img === "object" ? img.url : img
    ) || []),
  ].filter((url): url is string => !!url);

  const allImages = Array.from(new Set(rawImages));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Gallery Carousel */}
        <PropertyGallery
          images={allImages}
          title={property.title}
          status={property.status}
        />

        {/* Right Column: Details */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin size={18} className="mr-1 text-blue-500" />
                  <span>{property.address || "Location not specified"}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(property.price)}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 my-6">
              <div className="text-center p-3 rounded-xl bg-blue-50 text-blue-900">
                <div className="flex items-center justify-center mb-1 text-blue-500">
                  <BedDouble size={24} />
                </div>
                <div className="font-semibold text-lg">
                  {property.bedrooms || "-"}
                </div>
                <div className="text-xs text-blue-600/70">Bedrooms</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50 text-blue-900">
                <div className="flex items-center justify-center mb-1 text-blue-500">
                  <Bath size={24} />
                </div>
                <div className="font-semibold text-lg">
                  {property.bathrooms || "-"}
                </div>
                <div className="text-xs text-blue-600/70">Bathrooms</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50 text-blue-900">
                <div className="flex items-center justify-center mb-1 text-blue-500">
                  <Square size={24} />
                </div>
                <div className="font-semibold text-lg">
                  {property.area || "-"}
                </div>
                <div className="text-xs text-blue-600/70">Sq.m.</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <div className="prose prose-blue text-gray-600 leading-relaxed">
                {property.description}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-6 border-t border-gray-100 flex items-center text-gray-400 text-sm">
              <Calendar size={16} className="mr-2" />
              <span>Listed recently</span>
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
