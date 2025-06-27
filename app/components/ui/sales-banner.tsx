// app/components/ui/sales-banner.tsx - Following React Router docs example
import { Link, Form } from "react-router";

interface SalesBannerProps {
  showBanner: boolean;
}

export function SalesBanner({ showBanner }: SalesBannerProps) {
  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Banner Content */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-bold text-lg">
                Winter Sale - Up to 70% Off!
              </div>
              <div className="text-sm opacity-90">
                Limited time offer on electronics, clothing, and home goods
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">

            {/* Link to sale (docs example) */}
            <Link
              to="/shop/category/electronics"
              className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Sale →
            </Link>

            {/* Dismiss Button (exact docs pattern) */}
            <Form method="post" action="/" className="inline">
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
  );
}

// 🎯 Newsletter Banner (additional example)
interface NewsletterBannerProps {
  showBanner: boolean;
}

export function NewsletterBanner({ showBanner }: NewsletterBannerProps) {
  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-3">
            <div className="text-lg">📧</div>
            <span className="text-sm">
              Get 10% off your first order! Subscribe to our newsletter.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/newsletter"
              className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </Link>

            <Form method="post" action="/" className="inline">
              <input
                type="hidden"
                name="bannerVisibility"
                value="newsletter-hidden"
              />
              <button
                type="submit"
                className="text-white/80 hover:text-white text-sm"
                title="Hide newsletter banner"
              >
                ✕
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 Cookie Consent Banner (practical example)
interface CookieBannerProps {
  showBanner: boolean;
}

export function CookieBanner({ showBanner }: CookieBannerProps) {
  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-3">
            <div className="text-lg">🍪</div>
            <div className="text-sm">
              We use cookies to improve your experience. By continuing to use our site, you accept our cookie policy.
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/privacy"
              className="text-gray-300 hover:text-white text-sm underline"
            >
              Learn More
            </Link>

            <Form method="post" action="/" className="inline">
              <input
                type="hidden"
                name="bannerVisibility"
                value="cookie-accepted"
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Accept Cookies
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
