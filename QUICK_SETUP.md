# Quick Setup - Copy & Paste Commands

## ⚠️ Windows Users
If you're on Windows PowerShell, some commands may need adjustment. Use Git Bash or WSL for best compatibility.

---

## STEP 1: Root Setup

```bash
# Navigate to project folder
cd vessify-intern-assignment

# Create root package.json
npm init -y

# Edit package.json to add workspaces (or use the file we created)
# Then install concurrently
npm install --save-dev concurrently
```

**Or manually create root package.json:**
```json
{
  "name": "vessify-intern-assignment",
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ],
  "scripts": {
    "dev:backend": "npm run dev --workspace backend",
    "dev:frontend": "npm run dev --workspace frontend",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "test": "npm run test --workspace backend",
    "build": "npm run build --workspace backend && npm run build --workspace frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## STEP 2: Backend Setup

```bash
# Create backend folder
mkdir backend
cd backend

# Copy the package.json we created (or create it manually)
# Then install dependencies
npm install

# Initialize TypeScript
npx tsc --init

# Create tsconfig.json (replace the generated one)
# Copy from backend/tsconfig.json in our project

# Create folder structure
mkdir -p src/routes src/lib src/middleware tests prisma

# Initialize Prisma
npx prisma init

# Copy our schema.prisma to prisma/schema.prisma
# Copy our env.example.txt to backend/

# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate -- --name init

cd ..
```

---

## STEP 3: Frontend Setup

```bash
# Create Next.js app (this will create frontend folder)
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd frontend

# Update package.json with our dependencies
# Copy from frontend/package.json in our project
# Then install
npm install

# Initialize shadcn/ui
npx shadcn@latest init

# Create lib/utils.ts
mkdir -p lib
# Copy lib/utils.ts from our project

# Create .env.local.example
# Copy from our project

cd ..
```

---

## STEP 4: Environment Setup

### Backend .env
```bash
cd backend
# Create .env file with:
DATABASE_URL="postgresql://postgres:password@localhost:5432/vessify_db?schema=public"
BETTER_AUTH_SECRET="your-secret-key-here-min-32-chars"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

### Frontend .env.local
```bash
cd frontend
# Create .env.local file with:
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
```

---

## STEP 5: Database Setup

```bash
# Create database (using psql)
psql -U postgres -c "CREATE DATABASE vessify_db;"

# Or use pgAdmin to create database manually

# Then run migrations
cd backend
npm run prisma:migrate
```

---

## STEP 6: Verify

```bash
# From root, test both apps
npm run dev

# Or separately:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

---

## 📋 Quick Checklist

Run these commands in order:

```bash
# 1. Root
cd vessify-intern-assignment
npm install

# 2. Backend
mkdir backend && cd backend
# Copy backend/package.json
npm install
mkdir -p src/{routes,lib,middleware} tests prisma
npx prisma init
# Copy prisma/schema.prisma
npm run prisma:generate
npm run prisma:migrate -- --name init
cd ..

# 3. Frontend
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend
# Copy frontend/package.json
npm install
npx shadcn@latest init
cd ..

# 4. Test
npm run dev
```
