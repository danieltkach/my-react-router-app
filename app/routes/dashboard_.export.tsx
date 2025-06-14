import { Link } from "react-router";

export default function DashboardExport() {
  return (
    <div className="min-h-screen bg-white">
      {/* 🎯 Teaching Point: Minimal header for export/print */}
      <div className="bg-gray-100 border-b px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Data Export</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🖨️ Print Report
            </button>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* 🎯 Teaching Point: Layout opt-out explanation */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8 print:hidden">
          <h2 className="text-orange-800 font-semibold mb-2">
            📤 Export Page Layout Demonstration
          </h2>
          <p className="text-orange-700 mb-3">
            This export page is at <code className="bg-orange-100 px-2 py-1 rounded">/dashboard/export</code>
            but notice what's missing compared to regular dashboard pages:
          </p>
          <ul className="text-orange-700 ml-4 list-disc">
            <li>❌ No dashboard navigation tabs</li>
            <li>❌ No left sidebar with stats</li>
            <li>❌ No footer with controls</li>
            <li>✅ Clean, print-friendly layout</li>
            <li>✅ Perfect for embedding in reports</li>
          </ul>
          <p className="text-orange-700 mt-3">
            <strong>File:</strong> <code className="bg-orange-100 px-2 py-1 rounded">dashboard_.export.tsx</code>
            (trailing underscore skips the dashboard layout)
          </p>
        </div>

        {/* Export Content */}
        <div className="bg-white">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </header>

          {/* Key Metrics */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Key Performance Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">$1.2M</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-600">45.2K</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">18.7%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">2.3x</div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
            </div>
          </section>

          {/* Data Table */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Monthly Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">Month</th>
                    <th className="border px-4 py-2 text-right">Revenue</th>
                    <th className="border px-4 py-2 text-right">Users</th>
                    <th className="border px-4 py-2 text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">January 2024</td>
                    <td className="border px-4 py-2 text-right">$98,765</td>
                    <td className="border px-4 py-2 text-right">12,345</td>
                    <td className="border px-4 py-2 text-right">1,234</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">February 2024</td>
                    <td className="border px-4 py-2 text-right">$125,430</td>
                    <td className="border px-4 py-2 text-right">15,670</td>
                    <td className="border px-4 py-2 text-right">1,567</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">March 2024</td>
                    <td className="border px-4 py-2 text-right">$156,890</td>
                    <td className="border px-4 py-2 text-right">18,920</td>
                    <td className="border px-4 py-2 text-right">1,892</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Charts Placeholder */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Visual Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded p-6">
                <h3 className="font-semibold mb-4">Revenue Trend</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">[Chart: Revenue Growth Over Time]</span>
                </div>
              </div>
              <div className="border rounded p-6">
                <h3 className="font-semibold mb-4">User Acquisition</h3>
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">[Chart: New vs Returning Users]</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}