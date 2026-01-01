import { ShortsFeed } from "@/components/shorts/ShortsFeed";
import { UploadShortButton } from "@/components/shorts/UploadShortButton";

export default function ShortsPage() {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <h1 className="text-xl font-bold text-white drop-shadow-md">Shorts</h1>
        <div className="pointer-events-auto">
          <UploadShortButton />
        </div>
      </div>

      <ShortsFeed />
    </div>
  );
}
