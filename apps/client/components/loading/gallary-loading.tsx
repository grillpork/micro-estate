export default function GallaryLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-[300px] bg-gray-100 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
};
