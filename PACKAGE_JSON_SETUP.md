# Package.json Setup Guide

## ✅ Complete Package.json Files

### Backend (`backend/package.json`)

**Key Dependencies:**
- `better-auth`: ^1.4.10 - Authentication library (latest stable)
- `hono`: ^4.6.11 - Web framework
- `@hono/node-server`: ^1.12.0 - Node.js server adapter for Hono
- `@prisma/client`: ^6.1.0 - Prisma ORM client
- `dotenv`: ^16.4.7 - Environment variables

**Key Dev Dependencies:**
- `prisma`: ^6.1.0 - Prisma CLI (dev dependency)
- `typescript`: ^5.7.2 - TypeScript compiler
- `tsx`: ^4.19.2 - TypeScript execution (for dev server)
- `jest`: ^29.7.0 - Testing framework
- `ts-jest`: ^29.2.5 - Jest TypeScript transformer
- `@types/*`: Type definitions

**Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

---

### Frontend (`frontend/package.json`)

**Key Dependencies:**
- `next`: 15.1.6 - Next.js 15 framework
- `react`: 19.0.0 - React 19
- `react-dom`: 19.0.0 - React DOM
- `better-auth`: ^1.4.10 - Better Auth (client-side API for React)
- `@radix-ui/*`: Radix UI components (for shadcn/ui)
- `class-variance-authority`: ^0.7.1 - For component variants
- `clsx`: ^2.1.1 - Conditional class names
- `tailwind-merge`: ^2.6.0 - Merge Tailwind classes
- `lucide-react`: ^0.468.0 - Icon library

**Key Dev Dependencies:**
- `tailwindcss`: ^4.0.0 - Tailwind CSS v4
- `@tailwindcss/postcss`: ^4.0.1 - Tailwind PostCSS plugin
- `autoprefixer`: ^10.4.20 - CSS autoprefixer
- `postcss`: ^8.4.49 - PostCSS
- `typescript`: ^5.7.2 - TypeScript
- `eslint-config-next`: 15.1.6 - Next.js ESLint config

**Scripts:**
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## 📦 Installation Commands

### Backend Installation

```bash
cd backend
npm install
```

**What gets installed:**
- All dependencies listed in `dependencies` and `devDependencies`
- Prisma client will be generated after installation (run `npm run prisma:generate`)

### Frontend Installation

```bash
cd frontend
npm install
```

**What gets installed:**
- All dependencies for Next.js 15, React 19, shadcn/ui components
- Tailwind CSS v4 and PostCSS
- TypeScript and type definitions

---

## 🔧 Post-Installation Steps

### Backend

1. **Generate Prisma Client:**
   ```bash
   cd backend
   npm run prisma:generate
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example.txt .env
   # Edit .env with your values
   ```

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

### Frontend

1. **Set up environment variables:**
   ```bash
   cd frontend
   # Create .env.local with:
   # NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

2. **Initialize shadcn/ui (if needed):**
   ```bash
   npx shadcn@latest init
   ```

---

## 📋 Version Notes

### Backend Versions
- **better-auth**: ^1.4.10 (latest stable version)
- **hono**: ^4.11.3 (latest stable, fast web framework)
- **@prisma/client**: ^6.1.0 (latest Prisma 6)
- **TypeScript**: ^5.7.2 (latest TypeScript 5)

### Frontend Versions
- **next**: 15.1.6 (Next.js 15 as requested)
- **react**: 19.0.0 (React 19 as requested)
- **better-auth**: ^1.4.10 (Better Auth client - used for React integration)
- **tailwindcss**: ^4.0.0 (Tailwind CSS v4)

---

## ⚠️ Important Notes

1. **Type: "module"** - Backend uses ES modules (required for Hono and Better Auth)
2. **No bcrypt needed** - Better Auth handles password hashing internally
3. **Prisma as devDependency** - Prisma CLI is only needed during development
4. **shadcn/ui** - Components are installed via `npx shadcn@latest add [component]` when needed
5. **Next.js 15** - Uses App Router by default (as required)

---

## ✅ Verification

After installation, verify everything works:

**Backend:**
```bash
cd backend
npm run dev
# Should start server on port 3001 (or configured port)
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should start Next.js on port 3000
```

---

## 🚀 Next Steps

1. Install dependencies in both backend and frontend
2. Set up environment variables
3. Run Prisma migrations
4. Start building the API endpoints
5. Start building the frontend pages
