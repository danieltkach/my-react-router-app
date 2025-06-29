# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `pnpm dev` - Start development server (http://localhost:5173)
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking (includes route type generation)
- `pnpm test` - Run tests with Vitest
- `pnpm test:run` - Run tests once
- `pnpm test:watch` - Run tests in watch mode

### Test Configuration
- Uses Vitest with jsdom environment
- Test files: `app/**/*.{test,spec}.{js,ts,jsx,tsx}`
- Setup file: `test-setup.ts`
- Test configuration: `vitest.config.test.ts`

## Architecture Overview

### React Router 7 Application
This is a production-ready e-commerce demo built with React Router 7, showcasing advanced routing patterns, authentication, and modern web development practices.

### Key Technologies
- **React Router 7** with file-based routing and SSR
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Vite** for build tooling
- **Vitest** for testing
- **bcryptjs** for password hashing

### Authentication System
The application uses a dual authentication system:
- **V1 Auth** (`app/lib/auth.server.ts`) - Legacy system
- **V2 Auth** (`app/lib/auth-v2.server.ts`) - Enhanced production system with:
  - Role-based access control (admin, manager, user)
  - Session management with `session-v2.server.ts`
  - Security hardening with rate limiting and CSRF protection
  - Audit logging and security monitoring

### File Structure Patterns

#### Routes (`app/routes/`)
- **Layout routes**: `_auth.tsx`, `_private.tsx`, `_public.tsx`
- **Nested routes**: `shop.product.$category.$slug.tsx`
- **API routes**: `api.*.ts` files for JSON endpoints
- **Special routes**: `robots[.]txt.tsx`, `sitemap[.]xml.tsx`

#### Server Libraries (`app/lib/`)
- **Authentication**: `auth-v2.server.ts` (preferred), `auth.server.ts` (legacy)
- **Cart management**: `cart-v2.server.ts`, `cart.server.ts`
- **Session handling**: `session-v2.server.ts`, `session.server.ts`
- **Security**: `security.server.ts` - rate limiting, CSRF, validation
- **Database**: `db.server.ts` - data persistence layer
- **Validation**: `validation.server.ts` - form and data validation

#### Components (`app/components/`)
- **Shop components**: `components/shop/` - e-commerce specific UI
- **UI components**: `components/ui/` - reusable UI elements

### Data Loading Patterns
- Server-side loaders for all routes with proper error handling
- Form actions with comprehensive validation
- Optimistic UI updates using `useFetcher`
- Progressive data loading with Suspense boundaries

### Security Features
- **V2 Security System**: Production-ready security hardening
- **Rate limiting**: Login attempts and general API usage
- **CSRF protection**: Token-based validation
- **Session security**: Secure cookies with expiration
- **Role-based permissions**: Admin, manager, user access levels
- **Audit logging**: Security event tracking

### Demo Credentials
```
Admin: admin@example.com / password
Manager: manager@example.com / password  
User: user@example.com / password
```

### Configuration Files
- `react-router.config.ts` - React Router configuration (SSR enabled)
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `routes.ts` - Route file patterns and ignoring rules

### Development Notes
- The application is migrating from V1 to V2 authentication system
- V2 systems are preferred for new development
- All server functions should use `.server.ts` suffix
- Routes support both SSR and progressive enhancement
- Type safety is enforced throughout with TypeScript