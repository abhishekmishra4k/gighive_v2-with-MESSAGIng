# 🔐 Production-Grade State Management Guide

**Complete state management system for GigHive with persistent sessions and user management**

---

## 📋 Overview

The new state management system provides:

✅ **Persistent Sessions** - Auth state survives page refresh  
✅ **Automatic Token Management** - Token injection and refresh  
✅ **User Management** - User profiles and caching  
✅ **Role-Based Access Control** - Protected routes by role  
✅ **Error Handling** - Global error management  
✅ **Session Verification** - Auto-verify token validity  

---

## 🏗️ Architecture

### Layer 1: Zustand Store (State)
```
useAuthStore         → Auth state (user, token, isAuthenticated)
useUserStore         → User data (profiles, list, cache)
```

### Layer 2: Auth Context (Actions)
```
AuthContext          → Login, signup, logout, refresh token
useAuth()            → Hook to access auth functions
```

### Layer 3: API Client (Communication)
```
apiClient            → Centralized Axios instance
- Automatic token injection
- Error handling & 401 redirect
- Request/response logging
```

### Layer 4: Protected Routes (Access Control)
```
<ProtectedRoute>     → Require authentication + optional role
<PublicRoute>        → Redirect if already logged in
```

---

## 📁 File Structure

```
src/
├── store/
│   ├── authStore.js          ← Zustand auth store (persistent)
│   └── userStore.js          ← Zustand user store (caching)
│
├── context/
│   └── AuthContext.jsx       ← Auth provider + useAuth hook
│
├── lib/
│   └── apiClient.js          ← Centralized Axios instance
│
├── components/
│   ├── ProtectedRoute.jsx    ← Route guards
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   └── dashboards/
│       ├── StudentDashboard.jsx
│       ├── EmployerDashboard.jsx
│       └── AdminDashboard.jsx
│
└── App.jsx                   ← Wrapped with AuthProvider
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install zustand@4.4.1
```

### 2. Update App.jsx

Wrap your app with `AuthProvider`:

```jsx
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 3. Use Auth in Components

```jsx
import { useAuth } from '../context/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
      {!isAuthenticated && <p>Please login</p>}
    </div>
  );
}
```

---

## 🔐 Authentication Flow

### Login Flow

```
User Input
    ↓
[Login Component]
    ↓
useAuth().login(email, password)
    ↓
[API Client] POST /api/user/login
    ↓
Zustand Store updates:
- user: { id, name, email, role }
- token: jwt_token
- isAuthenticated: true
    ↓
localStorage (persisted)
    ↓
Redirect to Dashboard
```

### Session Persistence Flow

```
App Loads
    ↓
AuthProvider useEffect
    ↓
Zustand reads localStorage
    ↓
Load: { user, token, userType }
    ↓
verifySession() checks token validity
    ↓
Session restored ✅
OR
Clear auth & redirect to login ❌
```

### Token Refresh Flow

```
API Request
    ↓
[API Client Interceptor]
    ↓
401 Unauthorized
    ↓
Call refreshToken()
    ↓
POST /api/user/refresh-token
    ↓
Update token in store
    ↓
Retry original request
    ↓
Success ✅
```

---

## 💾 State Management

### Auth Store (Zustand)

**Persistent State:**
```javascript
{
  user: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student'
  },
  token: 'eyJhbGciOiJIUzI1NiIs...',
  userType: 'student',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  lastVerifiedAt: 1619827200000
}
```

**Actions:**
```javascript
import useAuthStore from '../store/authStore';

const { 
  user, 
  token, 
  isAuthenticated,
  setUser,           // Set user after login
  clearAuth,         // Clear on logout
  updateUser,        // Update profile
  setLoading,        // Loading state
  setError,          // Set error message
  getAuthHeader,     // Get headers for API
  hasRole,           // Check user role
  canAccess          // Check access permission
} = useAuthStore();
```

### User Store (Zustand)

**Manages:**
- User profiles cache
- User list cache
- Cache TTL (5 minutes)

**Actions:**
```javascript
import useUserStore from '../store/userStore';

const {
  fetchUserProfile,   // Load single profile
  updateUserProfile,  // Update profile
  fetchUsers,         // Load user list
  getUser,            // Get from cache
  cacheUser,          // Manually cache
  clearUserCache,     // Clear specific user
  clearAllCache       // Clear all cache
} = useUserStore();
```

---

## 🔗 API Client

### Automatic Features

```javascript
// ✅ Automatic token injection
GET /api/user/profile
  Headers: {
    'Authorization': 'Bearer token123',
    'x-auth-token': 'token123'
  }

// ✅ Automatic error handling
if (error.status === 401) {
  clearAuth();
  redirect('/login');
}

// ✅ Request logging
📤 POST /api/user/login { email, password }
✅ 200 POST /api/user/login { user, token }
```

### Usage in Components

```javascript
import apiClient from '../lib/apiClient';

// Automatic token injection
const response = await apiClient.get('/user/profile');

// No need to manually add headers!
```

---

## 🛡️ Protected Routes

### Route Protection

```jsx
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

<Routes>
  {/* Only accessible if logged in */}
  <Route
    path="/student-dashboard"
    element={
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    }
  />

  {/* Only accessible if NOT logged in */}
  <Route
    path="/login"
    element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    }
  />
</Routes>
```

### Redirect Logic

```
AccessingProtectedRoute
    ↓
