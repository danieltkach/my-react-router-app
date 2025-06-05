export default function Reviews() {
  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2024-01-15",
      comment: "Absolutely love this product! Great quality and fast shipping."
    },
    {
      id: 2,
      author: "Mike K.",
      rating: 4,
      date: "2024-01-10",
      comment: "Good product overall. Would recommend to others."
    },
    {
      id: 3,
      author: "Jessica L.",
      rating: 5,
      date: "2024-01-08",
      comment: "Exceeded my expectations. Will definitely buy again!"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{review.author}</span>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}