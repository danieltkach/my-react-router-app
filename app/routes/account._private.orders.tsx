import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getCurrentUser } from "~/lib/auth-v2.server";
import { redirect } from "react-router";

// 🎯 Load user and their orders
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect("/auth/login");
  }

  // Mock orders data - in real app, fetch from database
  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 299.99,
      items: ["Premium Wireless Headphones", "USB-C Cable"]
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "Shipped",
      total: 159.50,
      items: ["React Router Book", "Coding Stickers"]
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "Processing",
      total: 89.99,
      items: ["Tailwind CSS Guide"]
    }
  ];

  return { user, orders };
}

export default function AccountOrders() {
  const { user, orders } = useLoaderData<typeof loader>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h3>

      {/* Server auth confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-800 font-semibold mb-2">🎯 Orders for {user.name}</h4>
        <p className="text-blue-700 text-sm">
          Showing orders loaded via server-side authentication. Role: <strong>{user.role}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{order.id}</h4>
                <p className="text-gray-600 text-sm">Ordered on {order.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Items:</h5>
              <ul className="text-gray-600 text-sm">
                {order.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">${order.total}</span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}