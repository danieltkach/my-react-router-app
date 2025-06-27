// app/routes/_index.tsx - Updated with React Router docs banner pattern
import { useState } from "react";
import { Form, Link, redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { parseUserPrefs, serializeUserPrefs } from "~/lib/cookies.server";
import type { Route } from "./+types/_index";

// 🎯 LOADER - Following React Router docs pattern exactly
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie"); //TODO un-used?
  const cookie = (await parseUserPrefs(request)) || {};

  return {
    showBanner: cookie.showBanner !== false  // Default to true if not set
  };
}

// 🎯 ACTION - Following React Router docs pattern exactly
export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie"); //TODO un-used?
  const cookie = (await parseUserPrefs(request)) || {};
  const bodyParams = await request.formData();

  if (bodyParams.get("bannerVisibility") === "hidden") {
    cookie.showBanner = false;
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await serializeUserPrefs(cookie),
    },
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const [breakChild, setBreakChild] = useState(false);

  return (
    <div>
      {/* 🎯 BANNER - Exact React Router docs pattern */}
      {loaderData.showBanner ? (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white mb-6">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">

              {/* Banner Content */}
              <div className="flex items-center space-x-4">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-bold text-lg">
                    Winter Sale - Up to 70% Off!
                  </div>
                  <div className="text-sm opacity-90">
                    Check out the items we currently have on sale
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <Link
                  to="/shop"
                  className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Don't miss our sale!
                </Link>

                {/* Dismiss Form - Exact docs pattern */}
                <Form method="post">
                  <input
                    type="hidden"
                    name="bannerVisibility"
                    value="hidden"
                  />
                  <button
                    type="submit"
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    title="Hide banner for one week"
                  >
                    ✕ Hide
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Welcome to React Router 7
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          This is the MAIN home page (_index.tsx) with Tailwind CSS v4 and React Router cookies!
        </p>

        {/* Success indicators */}
        <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-blue-800">
            SUCCESS: Tailwind CSS is working! The navigation and this box are styled.
          </p>
        </div>

        {/* Cookie demo info */}
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800">
            <strong>🍪 NEW:</strong> Cookie-based banner dismissal working!
            {loaderData.showBanner ? (
              <span> Banner is currently <strong>visible</strong>.</span>
            ) : (
              <span> Banner is currently <strong>hidden</strong> (cookie remembered your preference).</span>
            )}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded border border-green-300">
            <h3 className="font-bold text-green-800">Routing Works</h3>
            <p className="text-green-700">File-based routing is active</p>
          </div>
          <div className="bg-purple-100 p-4 rounded border border-purple-300">
            <h3 className="font-bold text-purple-800">Tailwind Works</h3>
            <p className="text-purple-700">Styles are loading properly</p>
          </div>
          <div className="bg-orange-100 p-4 rounded border border-orange-300">
            <h3 className="font-bold text-orange-800">Cookies Work</h3>
            <p className="text-orange-700">Banner state persisted!</p>
          </div>
        </div>

        {/* Debug section for cookies */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🍪 Cookie Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Banner visible:</strong> {loaderData.showBanner ? "Yes" : "No"}</p>
            <p><strong>How it works:</strong></p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Cookie name: <code className="bg-gray-200 px-1 rounded">user-prefs</code></li>
              <li>When you click "Hide", it sets <code className="bg-gray-200 px-1 rounded">showBanner: false</code></li>
              <li>Refresh the page - preference is remembered!</li>
              <li>Cookie expires in 1 week (604,800 seconds)</li>
            </ul>
            {!loaderData.showBanner && (
              <div className="mt-4">
                <Form method="post">
                  <input type="hidden" name="bannerVisibility" value="visible" />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    🔄 Show Banner Again (for testing)
                  </button>
                </Form>
              </div>
            )}
          </div>
        </div>

        {/* Error boundary test */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Error Boundary Test</h2>
          <button
            onClick={() => setBreakChild(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-4"
          >
            Break Child Component
          </button>
          <ProblematicChild shouldBreak={breakChild} />
        </div>
      </div>
    </div>
  );
}

function ProblematicChild({ shouldBreak }: { shouldBreak: boolean; }) {
  if (shouldBreak) {
    throw new Error("Child component error!");
  }
  return <div>Child is working fine</div>;
}