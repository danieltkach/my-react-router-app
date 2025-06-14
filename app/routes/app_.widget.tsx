export default function EmbeddedWidget() {
  return (
    <div className="bg-white border rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* 🎯 Teaching Point: Completely standalone widget */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <h3 className="text-indigo-800 font-semibold mb-2">
          🔗 Embeddable Widget Demo
        </h3>
        <p className="text-indigo-700 text-sm">
          This page at <code className="bg-indigo-100 px-2 py-1 rounded">/app/widget</code>
          has no layout at all - perfect for embedding in other websites via iframe.
        </p>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Live Stats Widget</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-2xl font-bold text-blue-600">12,345</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <div className="text-2xl font-bold text-green-600">$98,765</div>
            <div className="text-sm text-green-700">Revenue Today</div>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <div className="text-2xl font-bold text-purple-600">99.9%</div>
            <div className="text-sm text-purple-700">Uptime</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <div>Powered by Our Analytics Platform</div>
          <div>Updates every 30 seconds</div>
        </div>
      </div>
    </div>
  );
}