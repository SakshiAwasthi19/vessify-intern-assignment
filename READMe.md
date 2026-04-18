# Vessify - Universal Transaction Parser

A robust full-stack application for parsing and managing financial transactions from bank statements. Built with modern web technologies, this project demonstrates a secure, high-performance architecture for data extraction and financial tracking.

---

## 🔗 Live Demo

- **Frontend:** https://vessify-frontend.vercel.app
- **Backend API:** https://vessify-backend-9oi4.onrender.com

---

## ✨ Features

✅ **Universal Parser:** Handles ANY transaction format with 40+ built-in patterns  
✅ **Smart Pattern Support:** UPI, Credit Cards, ATM, Bank Transfers, Salary, International  
✅ **Organization Isolation:** Multi-tenancy with secure workspace separation  
✅ **Smart Validation:** Amount validation with confidence scoring (0-100)  
✅ **Efficient Pagination:** Cursor-based loading for large transaction histories  
✅ **Secure Authentication:** Full auth powered by Better Auth with JWT sessions  

---

## 🧪 Supported Transaction Formats

### ✅ Works With:
- **UPI Payments:** PhonePe, GPay, PayTM, any UPI app
- **Credit Card Statements:** HDFC, Axis, ICICI, SBI, etc.
- **ATM Withdrawals:** All major banks
- **Bank Transfers:** NEFT, IMPS, RTGS
- **Salary Credits:** Direct deposits
- **International Transactions:** USD, EUR, etc.

### 📋 Example Formats:

**UPI:**
```
You sent ₹500 to merchant@paytm on 28-Feb-2026
Avl Bal: ₹12,340
```

**Credit Card:**
```
HDFC CC: SWIGGY BANGALORE 27/02/26 Rs.850.00 debited
Avl Limit 45000
```

**ATM Withdrawal:**
```
ATM Withdrawal ₹2000 on 28-FEB-2026
Remaining Bal ₹15500
```

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Language:** TypeScript

### Backend
- **Framework:** Hono (lightweight & fast)
- **Runtime:** Node.js (v20+)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Better Auth
- **Testing:** Jest + Supertest

---

## 📦 Local Development Setup

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v14 or higher)
- npm or pnpm
- Git

### 1. Clone Repository

```bash
git clone https://github.com/SakshiAwasthi19/vessify-intern-assignment.git
cd vessify-intern-assignment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# (See Environment Variables section below)

# Sync database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with backend URL
# (See Environment Variables section below)
```

### 4. Run the Application

