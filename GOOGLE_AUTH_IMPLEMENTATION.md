# Google OAuth Authentication Implementation

## ✅ Implementation Complete!

Your CampusDine application now uses **Google OAuth authentication** instead of traditional email/password signup. Users must provide academic details during login.

## 🔧 What Was Changed

### Backend Changes:

1. **Packages Installed**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth 2.0 strategy
   - `express-session` - Session management

2. **User Model Updated** ([api/models/user.model.js](api/models/user.model.js))
   - Added `googleId` field
   - Added `registerNumber` field
   - Added `department` field
   - Added `semester` field
   - Added `division` field
   - Made `password` optional (for OAuth users)

3. **New Files Created**
   - [api/config/passport.js](api/config/passport.js) - Passport Google OAuth strategy
   - [api/routes/auth.routes.js](api/routes/auth.routes.js) - Google auth endpoints

4. **Environment Variables Added** ([api/.env](api/.env))
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:6005/api/v1/auth/google/callback
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   ```

5. **App Configuration Updated** ([api/app.js](api/app.js))
   - Added session middleware
   - Added passport initialization
   - Registered auth routes

### Frontend Changes:

1. **Packages Installed**
   - `@react-oauth/google` - Google OAuth React components
   - `jwt-decode` - JWT token decoding

2. **Login Page Replaced** ([client/src/pages/login/Login.jsx](client/src/pages/login/Login.jsx))
   - Removed email/password form
   - Added Google Sign-In button
   - Shows required fields information

3. **New Pages Created**
   - [client/src/pages/completeProfile/CompleteProfile.jsx](client/src/pages/completeProfile/CompleteProfile.jsx) - Form for academic details
   - [client/src/pages/authSuccess/AuthSuccess.jsx](client/src/pages/authSuccess/AuthSuccess.jsx) - OAuth callback handler

4. **Routes Updated** ([client/src/App.jsx](client/src/App.jsx))
   - Added `/complete-profile` route
   - Added `/auth/success` route
   - Removed `/register` route

## 📱 User Flow

### First-Time Login:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. User approves access
4. Redirected to "Complete Profile" page
5. User enters:
   - Register Number
   - Department (dropdown)
   - Semester (dropdown)
   - Division
6. Profile completed → Redirected to home

### Returning User:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Automatically logged in → Redirected to home

## 🔐 API Endpoints

### Authentication Routes:
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/complete-profile` - Submit academic details
- `GET /api/v1/auth/current-user` - Get authenticated user
- `GET /api/v1/auth/logout` - Logout user

## 🚀 How to Use

### Start the Backend:
```bash
cd api
npm start
```

### Start the Frontend:
```bash
cd client
npm run dev
```

### Start the Admin Panel (if needed):
```bash
cd admin
npm run dev
```

## 🎯 Testing

1. Open [http://localhost:5173](http://localhost:5173)
2. Click "Sign in with Google"
3. Select your Google account
4. Fill in the academic details form:
   - Register Number: `REG001`
   - Department: Select from dropdown
   - Semester: Select from dropdown
   - Division: `A`
5. Submit and you'll be logged in!

## 📝 Important Notes

1. **Google OAuth Credentials**: Already configured with your provided credentials
2. **Callback URL**: Make sure `http://localhost:6005/api/v1/auth/google/callback` is added in Google Cloud Console
3. **Authorized Redirect URIs** in Google Console should include:
   - `http://localhost:6005/api/v1/auth/google/callback`
4. **Authorized JavaScript Origins**:
   - `http://localhost:5173`
   - `http://localhost:6005`

## ⚠️ For Production Deployment

Before deploying to production:

1. Update callback URLs in [api/.env](api/.env):
   ```env
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
   ```

2. Update redirect URLs in Google Cloud Console

3. Update CORS origin in [api/.env](api/.env):
   ```env
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. Change SESSION_SECRET to a strong random value

5. Update frontend redirect URLs in [api/routes/auth.routes.js](api/routes/auth.routes.js)

## 🔄 Database Schema

New user document structure:
```javascript
{
  userId: "uuid",
  googleId: "google-user-id",
  email: "user@gmail.com",
  username: "User Name",
  avatar: "profile-pic-url",
  role: "user",
  registerNumber: "REG001",
  department: "Computer Science",
  semester: "5",
  division: "A",
  createdAt: Date,
  updatedAt: Date
}
```

## ✨ Features

- ✅ Google OAuth 2.0 authentication
- ✅ No password management required
- ✅ Secure session handling
- ✅ Academic details collection
- ✅ Profile completion flow
- ✅ Automatic user linking
- ✅ MongoDB integration
- ✅ JWT token generation

---

**Your application is now ready to use Google Authentication! 🎉**