isAuthenticated? 
    ├─ NO → Redirect to /login
    └─ YES
        └─ hasRole(requiredRole)?
            ├─ NO → Redirect to /
            └─ YES → Allow access ✅
```

---

## 📚 Usage Examples

### Example 1: Login Component

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.email, formData.password, 'student');
      navigate('/student-dashboard');
    } catch (err) {
      // Error already set in store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
      />
      <button disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Example 2: Protected Component

```jsx
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Not authenticated</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Example 3: User Profile Management

```jsx
import { useAuth } from '../context/AuthContext';
import useUserStore from '../store/userStore';
import { useEffect } from 'react';

export function Profile() {
  const { user } = useAuth();
  const { fetchUserProfile, getUserProfile, updateUserProfile } = useUserStore();

  const profile = getUserProfile(user.id);

  useEffect(() => {
    if (!profile) {
      fetchUserProfile(user.id);
    }
  }, [user.id]);

  const handleUpdate = async (data) => {
    await updateUserProfile(user.id, data);
  };

  return (
    <div>
      <h1>{profile?.name}</h1>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Update Profile
      </button>
    </div>
  );
}
```

### Example 4: Check Permissions

```jsx
import useAuthStore from '../store/authStore';

export function AdminPanel() {
  const { canAccess, hasRole } = useAuthStore();

  if (!hasRole('admin')) {
    return <p>Not authorized</p>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {canAccess('admin') && <p>You have access</p>}
    </div>
  );
}
```

---

## 🔄 Session Persistence

### What Gets Persisted

✅ **Persisted to localStorage:**
- user object
- token
- userType
- isAuthenticated

❌ **NOT persisted:**
- isLoading
- error
- lastVerifiedAt

### How It Works

```javascript
// App loads
→ Zustand reads from localStorage
→ Restores: { user, token, userType, isAuthenticated }
→ AuthProvider verifies session
→ Token valid? → Keep logged in
→ Token invalid? → Clear auth & redirect to login
```

---

## 🚨 Error Handling

### Automatic Errors

```javascript
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const { error, clearError, login } = useAuth();

  return (
    <>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </>
  );
}
```

### Error Types

```
401 Unauthorized → Auto-redirect to login
403 Forbidden → User doesn't have permission
404 Not Found → Resource doesn't exist
500 Server Error → Retry or show error message
```

---

## 📊 Debugging

### Enable Console Logging

All requests are logged automatically:

```
📤 POST /api/user/login { email, password }
✅ 200 POST /api/user/login { user, token }

📤 GET /api/user/profile
✅ 200 GET /api/user/profile { user }

🔐 Token verified for /api/user/dashboard
```

### Check Store State

```javascript
// In console
import useAuthStore from './store/authStore';
console.log(useAuthStore.getState());
// { user, token, isAuthenticated, ... }
```

### Clear Session (For Testing)

```javascript
// In console
useAuthStore.setState({
  user: null,
  token: null,
  isAuthenticated: false
});
```

---

## ✅ Checklist

- [x] Zustand store for persistent auth
- [x] Zustand store for user management
- [x] Auth Context provider
- [x] useAuth custom hook
- [x] Centralized API client
- [x] Protected routes
- [x] Public routes (redirect if logged in)
- [x] Session verification on load
- [x] Token refresh on 401
- [x] Role-based access control
- [x] Error handling & display
- [x] localStorage persistence

---

## 🎯 Next Steps

1. **Update Login/Signup Components** - Use `useAuth()` hook
2. **Update Dashboard Components** - Use `useAuth()` for user data
3. **Add User Endpoints** - Backend routes for `/api/user/*`
4. **Test Session Persistence** - Refresh page and verify login persists
5. **Test Role-Based Access** - Try accessing routes with wrong role
6. **Add Error Boundaries** - Catch and display errors gracefully

---

## 🔗 Related Files

- **Store:** `src/store/authStore.js`, `src/store/userStore.js`
- **Context:** `src/context/AuthContext.jsx`
- **API:** `src/lib/apiClient.js`
- **Routes:** `src/components/ProtectedRoute.jsx`
- **App:** `src/App.jsx`

---

## 💡 Tips

**Tip 1:** Always use `useAuth()` hook in components, not direct store access
```javascript
// ✅ Good
const { user, login } = useAuth();

// ❌ Avoid
const store = useAuthStore();
```

**Tip 2:** Clear error messages after displaying
```javascript
const { error, clearError } = useAuth();

useEffect(() => {
  if (error) {
    setTimeout(() => clearError(), 3000);
  }
}, [error]);
```

**Tip 3:** Cache user profiles to reduce API calls
```javascript
const { getUser, cacheUser, fetchUserProfile } = useUserStore();

// Check cache first
let user = getUser(userId);
if (!user) {
  // Cache miss, fetch from server
  user = await fetchUserProfile(userId);
}
```

---

## ❓ FAQ

**Q: How do I know if the session is still valid?**
A: Use `const { isAuthenticated } = useAuth();` - it auto-verifies every 5 minutes

**Q: What happens when token expires?**
A: Auto-redirects to login and clears auth state

**Q: Can I use this with SSR?**
A: Yes, but need to handle localStorage differently (use cookie-based storage instead)

**Q: How do I prevent unauthorized access?**
A: Use `<ProtectedRoute requiredRole="admin">` to restrict by role

**Q: Where should I call logout?**
A: In Header/Navbar component, then redirect to home

---

**🎉 You now have production-grade state management!**