**Terminal 1 - Backend (Port 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

**Open your browser:** http://localhost:3000

---

## 🔐 Environment Variables

### Backend Environment (`backend/.env`)

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/vessify_db?schema=public"

# Authentication Secret (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
BETTER_AUTH_SECRET="your_random_32_character_secret_string_here"

# Backend URL
BETTER_AUTH_URL="http://localhost:3001"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment (`frontend/.env.local`)

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 📡 API Endpoints

### Authentication (`/api/auth/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login with credentials |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/sign-out` | Logout user |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (with pagination) |
| POST | `/api/transactions/extract` | Parse & save transaction |

**Query Parameters (GET):**
- `cursor` (optional): Cursor for pagination
- `limit` (default: 10): Number of results

**Request Body (POST /extract):**
```json
{
  "text": "Raw bank statement text here..."
}
```

---

## 🧪 Testing

The project includes comprehensive backend tests.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Suites:

- `parser.test.ts` - Universal parser validation (40+ format tests)
- `isolation.test.ts` - Multi-tenancy data isolation tests
- `auth.test.ts` - Authentication flow tests

---

## 📂 Project Structure

```
vessify-intern-assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration files (documentation)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts            # Better Auth configuration
│   │   │   ├── db.ts              # Prisma client
│   │   │   └── parser.ts          # Universal transaction parser
│   │   ├── middleware/
│   │   │   └── auth.ts            # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     # Auth endpoints
│   │   │   └── transactions.routes.ts  # Transaction endpoints
│   │   ├── app.ts                 # Hono app configuration
│   │   └── index.ts               # Server entry point
│   ├── tests/                     # Jest test suites
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Auth pages (login, register)
│   │   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   └── layout.tsx         # Root layout
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   └── ...                # Custom components
│   │   └── lib/                   # Utilities & API client
│   └── package.json
│
└── README.md
```

---

## 🚀 Production Deployment

### Backend Deployment (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install && npx prisma db push --accept-data-loss --skip-generate && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Set all variables from `.env` (use Render's PostgreSQL for `DATABASE_URL`)

### Frontend Deployment (Vercel)

1. Import your GitHub repository on Vercel
2. **Framework Preset:** Next.js
3. **Root Directory:** `frontend`
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
5. Deploy!

---

## 👤 Getting Started (Quick Guide)

1. **Visit:** http://localhost:3000 (or your production URL)
2. **Register** a new account
3. **Login** with your credentials
4. **Paste a transaction** in any format:
   - `You sent ₹500 to John on 28-Feb-2026. Bal: ₹12,340`
   - `SWIGGY BANGALORE Rs.850 debited on 27/02/26`
   - `ATM Withdrawal ₹2000 on 28-FEB-2026 Bal ₹15500`
5. **View** your parsed transactions with confidence scores!

---

## 🔒 Security Features

- ✅ **Multi-Tenancy:** Organization-level data isolation (each user's data is completely separate)
- ✅ **JWT Authentication:** Secure token-based auth with 7-day expiry
- ✅ **Password Hashing:** Automatic via Better Auth (bcrypt)
- ✅ **Authorization:** All queries scoped to user's organization
- ✅ **CORS Protection:** Configured for specific domains only
- ✅ **Input Validation:** Comprehensive pattern matching and sanitization

---

## 📊 Database Schema

```prisma
model User {
  id            String   @id
  email         String   @unique
  // ... authentication fields
  transactions  Transaction[]
  memberships   OrganizationMember[]
}

model Organization {
  id        String   @id
  name      String
  slug      String?  @unique
  // ... multi-tenancy
  members      OrganizationMember[]
  transactions Transaction[]
}

model Transaction {
  id               String   @id @default(cuid())
  organizationId   String   // CRITICAL: Isolation key
  userId           String
  
  rawText          String   // Original pasted text
  transactionDate  DateTime?
  description      String
  amount           Decimal
  balance          Decimal?
  confidenceScore  Float    // 0-100
  
  createdAt        DateTime @default(now())
  // ... relations & indexes
}
```

**Key Design Decision:** Every transaction is scoped to `organizationId` ensuring complete data isolation between users.

---

## 🎯 Confidence Scoring

Each parsed transaction receives a confidence score (0-100):

| Score | Interpretation |
|-------|---------------|
| 90-100 | ✅ High confidence - All fields extracted correctly |
| 70-89 | 🟢 Good confidence - Minor ambiguities |
| 50-69 | 🟡 Medium confidence - Some fields missing/uncertain |
| <50 | 🔴 Low confidence - Manual review recommended |

**Formula:**
- Date found: +25 points
- Amount found: +30 points
- Description found: +20 points
- Balance found: +15 points
- Type determined: +10 points
- Bonuses: Recent date (+5), Reasonable amount (+5)

---

## 🛠️ Technology Choices Explained

### Why Hono?
- Lightweight (~20KB) and extremely fast
- TypeScript-first with excellent type inference
- Perfect for serverless/edge deployments
- Cleaner API than Express

### Why Better Auth?
- Modern, type-safe authentication
- Built-in organization/team support (multi-tenancy)
- JWT + session management out of the box
- Active development and great documentation

### Why Prisma?
- Type-safe database queries
- Excellent TypeScript integration
- Easy schema migrations
- Great developer experience

### Why db push for Production?
- Reliable schema synchronization
- No Shell access needed (works on free tier)
- Simple deployment workflow
- Easy to switch to migrations when scaling

---

## 🤝 Contributing

This is an internship assignment project. For educational purposes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👩💻 Author

**Sakshi Awasthi**

- GitHub: [@SakshiAwasthi19](https://github.com/SakshiAwasthi19)
- Project: Vessify Internship Assignment

---

## 🙏 Acknowledgments

Built as part of the Vessify internship program, demonstrating:

- ✅ Full-stack development expertise (Hono, Next.js 15, PostgreSQL)
- ✅ Production deployment experience (Render, Vercel)
- ✅ Database design & optimization (Prisma, multi-tenancy)
- ✅ Security best practices (Better Auth, data isolation)
- ✅ Testing & quality assurance (Jest, integration tests)
- ✅ Advanced pattern matching (40+ transaction formats)

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Hono Documentation](https://hono.dev)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 🐛 Known Issues & Future Improvements

### Potential Enhancements:
- [ ] AI-powered description extraction for edge cases
- [ ] Transaction categorization (food, transport, shopping, etc.)
- [ ] Monthly spending reports & analytics
- [ ] Budget tracking & alerts
- [ ] Export to CSV/PDF
- [ ] Multi-currency support with conversion
- [ ] Receipt image upload & OCR parsing
- [ ] Recurring transaction detection

---

**Built with ❤️ for financial transparency and automation**