# NinjaIT Frontend

Modern, responsive frontend for NinjaIT platform built with Next.js 14 and Ant Design 5.

## 🚀 Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **UI Library**: Ant Design 5.19+
- **Language**: TypeScript 5.5+
- **State Management**: Zustand 4.5+
- **API Client**: Axios
- **Icons**: Ant Design Icons
- **Charts**: Recharts

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏃 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   └── theme.ts        # Ant Design theme
│   ├── store/              # Zustand stores
│   │   └── auth.ts         # Auth state management
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## 🎨 Features

### Authentication
- ✅ Login with email/password
- ✅ User registration
- ✅ JWT token management
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Logout functionality

### Dashboard
- ✅ Modern sidebar navigation
- ✅ Responsive layout
- ✅ Real-time statistics
- ✅ System health monitoring
- ✅ Alert notifications
- ✅ User profile dropdown

### UI/UX
- ✅ Clean, modern design
- ✅ Fully responsive
- ✅ Dark mode sidebar
- ✅ Ant Design components
- ✅ Smooth animations
- ✅ Professional typography

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Access token stored in localStorage
3. All API calls include Bearer token
4. Token automatically refreshed on expiry
5. Protected routes check authentication
6. User redirected to login if unauthorized

## 🎨 Theme

The app uses a custom Ant Design theme with:
- Primary color: `#1890ff` (Professional blue)
- Clean, modern components
- Consistent spacing and typography
- Responsive breakpoints

## 📱 Pages

- `/` - Home (redirects to dashboard/login)
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/devices` - Device management (TBD)
- `/dashboard/alerts` - Alert management (TBD)
- `/dashboard/reports` - Reports (TBD)
- `/dashboard/settings` - Settings (TBD)

## 🔄 State Management

Using Zustand for lightweight state management:

```typescript
import { useAuthStore } from '@/store/auth'

// In component
const { user, login, logout } = useAuthStore()
```

## 📡 API Integration

API client configured with:
- Base URL from environment
- Automatic auth token injection
- Token refresh on 401
- Error handling
- Type-safe requests

## 🚧 Development Status

- ✅ Authentication system
- ✅ Dashboard layout
- ✅ Protected routes
- ✅ API integration
- ✅ State management
- ⏳ Device management
- ⏳ Alert system
- ⏳ Reporting
- ⏳ Settings

## 📝 License

MIT License - see LICENSE file for details
