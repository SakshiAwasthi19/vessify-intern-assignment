# Complete Project Setup Guide

## Prerequisites
- ✅ Node.js v20 installed
- ✅ PostgreSQL running locally
- ✅ Empty folder: `vessify-intern-assignment/`

---

## STEP 1: Root Setup

```bash
# Navigate to your project folder
cd vessify-intern-assignment

# Create root package.json with npm workspaces
cat > package.json << 'EOF'
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
EOF

# Install concurrently
npm install
```

---

## STEP 2: Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Create package.json (copy from our prepared file)
cat > package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API for Personal Finance Transaction Extractor",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "better-auth": "^1.4.10",
    "hono": "^4.11.3",
    "@hono/node-server": "^1.12.0",
    "@prisma/client": "^6.1.0",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/jest": "^29.5.14",
    "@typescript-eslint/eslint-plugin": "^8.18.1",
    "@typescript-eslint/parser": "^8.18.1",
    "eslint": "^9.18.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "prisma": "^6.1.0"
  },
  "keywords": [
    "backend",
    "api",
    "hono",
    "better-auth",
    "prisma"
  ],
  "author": "",
  "license": "ISC"
}
EOF

# Install all backend dependencies
npm install

# Create TypeScript configuration
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
EOF

# Create Jest configuration
cat > jest.config.js << 'EOF'
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
};
EOF

# Create folder structure
mkdir -p src/routes
mkdir -p src/lib
mkdir -p src/middleware
mkdir -p tests
mkdir -p prisma

# Initialize Prisma
npx prisma init

# Create Prisma schema (our corrected version)
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memberships   Membership[]
  transactions  Transaction[]

  @@index([email])
  @@map("users")
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships   Membership[]
  transactions  Transaction[]

  @@index([slug])
  @@map("organizations")
}

model Membership {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           String   @default("member")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([userId])
  @@index([organizationId])
  @@map("memberships")
}

model Transaction {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  date           DateTime
  description    String
  amount         Decimal  @db.Decimal(10, 2)
  balance        Decimal  @db.Decimal(10, 2)
  rawText        String?  @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([userId, organizationId, createdAt(sort: Desc)])
  @@index([userId])
  @@index([organizationId])
  @@index([createdAt(sort: Desc)])
  @@map("transactions")
}
EOF

# Create environment variables example
cat > env.example.txt << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vessify_db?schema=public"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-min-32-characters-long-change-in-production"
AUTH_SECRET="your-super-secret-key-min-32-characters-long-change-in-production"

# Backend URL (where your Hono server runs)
BACKEND_URL="http://localhost:3001"

# Frontend URL (for CORS and trusted origins)
FRONTEND_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
EOF

# Copy example to .env (you'll edit this)
cp env.example.txt .env

# Generate Prisma Client
npm run prisma:generate

# Create initial database migration
npm run prisma:migrate -- --name init

# Go back to root
cd ..
```

---

## STEP 3: Frontend Setup

```bash
# Create Next.js 15 app with TypeScript and Tailwind
cd frontend || npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Navigate to frontend
cd frontend

# Update package.json with our dependencies
cat > package.json << 'EOF'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "better-auth": "^1.4.10",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.5",
    "@types/react-dom": "^19.0.1",
    "@tailwindcss/postcss": "^4.0.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "eslint": "^9.18.0",
    "eslint-config-next": "15.1.6"
  },
  "keywords": [
    "frontend",
    "nextjs",
    "react",
    "shadcn",
    "better-auth"
  ],
  "author": "",
  "license": "ISC"
}
EOF

# Install dependencies
npm install

# Initialize shadcn/ui
npx shadcn@latest init -y

# Create components directory structure
mkdir -p components/ui
mkdir -p lib

# Create lib/utils.ts for shadcn
cat > lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# Create environment variables example
cat > .env.local.example << 'EOF'
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Better Auth Base URL (should match backend)
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
EOF

# Copy example to .env.local (you'll edit this)
cp .env.local.example .env.local

# Go back to root
cd ..
```

---

## STEP 4: Verify Setup

```bash
# From root directory, verify everything works

# Check backend TypeScript compilation
cd backend
npm run type-check

# Check frontend TypeScript compilation
cd ../frontend
npm run type-check

# Go back to root
cd ..

# Test running both apps (optional - press Ctrl+C to stop)
npm run dev
```

---

## STEP 5: Configure Environment Variables

### Backend (.env)
```bash
cd backend

# Edit .env file with your actual values:
# DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/vessify_db?schema=public"
# BETTER_AUTH_SECRET="generate-with: openssl rand -base64 32"
# BACKEND_URL="http://localhost:3001"
# FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```bash
cd frontend

# Edit .env.local file:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
# NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
```

---

## STEP 6: Create Database

```bash
# Connect to PostgreSQL and create database
# Option 1: Using psql command line
psql -U postgres -c "CREATE DATABASE vessify_db;"

# Option 2: Using pgAdmin or any PostgreSQL client
# Create database named: vessify_db

# Then run migrations
cd backend
npm run prisma:migrate
```

---

## ✅ Setup Complete Checklist

- [ ] Root package.json created with workspaces
- [ ] Backend folder structure created
- [ ] Backend dependencies installed
- [ ] TypeScript configured for backend
- [ ] Prisma schema created
- [ ] Database migration run successfully
- [ ] Frontend Next.js app created
- [ ] Frontend dependencies installed
- [ ] shadcn/ui initialized
- [ ] Environment variables configured
- [ ] Database created and migrated

---

## 🚀 Next Steps

1. **Start Development:**
   ```bash
   # From root directory
   npm run dev
   ```

2. **Or run separately:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

3. **Verify:**
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000
   - Prisma Studio: `cd backend && npm run prisma:studio`

---

## 📝 Notes

- **Database URL Format:** `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public`
- **Secret Key:** Generate with `openssl rand -base64 32` (min 32 characters)
- **Ports:** Backend (3001), Frontend (3000) - adjust in .env if needed
- **shadcn/ui:** Components are added with `npx shadcn@latest add [component-name]`

---

## 🐛 Troubleshooting

**Issue: Prisma migration fails**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists: `psql -U postgres -l`

**Issue: TypeScript errors**
- Run `npm install` again in the problematic workspace
- Check tsconfig.json paths

**Issue: Port already in use**
- Change ports in .env files
- Kill process: `npx kill-port 3001` or `npx kill-port 3000`

**Issue: shadcn/ui init fails**
- Make sure you're in frontend directory
- Check Tailwind CSS is properly configured
