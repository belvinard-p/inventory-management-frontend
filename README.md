# Inventory Pro — Inventory Management Frontend

A modern, role-based inventory management web application built with Next.js 15 and React 19. It provides a complete dashboard experience for managing articles, categories, clients, suppliers, orders, and order lines — with dedicated views per user role.

🌐 **Live Demo:** [belvi-inventory-management-phi.vercel.app](https://belvi-inventory-management-phi.vercel.app/)

---

## Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Configuration](#configuration)
8. [Security](#security)
9. [Contribution Guidelines](#contribution-guidelines)
10. [Roadmap](#roadmap)
11. [License](#license)
12. [Acknowledgements](#acknowledgements)
13. [Author](#author)

---

## About

Inventory Pro is the frontend of a full-stack inventory management system. It connects to a Spring Boot REST API backend and provides a clean, responsive dashboard for businesses to track stock, manage orders, and monitor sales activity.

The application supports four user roles — Admin, Manager, Sales, and User — each with a tailored navigation and access scope. Authentication is handled via JWT tokens with support for OAuth (Google, GitHub) through NextAuth.

---

## Features

- Role-based access control with 4 roles: Admin, Manager, Sales, User
- JWT authentication with credential login and OAuth (Google / GitHub)
- Password reset flow via email (forgot password + reset password)
- Per-role dashboards with relevant metrics and navigation
- Article management — create, read, update, delete with image upload
- Category management — organize articles by category
- Client management — track customer profiles
- Supplier management — manage supplier records
- Client order management — create and track customer orders with order lines
- Supplier order management — manage purchase orders with order lines
- Statistics dashboard (Admin only) with charts powered by Recharts
- User management — Admin can manage accounts, roles, lock/unlock users
- Company management — multi-company support
- Light / dark theme toggle
- Responsive sidebar navigation with collapsible menus
- Infinite scroll and virtual list for large datasets
- Toast notifications for all user actions
- Keyboard shortcuts support

---

## Tech Stack

**Framework & Runtime**
- Next.js 15.5.4 (App Router)
- React 19.1.0
- TypeScript 5

**UI & Styling**
- Tailwind CSS 4
- shadcn/ui (Radix UI primitives)
- Lucide React (icons)
- Framer Motion (animations)
- Recharts (charts)
- next-themes (dark/light mode)
- tw-animate-css

**Forms & Validation**
- React Hook Form 7
- Zod 4 (schema validation)
- @hookform/resolvers

**State Management & Data Fetching**
- Zustand 5 (client state — auth session)
- TanStack React Query 5 (server state, caching, mutations)

**Authentication**
- NextAuth 4 (OAuth — Google, GitHub)
- jose (JWT decoding)
- Custom JWT flow via Spring Boot backend

**HTTP Client**
- Custom `ApiClient` class (Fetch API wrapper with auth, timeout, error handling)
- Axios (used in specific service modules)

**Dev Tools**
- ESLint 9
- TypeScript compiler (`tsc --noEmit`)
- pnpm (package manager)

---

## Architecture

Inventory Pro is a Next.js App Router SPA that communicates with a Spring Boot REST API.

```
Browser
  └── Next.js 15 (App Router)
        ├── NextAuth          →  OAuth callback + session (Google, GitHub)
        ├── Zustand Store     →  JWT token + user state (sessionStorage)
        ├── TanStack Query    →  API data fetching, caching, mutations
        ├── ApiClient         →  Fetch wrapper (auth headers, timeout, errors)
        └── Spring Boot API   →  REST backend (https://new-inventory-latest.onrender.com/api/v1)
```

**Route groups:**
- `(auth)` — public routes: login, register, forgot/reset password
- `(protected)/dashboard` — authenticated routes with role-based layout
- `auth/callback` — OAuth token exchange after provider redirect

**Role routing:**
Each role gets its own dashboard path:
- `/dashboard/admin` — full access
- `/dashboard/manager` — articles, categories, clients, orders, suppliers
- `/dashboard/sales` — clients, orders, suppliers
- `/dashboard/user` — read-only articles and categories

---

## Project Structure

```
inventory-management-frontend/
├── app/
│   ├── (auth)/                   # Public auth pages (login, register, etc.)
│   ├── (protected)/dashboard/    # Protected dashboard pages per role
│   │   ├── admin/                # Admin-only pages (users, stats, companies)
│   │   ├── manager/              # Manager dashboard
│   │   ├── sales/                # Sales dashboard
│   │   └── user/                 # User dashboard
│   ├── auth/callback/            # OAuth callback handler
│   ├── layout.tsx                # Root layout (providers, toaster)
│   └── globals.css               # Global styles
├── components/
│   ├── global/                   # Shared utility components (avatar, dialogs, states)
│   ├── layout/                   # App shell (sidebar, navbar, user menu)
│   ├── modules/                  # Feature-specific components
│   │   ├── auth/                 # Login, signup, OAuth buttons, password reset
│   │   ├── dashbord/             # Dashboard views per role
│   │   ├── home/                 # Landing page sections
│   │   └── profile/              # User profile modals
│   ├── shared/dashboard/         # Reusable dashboard building blocks
│   └── ui/                       # shadcn/ui primitives
├── hooks/                        # Custom React hooks per domain
│   ├── article/
│   ├── category/
│   ├── client/
│   ├── commandes/
│   ├── supplier/
│   └── user/
├── lib/                          # Utilities and core logic
│   ├── apiClient.ts              # Fetch-based HTTP client with auth
│   ├── auth.ts                   # useAuth hook (login, logout, JWT decode)
│   ├── authService.ts            # Auth API calls (signIn, signOut, etc.)
│   ├── navigation.ts             # Role-based navigation config
│   ├── const.ts                  # TanStack Query cache keys
│   ├── env.ts                    # Environment variable loader
│   └── utils.ts                  # Shared utilities (cn, etc.)
├── provider/                     # React context providers (Query, Theme)
├── service/                      # API service modules per domain
│   ├── client/
│   ├── supplier/
│   ├── articleService.ts
│   ├── categoryService.ts
│   ├── companyService.ts
│   └── userService.ts
├── stores/
│   └── userStore.ts              # Zustand store (user, tokens, auth state)
├── types/                        # TypeScript type definitions per domain
├── public/                       # Static assets
├── next.config.ts                # Next.js configuration
├── tsconfig.json
└── package.json
```

---

## Getting Started

**Prerequisites**
- Node.js >= 20
- pnpm (recommended)
- A running instance of the [inventory management backend](https://github.com/belvinard-p) or use the hosted API

**Installation**

```bash
# Clone the repository
git clone https://github.com/belvinard-p/inventory-management-frontend.git
cd inventory-management-frontend

# Install dependencies
pnpm install
```

**Set up environment variables**

Copy the example below into a `.env.local` file at the project root:

```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://new-inventory-latest.onrender.com/api/v1
```

**Run the development server**

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

**Build for production**

```bash
pnpm build
pnpm start
```

**Type check**

```bash
pnpm type-check
```

**Test accounts (demo)**

| Role    | Username  | Password   |
|---------|-----------|------------|
| Admin   | `admin`   | `password` |
| Manager | `manager` | `password` |
| Sales   | `sales`   | `password` |

---

## Configuration

| Variable                  | Description                                      | Required |
|---------------------------|--------------------------------------------------|----------|
| `NEXTAUTH_SECRET`         | Secret key for NextAuth session signing          | Yes      |
| `NEXTAUTH_URL`            | Full URL of the app (used by NextAuth)           | Yes      |
| `NEXT_PUBLIC_BASE_URL`    | Public base URL of the frontend                  | Yes      |
| `NEXT_PUBLIC_API_URL`     | Base URL of the Spring Boot REST API             | Yes      |
| `IGNORE_ESLINT`           | Set to `true` to skip ESLint during build        | No       |
| `IGNORE_TSC`              | Set to `true` to skip TypeScript check on build  | No       |

**Notes:**
- Never commit `.env.local` or `.env` files — they are listed in `.gitignore`
- The `NEXTAUTH_SECRET` must be a long, random string (minimum 32 characters)
- For production, update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your deployed domain

---

## Security

- **HTTP security headers** are set in `next.config.ts`:
  - `Strict-Transport-Security` — enforces HTTPS with a 2-year max-age
  - `X-DNS-Prefetch-Control` — controls DNS prefetching
- **JWT tokens** are stored in `sessionStorage` via Zustand (cleared on tab close)
- **Automatic session expiry** — 401/403 responses clear the store and redirect to `/login`
- **Request timeout** — all API calls abort after 60 seconds to prevent hanging requests
- **Bearer token injection** — the `ApiClient` automatically attaches the JWT to every authenticated request
- **OAuth via NextAuth** — Google and GitHub tokens are exchanged server-side
- **No credentials in source code** — all secrets are loaded from environment variables
- **Image domains** are explicitly whitelisted in `next.config.ts` to prevent unauthorized image sources

---

## Contribution Guidelines

Contributions are welcome for bug fixes, new features, or improvements.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the existing code style — TypeScript strict mode, ESLint config is provided
4. Keep components small and focused; use the existing hook/service/type pattern
5. Add new API calls in `service/`, new hooks in `hooks/`, and new types in `types/`
6. Test your changes locally with `pnpm dev` and verify with `pnpm type-check`
7. Submit a pull request with a clear description of what changed and why

**Code conventions:**
- Use `"use client"` only when necessary (prefer server components)
- Use TanStack Query for all server state — avoid `useState` + `useEffect` for data fetching
- Use Zod schemas for all form validation
- Use the `apiClient` singleton for all HTTP calls

---

## Roadmap

**v1.0.0 — Completed**
- Role-based authentication (JWT + OAuth)
- Full CRUD for articles, categories, clients, suppliers
- Client and supplier order management with order lines
- Admin statistics dashboard
- User management (roles, lock, enable/disable)
- Light / dark theme
- Responsive sidebar with collapsible navigation

**v1.1.0 — Planned**
- Export data to PDF / Excel
- Real-time stock alerts and low-inventory notifications
- Advanced filtering and search across all tables
- Audit log for admin actions
- Mobile app (React Native)

---

## License

This project is for portfolio and demonstration purposes. All rights reserved © Belvinard Pouadjeu.

If you use this project as a reference or template, please credit the original author.

---

## Acknowledgements

- [Next.js](https://nextjs.org/) — React framework with App Router
- [shadcn/ui](https://ui.shadcn.com/) — Accessible UI component library
- [Radix UI](https://www.radix-ui.com/) — Headless UI primitives
- [TanStack Query](https://tanstack.com/query) — Powerful data fetching and caching
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight state management
- [NextAuth.js](https://next-auth.js.org/) — Authentication for Next.js
- [Recharts](https://recharts.org/) — Composable chart library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Zod](https://zod.dev/) — TypeScript-first schema validation
- [Framer Motion](https://www.framer.com/motion/) — Animation library

---

## Author

**Belvinard Pouadjeu**
Fullstack Developer & Data Engineer

- Portfolio: [belvinard-resume.netlify.app](https://belvinard-resume.netlify.app/)
- GitHub: [github.com/belvinard-p](https://github.com/belvinard-p)
- LinkedIn: [linkedin.com/in/belvinard-pouadjeu-19a734377](https://www.linkedin.com/in/belvinard-pouadjeu-19a734377)
- Email: belvinard97@gmail.com
