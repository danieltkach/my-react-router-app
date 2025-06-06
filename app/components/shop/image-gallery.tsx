export default function ImageGallery() {
  const images = [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
    "https://picsum.photos/400/300?random=4"
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
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}
