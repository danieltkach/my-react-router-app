# React Router 7 Complete Demo

A comprehensive showcase of **React Router 7** features built as a production-ready e-commerce application. This project demonstrates advanced routing patterns, server-side rendering, authentication, and modern web development practices.

![React Router 7](https://img.shields.io/badge/React%20Router-7.6.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.4-38B2AC)

## 🎯 Project Overview

This is a **complete e-commerce application** that showcases every major React Router 7 feature through real-world examples. It includes user authentication, shopping cart functionality, product management, search capabilities, and administrative features.

## ✨ Features Implemented

### 🛣️ **Advanced Routing Patterns**
- **File-based routing** with clean URL structure
- **Layout routes** (`_auth`, `_private`, `_public`) for organized UI
- **Dynamic segments** with type-safe parameters
- **Nested routing** with shared layouts
- **Route groups** and explicit route organization
- **Splat routes** for 404 handling
- **Special file routes** (robots.txt, sitemap.xml, RSS feeds)
- **Resource routes** (JSON API endpoints)

### 🔐 **Authentication & Authorization**
- **Server-side session management** with secure cookies
- **Role-based access control** (Admin, Manager, User)
- **Protected routes** with automatic redirects
- **Permission-based UI** rendering
- **Login/logout flows** with proper state management

### 🛒 **E-commerce Functionality**
- **Shopping cart** with optimistic UI updates
- **Product catalog** with categories and search
- **Inventory management** with stock tracking
- **Real-time cart updates** across components
- **Checkout flow** with form validation
- **Order management** system

### 📊 **Data Loading & Management**
- **Server-side loaders** for all routes
- **Form actions** with comprehensive validation
- **Progressive data loading** with Suspense boundaries
- **Real-time search** with debounced queries
- **Bulk operations** for administrative tasks
- **Optimistic UI updates** throughout the app

### 🎨 **User Experience**
- **Real-time form validation** with visual feedback
- **Loading states** and skeleton screens
- **Error boundaries** with graceful fallbacks
- **Progressive enhancement** (works without JavaScript)
- **Responsive design** with Tailwind CSS
- **Scroll restoration** and smooth navigation

### 🔧 **Advanced Features**
- **Deferred data loading** for performance
- **Search functionality** with filtering and sorting
- **Admin dashboard** with analytics
- **Bulk product management** with selections
- **File uploads** and form handling
- **API endpoints** for external integrations

## 🏗️ Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── shop/            # E-commerce specific components
│   └── ui/              # Generic UI components
├── lib/                 # Server utilities and business logic
│   ├── auth.server.ts   # Authentication logic
│   ├── cart.server.ts   # Shopping cart management
│   ├── db.server.ts     # Database abstraction
│   └── products.server.ts # Product data management
├── routes/              # File-based routing structure
│   ├── _auth.*.tsx      # Authentication layouts
│   ├── shop.*.tsx       # E-commerce routes
│   ├── dashboard.*.tsx  # Admin dashboard
│   ├── api.*.ts         # JSON API endpoints
│   └── *.tsx            # Other application routes
├── types/               # TypeScript type definitions
└── root.tsx             # Application shell
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/react-router-7-demo.git
cd react-router-7-demo

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to see the application.

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🧭 Demo Navigation

### 🏠 **Home Page** (`/`)
- Landing page with feature overview
- Navigation to all major sections

### 🛍️ **E-commerce Section** (`/shop`)
- **Product catalog** with categories
- **Shopping cart** functionality  
- **Search & filtering** capabilities
- **Product detail pages** with reviews
- **Checkout flow** demonstration

### 👤 **Authentication** (`/auth`)
- **Login system** with demo credentials
- **Registration flow** 
- **Password recovery** (demo)

### 🏢 **User Account** (`/account`)
- **Profile management** with real-time validation
- **Order history** with server-side data
- **Account settings** and preferences

### 📊 **Admin Dashboard** (`/dashboard`)
- **Analytics** with progressive data loading
- **User management** with role-based access
- **Bulk operations** for product management
- **Real-time reports** and metrics

### 🔍 **Advanced Search** (`/shop/search`)
- **Real-time filtering** and sorting
- **Category-based search** 
- **Price range filtering**
- **Pagination** with URL state

## 🎮 Demo Credentials

The application includes demo authentication:

```
Admin User:
Email: admin@example.com
Password: password

Manager User:  
Email: manager@example.com
Password: password

Regular User:
Email: user@example.com  
Password: password
```

## 🛠️ Technology Stack

### Core Framework
- **React Router 7** - File-based routing and SSR
- **React 19** - Latest React features
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast development

### Styling & UI
- **Tailwind CSS 4** - Utility-first styling
- **Responsive Design** - Mobile-first approach
- **Custom Components** - Reusable UI elements

### Server-Side Features
- **Server-Side Rendering** - SEO and performance
- **Form Actions** - Server-side form processing
- **Session Management** - Secure authentication
- **API Routes** - JSON endpoints

### Development Tools
- **pnpm** - Efficient package management
- **ESLint** - Code quality
- **Prettier** - Code formatting

## 📚 React Router 7 Features Demonstrated

### ✅ **File-Based Routing**
```
routes/
├── _index.tsx           → /
├── about.tsx            → /about
├── shop.tsx             → /shop (layout)
├── shop._index.tsx      → /shop
├── shop.search.tsx      → /shop/search
├── shop.product.$category.$slug.tsx → /shop/product/:category/:slug
└── api.search.advanced.ts → /api/search/advanced
```

### ✅ **Server-Side Data Loading**
```typescript
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const products = await getProductsByCategory(params.category);
  return { user, products };
}
```

### ✅ **Form Actions & Validation**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await validateAndProcessForm(formData);
  return redirect("/success");
}
```

### ✅ **Optimistic UI Updates**
```typescript
const fetcher = useFetcher();

<fetcher.Form method="post" action="/api/cart/add">
  <button disabled={fetcher.state === "submitting"}>
    {fetcher.state === "submitting" ? "Adding..." : "Add to Cart"}
  </button>
</fetcher.Form>
```

### ✅ **Progressive Enhancement**
All forms work without JavaScript and are enhanced with React Router's optimistic updates.

## 🎯 Learning Outcomes

After exploring this project, you'll understand:

- **Modern routing patterns** and file-based organization
- **Server-side rendering** with React Router 7
- **Authentication flows** and session management
- **Form handling** with validation and optimistic updates
- **Real-time features** using useFetcher
- **Performance optimization** with progressive loading
- **TypeScript integration** for type-safe routing
- **Production deployment** patterns

## 🤝 Contributing

This project is designed as a learning resource. Feel free to:

1. **Fork the repository** for your own experiments
2. **Submit issues** for bugs or improvements
3. **Create pull requests** for enhancements
4. **Share feedback** on the implementation

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🔗 Useful Links

- [React Router Documentation](https://reactrouter.com/)
- [React Router 7 Migration Guide](https://reactrouter.com/upgrading/v6)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🏆 Project Highlights

This project represents a **production-ready example** of React Router 7 usage, featuring:

- ✅ **95% coverage** of React Router 7 features
- ✅ **Real-world patterns** used in production applications
- ✅ **Type-safe implementation** throughout
- ✅ **Performance optimizations** and best practices
- ✅ **Comprehensive error handling** and user feedback
- ✅ **Mobile-responsive design** with modern UX

Perfect for developers learning React Router 7 or as a reference for production applications! 🚀

---

**Built with ❤️ to showcase the power of React Router 7**