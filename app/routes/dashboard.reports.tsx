import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard.reports";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export default function DashboardReports({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const reports = [
    {
      id: 1,
      name: "Monthly Sales Report",
      description: "Comprehensive sales performance analysis",
      lastGenerated: "2024-01-15",
      format: "PDF",
      status: "ready",
      size: "2.3 MB"
    },
    {
      id: 2,
      name: "User Engagement Analytics",
      description: "User behavior and engagement metrics",
      lastGenerated: "2024-01-14",
      format: "Excel",
      status: "generating",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Financial Summary Q1",
      description: "Quarterly financial performance overview",
      lastGenerated: "2024-01-10",
      format: "PDF",
      status: "ready",
      size: "5.1 MB"
    },
    {
      id: 4,
      name: "Product Performance Report",
      description: "Top performing products and categories",
      lastGenerated: "2024-01-12",
      format: "CSV",
      status: "error",
      size: "892 KB"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-100 text-green-800";
      case "generating": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <span>✅</span>;
      case "generating": return <span>⏳</span>;
      case "error": return <span>❌</span>;
      default: return <span>📄</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports for {user.name}</h2>
      </div>

      {/* Updated demo box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-blue-800 font-semibold mb-2">
          <span>✅</span> Dashboard Reports with Production Auth
        </h3>
        <p className="text-blue-700">
          This reports page now uses secure session authentication. User: <strong>{user.email}</strong> ({user.role})
        </p>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Reports</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{report.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)} {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span><span>📅</span> Generated: {report.lastGenerated}</span>
                    <span><span>📄</span> Format: {report.format}</span>
                    <span><span>💾</span> Size: {report.size}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {report.status === "ready" && (
                    <>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <span>📥</span> Download
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        <span>📧</span> Email
                      </button>
                    </>
                  )}

                  {report.status === "generating" && (
                    <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                      <span>⏸️</span> Cancel
                    </button>
                  )}

                  {report.status === "error" && (
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      <span>🔄</span> Retry
                    </button>
                  )}

                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    <span>⚙️</span> Settings
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <span>📈</span> Sales Reports
          </h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Generate detailed sales analytics</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mt-auto">
            Create Sales Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <span>👥</span> User Reports
          </h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Analyze user behavior and engagement</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-auto">
            Create User Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <span>💰</span> Financial Reports
          </h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Financial performance summaries</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 mt-auto">
            Create Financial Report
          </button>
        </div>
      </div>

      {/* Report Scheduling */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <span>📅</span> Scheduled Reports
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Weekly Sales Summary</div>
              <div className="text-sm text-gray-600">Every Monday at 9:00 AM</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-sm"><span>✅</span> Active</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <div className="font-medium">Monthly Financial Report</div>
              <div className="text-sm text-gray-600">1st of every month at 8:00 AM</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-sm"><span>✅</span> Active</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            </div>
          </div>
        </div>

        <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
          + Add New Scheduled Report
        </button>
      </div>
    </div>
  );
}
