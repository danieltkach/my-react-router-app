import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth-v2.server";
import type { Route } from "./+types/dashboard.analytics";

// Simulate fast data (loads immediately)
async function getFastMetrics() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    totalUsers: 12345,
    totalRevenue: 98765,
    activeUsers: 1234,
    conversionRate: 3.4
  };
}

// Simulate slow data (takes 2-3 seconds)
async function getSlowAnalytics() {
  await new Promise(resolve => setTimeout(resolve, 2500));
  return {
    chartData: [
      { month: 'Jan', revenue: 12000, users: 400 },
      { month: 'Feb', revenue: 15000, users: 500 },
      { month: 'Mar', revenue: 18000, users: 600 },
      { month: 'Apr', revenue: 22000, users: 750 },
      { month: 'May', revenue: 25000, users: 850 },
      { month: 'Jun', revenue: 28000, users: 950 }
    ],
    topProducts: [
      { name: 'Premium Headphones', sales: 245, revenue: 73500 },
      { name: 'Smart Watch', sales: 189, revenue: 37800 },
      { name: 'Bluetooth Speaker', sales: 156, revenue: 14040 }
    ]
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const fastMetrics = await getFastMetrics();

  return {
    user,
    fastMetrics,
    hasSlowData: false
  };
}

export default function AdvancedAnalytics({ loaderData }: Route.ComponentProps) {
  const { user, fastMetrics } = loaderData;
  const [slowData, setSlowData] = useState<any>(null);
  const [verySlowData, setVerySlowData] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState({
    slowData: false,
    verySlowData: false
  });

  // Simulate streaming data loading
  useEffect(() => {
    // Load slow data after component mounts
    setLoadingStates(prev => ({ ...prev, slowData: true }));

    getSlowAnalytics().then(data => {
      setSlowData(data);
      setLoadingStates(prev => ({ ...prev, slowData: false }));
    });

    // Load very slow data after component mounts
    setLoadingStates(prev => ({ ...prev, verySlowData: true }));

    // Very slow data simulation
    setTimeout(() => {
      setVerySlowData({
        performanceReports: [
          { metric: 'Page Load Time', value: '1.2s', trend: 'up' },
          { metric: 'Error Rate', value: '0.1%', trend: 'down' },
          { metric: 'API Response Time', value: '150ms', trend: 'stable' }
        ],
        userBehavior: {
          avgSessionDuration: '4m 32s',
          bounceRate: '32%',
          pagesPerSession: 2.8
        }
      });
      setLoadingStates(prev => ({ ...prev, verySlowData: false }));
    }, 4000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* RR7 Feature Demo */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h2 className="text-indigo-800 font-semibold mb-2">🚀 Progressive Data Loading Demo</h2>
        <div className="text-indigo-700 text-sm space-y-1">
          <p><strong>✅ Fast Data:</strong> Loaded immediately (100ms)</p>
          <p><strong>⏳ Slow Data:</strong> Streaming in background (2.5s)</p>
          <p><strong>⏳ Very Slow Data:</strong> Progressive loading (4s)</p>
          <p><strong>✅ Loading States:</strong> Independent progress indicators</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Advanced Analytics - {user.name}
      </h1>

      {/* Fast Metrics - Load Immediately */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{fastMetrics.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold text-green-600">${fastMetrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold text-purple-600">{fastMetrics.activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold text-orange-600">{fastMetrics.conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progressive Slow Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>

          {loadingStates.slowData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading analytics data...</p>
                <p className="text-sm text-gray-500">(~2.5 seconds)</p>
              </div>
            </div>
          ) : slowData ? (
            <div className="space-y-4">
              {/* Chart Data */}
              <div className="space-y-2">
                {slowData.chartData.map((item: any) => (
                  <div key={item.month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{item.users} users</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Products */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Top Products</h4>
                <div className="space-y-2">
                  {slowData.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{product.name}</span>
                      <span className="font-medium">{product.sales} sales</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Preparing analytics...</p>
            </div>
          )}
        </div>

        {/* Progressive Very Slow Reports */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Reports</h3>

          {loadingStates.verySlowData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
                <p className="text-gray-600 mt-4">Loading performance data...</p>
                <p className="text-sm text-gray-500">(~4 seconds)</p>
              </div>
            </div>
          ) : verySlowData ? (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Performance</h4>
                <div className="space-y-2">
                  {verySlowData.performanceReports.map((report: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{report.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.value}</span>
                        <span className={`text-xs px-2 py-1 rounded ${report.trend === 'up' ? 'bg-green-100 text-green-800' :
                          report.trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {report.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Behavior */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Behavior</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Avg Session Duration</span>
                    <span className="font-medium text-blue-600">{verySlowData.userBehavior.avgSessionDuration}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium text-orange-600">{verySlowData.userBehavior.bounceRate}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm">Pages per Session</span>
                    <span className="font-medium text-purple-600">{verySlowData.userBehavior.pagesPerSession}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Preparing reports...</p>
            </div>
          )}
        </div>
      </div>

      {/* Demo Info */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How Progressive Loading Works</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>1. <strong>Fast data</strong> loads immediately and page renders</p>
          <p>2. <strong>Slow data</strong> loads in background with loading states</p>
          <p>3. <strong>Progressive enhancement</strong> - content streams in as it becomes available</p>
          <p>4. <strong>Better UX</strong> - users see content immediately instead of waiting for everything</p>
        </div>
      </div>
    </div>
  );
}
