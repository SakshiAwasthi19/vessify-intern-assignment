# Vessify Internship Assignment - Transaction Extractor

A robust full-stack application for parsing and managing financial transactions from bank statements. Built with modern web technologies, this project demonstrates a secure, high-performance architecture for data extraction and financial tracking.

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Framework:** [Hono](https://hono.dev/) (Lightweight, Edge-ready)
- **Runtime:** Node.js (with TSX)
- **Database Helper:** [Prisma ORM](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Testing:** Jest + Supertest

## ✨ Features Implemented

1.  **Secure Authentication**
    *   Email/Password Registration & Login
    *   JWT-based session management
    *   Secure token handling (HTTP-only cookies & headers)
    *   Organization/Workspace support (via Better Auth plugins)

2.  **Transaction Parsing Engine**
    *   Extracts structured data from raw bank statement text
    *   Regex-based parsing for Dates, Descriptions, Amounts, and Balances
    *   Robust error handling for malformed input

3.  **Interactive Dashboard**
    *   Real-time transaction extraction
    *   Cursor-based pagination (Infinite scroll/Load more)
    *   Responsive data table with currency formatting
    *   Transaction history view

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- PostgreSQL Database
- VS Code (Recommended)

### 1. Clone & Install
```bash
git clone <repository-url>
cd vessify-intern-assignment

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Database Setup
Ensure your PostgreSQL server is running. Then configure the backend:

```bash
cd backend
# Create .env file (see Environment Variables section)
# Run migrations
npx prisma migrate dev --name init
```

### 3. Running the App
You need to run both frontend and backend concurrently.

**Backend (Port 3001)**
```bash
cd backend
npm run dev
```

**Frontend (Port 3000)**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/vessify_db?schema=public"
BETTER_AUTH_SECRET="your_very_long_random_secret_string"
BETTER_AUTH_URL="http://localhost:3001" 
```

Create a `.env.local` file in the `frontend` directory:

```env
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

## 👥 Test User Credentials

You can use these credentials to log in or register new users on the platform.

| Role | Email | Password |
|------|-------|----------|
| **User 1** | `demo@example.com` | `password123` |
| **User 2** | `test@vessify.com` | `securePass!789` |

## 📡 API Endpoints Documentation

### Authentication (`/api/auth/*`)
*   `POST /sign-up/email`: Register a new user
*   `POST /sign-in/email`: Log in with email/password
*   `GET /session`: Get current user session
*   `GET /token`: Retrieve current JWT token
*   `POST /sign-out`: Logout

### Transactions (`/api/transactions`)
*   `GET /`: List transactions (Cursor pagination supported)
    *   Query Params: `cursor` (optional), `limit` (default 10)
*   `POST /extract`: Parse and save raw transaction text
    *   Body: `{ "text": "Raw bank statement string..." }`

## 🧪 Testing Instructions

The project includes unit and integration tests for the backend.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Key Test Files:**
*   `backend/tests/parser.test.ts`: Validates regex parsing logic
*   `backend/tests/isolation.test.ts`: Tests transaction list API response structure

## 📂 Project Structure

```
.
├── backend/
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── lib/            # Shared utilities (Auth, DB, Parser)
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API Route definitions
│   │   └── index.ts        # App entry point
│   └── tests/              # Jest test suites
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # API client & helpers
│   └── public/             # Static assets
│
└── README.md
```

## 📸 Screenshots

| Dashboard View | Transaction Parsing |
|:---:|:---:|
| ![Dashboard Mockup](https://placehold.co/600x400?text=Dashboard+View) | ![Parsing Demo](https://placehold.co/600x400?text=Parsing+Result) |

---
*Built for Vessify Internship Assignment*