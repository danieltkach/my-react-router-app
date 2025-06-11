import { Link } from "react-router";

export default function AccountPerks() {
  const perks = [
    {
      title: "Free Shipping",
      description: "Free shipping on all orders over $50",
      icon: "🚚"
    },
    {
      title: "Exclusive Deals",
      description: "Access to member-only sales and discounts",
      icon: "💰"
    },
    {
      title: "Early Access",
      description: "Be the first to shop new products",
      icon: "⚡"
    },
    {
      title: "Loyalty Points",
      description: "Earn points with every purchase",
      icon: "⭐"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Member Perks & Benefits</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {perks.map((perk, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="text-2xl mb-2">{perk.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2">{perk.title}</h4>
            <p className="text-gray-600">{perk.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/account/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block font-medium"
        >
          Join Now - It's Free!
        </Link>
      </div>
    </div>
  );
}