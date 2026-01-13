cat > README.md << 'EOF'
# Vessify Internship Assignment - Personal Finance Transaction Extractor

## 🎯 Project Overview

A secure personal finance web application that extracts structured transaction data from raw bank statement text with multi-tenancy support and strict data isolation.

## 🛠️ Tech Stack

### Backend
- **Framework:** Hono (TypeScript)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Better Auth (JWT with 7-day expiry)
- **Testing:** Jest

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Authentication:** Better Auth React Client

## ✨ Features

- ✅ Email + password authentication with JWT tokens
- ✅ Multi-tenancy using organizations/teams
- ✅ Transaction parser supporting 3 different bank statement formats
- ✅ Strict data isolation (users can only see their own transactions)
- ✅ Cursor-based pagination
- ✅ Protected API routes with middleware
- ✅ Comprehensive testing suite

## 📦 Project Structure
```
vessify-intern-assignment/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts          # Better Auth configuration
│   │   │   ├── db.ts            # Prisma client
│   │   │   └── parser.ts        # Transaction parser
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT verification middleware
│   │   ├── routes/
│   │   │   └── transactions.routes.ts
│   │   └── index.ts             # Server entry point
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── .env.local.example
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js v20+
- PostgreSQL 16+
- npm or pnpm

### 1. Clone Repository
```bash
git clone <repository-url>
cd vessify-intern-assignment
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb vessify_db

# Or using psql
psql -U postgres -c "CREATE DATABASE vessify_db;"
```

### 4. Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your values
```

**Generate secret key:**
```bash
openssl rand -base64 32
```

### 5. Run Migrations
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 6. Start Development Servers

**Option A: Run both simultaneously (from root):**
```bash
npm run dev
```

**Option B: Run separately:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 7. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Prisma Studio:** `npm run prisma:studio` (in backend/)

## 🧪 Testing
```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 👤 Test User Credentials

**User 1:**
- Email: `test1@example.com`
- Password: `SecurePass123!`

**User 2:**
- Email: `test2@example.com`
- Password: `SecurePass123!`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login user
- `GET /api/auth/get-session` - Get current session

### Transactions (Protected)
- `POST /api/transactions/extract` - Parse and save transaction
- `GET /api/transactions` - Get paginated transactions
- `GET /api/transactions/:id` - Get single transaction
- `DELETE /api/transactions/:id` - Delete transaction

## 🔧 Transaction Parser Formats

The parser supports 3 different bank statement formats:

**Format 1 (Clean):**
```
Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50
```

**Format 2 (Inline):**
```
Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50
```

**Format 3 (Compact):**
```
txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping
```

## 🛡️ Security Features

- Password hashing with bcrypt (via Better Auth)
- JWT tokens with 7-day expiry
- Data isolation by userId + organizationId
- Protected routes with middleware
- CORS configuration
- SQL injection prevention (Prisma)

## 📊 Database Schema

See `backend/prisma/schema.prisma` for complete schema.

**Key Models:**
- User (email, password, organizations)
- Organization (name, slug)
- OrganizationMember (links users to organizations)
- Transaction (date, description, amount, balance)

## 🎨 Frontend Pages

- `/login` - User login
- `/register` - User registration
- `/` - Dashboard (protected, shows transactions)

## 🚀 Deployment

### Backend (Railway/Render)
```bash
# Set environment variables on hosting platform
# Deploy backend/ folder
```

### Frontend (Vercel)
```bash
# Set environment variables on Vercel
# Deploy frontend/ folder
```

## 📄 License

This is an internship assignment project.

## 👨‍💻 Author

[Your Name]
[Your Email]

## 🙏 Acknowledgments

- Vessify team for the opportunity
- Better Auth for authentication
- Hono for the backend framework
- Next.js team for the frontend framework
EOF