export default function ImageGallery() {
  const images = [
    "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Product+Image+1",
    "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Product+Image+2",
    "https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Product+Image+3",
    "https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Product+Image+4"
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Product Images</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Product image ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}