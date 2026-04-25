# 📋 GigHive - Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** April 2026  
**Status:** Active Development  
**Project Type:** Full-Stack Web Application

---

## 📖 Table of Contents
1. [What is GigHive?](#what-is-gighive)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [User Roles](#user-roles)
6. [Database Models](#database-models)
7. [Frontend Components](#frontend-components)
8. [Backend APIs](#backend-apis)
9. [How to Start](#how-to-start)
10. [Visual Diagrams](#visual-diagrams)

---

## 🎯 What is GigHive?

**GigHive** is a platform connecting **students** with **employers** to find and complete short-term projects (gigs). 

Think of it like:
- **Fiverr** for college students
- **Upwork** for quick projects
- **LinkedIn** for freelance opportunities

### Main Goals:
✅ Students find paid work/gigs  
✅ Employers post projects and find talented students  
✅ Build real-world experience  
✅ Earn money during college  

---

## ⭐ Key Features

### For Students:
- 👤 Create profile and showcase skills
- 🔍 Browse available gigs/projects
- 📱 Apply for gigs
- 💬 Chat with employers
- ⭐ Get reviewed and build reputation
- 🎥 Upload gig reels (video portfolios)
- 💰 Earn credits/money

### For Employers:
- 📝 Post new gigs/projects
- 📊 View applications from students
- 👥 Manage applicants (shortlist/hire)
- 📈 Track project status
- 💬 Message students
- 📊 View analytics/dashboard

### For Admin:
- ✔️ Verify/approve new gigs
- 🚫 Reject invalid gigs
- 👥 Manage users
- 📊 View platform statistics

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 GIGHIVE WEB APP                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                    │
│  Port: 3000                                                  │
│                                                              │
│  ┌─────────────┬──────────────┬──────────────┐              │
│  │   Student   │  Employer    │    Admin     │              │
│  │  Dashboard  │  Dashboard   │  Dashboard   │              │
│  └─────────────┴──────────────┴──────────────┘              │
│                                                              │
│  Pages: Home | Feed | FindGigs | Profile | Messages        │
│  Components: Cards | Forms | Chat | Navigation             │
└──────────────────────────────────────────────────────────────┘
                            │
                    HTTP + WebSocket
                            │
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND (Node + Express)                    │
│  Port: 5001                                                  │
│                                                              │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Routes   │ │Middleware│ │Middleware│ │ Socket   │    │
│  │  (7 files) │ │  (Auth)  │ │ (Verify) │ │  (Chat)  │    │
│  └────────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │        API Endpoints                 │                  │
│  │ /api/gigs      /api/user             │                  │
│  │ /api/profile   /api/dashboard        │                  │
│  │ /api/message   /api/conversation     │                  │
│  │ /api/reel                            │                  │
│  └──────────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
                            │
                       MongoDB
                            │
┌──────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                        │
│                                                              │
│  Collections:                                               │
│  • users         (name, email, role, avatar)               │
│  • gigs          (title, description, pay, status)         │
│  • applications  (student, gig, status)                    │
│  • messages      (sender, receiver, text)                  │
│  • profiles      (skills, bio, rating)                     │
│  • reels         (video_url, likes, comments)              │
│  • reviews       (rating, feedback)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 💾 Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI Components & State Management |
| **Vite** | Fast build tool & dev server |
| **Tailwind CSS** | Styling & responsive design |
| **shadcn/ui** | Pre-built UI components |
| **Axios** | HTTP requests to backend |
| **Socket.io Client** | Real-time chat |
| **React Router** | Page navigation |
| **Lucide Icons** | Icons & visual elements |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | API framework & routing |
| **MongoDB** | NoSQL database |
| **Mongoose** | Database ODM |
| **Socket.io** | Real-time messaging |
| **JWT** | User authentication |
| **Bcryptjs** | Password encryption |
| **Nodemailer** | Email notifications |
| **Cloudinary** | Video/image storage |
| **Multer** | File uploads |
| **CORS** | Cross-origin requests |

---

## 👥 User Roles

### **1. Student**
- Can browse gigs
- Apply for gigs
- Chat with employers
- Build portfolio (upload reels)
- Receive reviews/ratings
- Earn credits

**Access:** Student Dashboard → Browse Gigs → Find Jobs

### **2. Employer**
- Post new gigs
- Review applications
- Manage student applicants
- Hire/shortlist students
- Chat with students
- View dashboard analytics

**Access:** Employer Dashboard → Create Gig → Manage Applications

### **3. Admin**
- Verify/approve gigs
- Reject inappropriate gigs
- Manage platform users
- View analytics
- Moderate content

**Access:** Admin Dashboard → Manage Gigs → Platform Stats

---

## 📊 Database Models

### **User Model**
```
{
  _id: ObjectId
  name: String (required)
  email: String (unique, required)
  password: String (hashed)
  role: String ('student' | 'employer' | 'admin')
  avatar: String (profile picture URL)
  otpVerified: Boolean (email verified)
  otp: String (one-time password)
  otpExpires: Date
  createdAt: Date
}
```

### **Gig Model**
```
{
  _id: ObjectId
  employer: ObjectId (ref: User)
  title: String (e.g., "Design a Logo")
  description: String
  category: String (e.g., "Design", "Writing")
  skillsRequired: [String]
  location: String (default: "Remote")
  duration: String (e.g., "2 weeks")
  
  pay: {
    type: String ('fixed' | 'range' | 'hourly')
    amount: String (e.g., "$500" | "$15/hour")
  }
  
  status: String ('open' | 'in-progress' | 'closed')
  applications: [
    {
      student: ObjectId (ref: User)
      message: String
      status: String ('pending' | 'shortlisted' | 'hired' | 'declined')
      appliedAt: Date
    }
  ]
  
  company: String (employer company name)
  applicants: [ObjectId] (array of students who applied)
  likes: [ObjectId] (students who liked the gig)
  comments: [ObjectId]
  verified: Boolean (admin approved)
  rejected: Boolean (admin rejected)
  urgent: Boolean (rush job)
  featured: Boolean (promoted listing)
  collegeSpecific: Boolean (only for certain colleges)
  colleges: [String]
  gigReelUrl: String (Cloudinary video)
  createdAt: Date
}
```

### **Message Model**
```
{
  _id: ObjectId
  sender: ObjectId (ref: User)
  receiver: ObjectId (ref: User)
  message: String
  timestamp: Date
  read: Boolean
}
```

### **Profile Model**
```
{
  _id: ObjectId
  user: ObjectId (ref: User)
  bio: String (about me)
  skills: [String] (technical skills)
  experience: String (years/description)
  portfolio: String (link to work)
  rating: Number (1-5 stars)
  reviews: [String] (from employers)
  totalEarnings: Number
}
```

### **Review Model**
```
{
  _id: ObjectId
  from: ObjectId (ref: User - employer)
  to: ObjectId (ref: User - student)
  gig: ObjectId (ref: Gig)
  rating: Number (1-5)
  feedback: String
  createdAt: Date
}
```

---

## 🎨 Frontend Components

### **Page Structure**

```
src/components/
│
├── auth/                          # Login & Signup pages
│   ├── Login.jsx
│   └── Signup.jsx
│
├── student/                       # Student-only pages
│   ├── Dashboard.jsx              # Student home dashboard
│   ├── FindGigs.jsx              # Browse all gigs
│   ├── Feed.jsx                  # Social feed (like/comment gigs)
│   ├── Applications.jsx           # Applied gigs status
│   ├── Messages.jsx              # Chat with employers
│   ├── Profile.jsx               # Student profile
│   ├── GigReels.jsx              # Video portfolio
│   ├── CollegeGigs.jsx           # College-specific gigs
│   └── StudentSidebar.jsx        # Navigation sidebar
│
├── employer/                      # Employer-only pages
│   ├── Dashboard.jsx             # Employer home dashboard
│   ├── PostGig.jsx               # Create new gig form
│   ├── Applications.jsx          # View & manage applications
│   ├── Messages.jsx              # Chat with students
│   ├── Plans.jsx                 # Pricing/subscription plans
│   └── EmployerSidebar.jsx       # Navigation sidebar
│
├── admin/                         # Admin-only pages
│   ├── Dashboard.jsx             # Admin overview
│   ├── Gigs.jsx                  # Approve/reject gigs
│   ├── Students.jsx              # Manage students
│   ├── Employers.jsx             # Manage employers
│   └── AdminSidebar.jsx          # Navigation sidebar
│
├── dashboards/                    # Dashboard containers
│   ├── StudentDashboard.jsx
│   ├── EmployerDashboard.jsx
│   └── AdminDashboard.jsx
│
├── pages/                         # Public pages
│   ├── Home.jsx                  # Landing page
│   ├── AboutUs.jsx               # About page
│   ├── HowItWorks.jsx            # Tutorial page
│   ├── ForStudents.jsx           # Student benefits
│   ├── ForEmployers.jsx          # Employer benefits
│   └── PopularGigs.jsx           # Featured gigs
│
├── layout/                        # Shared layout
│   ├── Header.jsx                # Top navigation
│   ├── Footer.jsx                # Bottom footer
│   └── PublicLayout.jsx          # Public page wrapper
│
└── ui/                            # Pre-built UI components (shadcn)
    ├── button.jsx
    ├── card.jsx
    ├── dialog.jsx
    ├── form.jsx
    ├── input.jsx
    └── ... (50+ UI components)
```

### **Key Pages & Their Purpose**

| Page | Users | Purpose |
|------|-------|---------|
| **Home** | Everyone | Landing page & site overview |
| **Login/Signup** | Everyone | User authentication |
| **Student Dashboard** | Students | Main hub - view gigs & earnings |
| **Find Gigs** | Students | Browse & search for projects |
| **Feed** | Students | Social-like timeline of gigs |
| **Employer Dashboard** | Employers | Manage posted gigs |
| **Post Gig** | Employers | Create new project posting |
| **Applications** | Both | View/manage applications |
| **Messages** | Both | Direct messaging (real-time) |
| **Profile** | Both | View/edit profile & skills |
| **Admin Dashboard** | Admin | Moderate platform |

---

## 🔌 Backend APIs

### **Authentication Routes** (`/api/user`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Create new account |
| POST | `/login` | Login with email/password |
| POST | `/verify-otp` | Verify OTP (email verification) |

### **Gig Routes** (`/api/gigs`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all public gigs (no auth needed) |
| POST | `/` | Create new gig (employer only) |
| GET | `/:id` | Get gig details |
| GET | `/all` | Get all gigs (admin only) |
| POST | `/:id/apply` | Apply for a gig (student only) |
| PUT | `/:id/verify` | Approve gig (admin only) |
| PUT | `/:id/reject` | Reject gig (admin only) |
| GET | `/applications` | View applications (employer only) |
| PUT | `/update-status` | Update application status |

### **Profile Routes** (`/api/profile`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/me` | Get logged-in user's profile |

### **Dashboard Routes** (`/api/dashboard`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/stats` | Get dashboard stats (employer only) |
| GET | `/gigs/active` | Get active gigs (employer only) |
| GET | `/applications/recent` | View recent applications |
| GET | `/analytics` | View analytics data |

### **Messages Routes** (`/api/message`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/send` | Send a message |

### **Conversation Routes** (`/api/conversation`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/:userId` | Get message history with user |

### **Reel Routes** (`/api/reel`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| Upload/manage video reels for portfolio |

---

## 🚀 How to Start the Web App

### **System Requirements**
| Requirement | Minimum | Recommended |
|-----------|---------|-----------|
| **Node.js** | v14 | v18+ |
| **npm** | v6 | v9+ |
| **RAM** | 4GB | 8GB+ |
| **Internet** | Required | Required |
| **OS** | Windows/Mac/Linux | Any |

### **Pre-Setup Checklist**

Before starting, ensure you have:

- ✅ **Git** installed (`git --version`)
- ✅ **Node.js & npm** installed (`node -v` && `npm -v`)
- ✅ **MongoDB Atlas account** (create free at https://www.mongodb.com/cloud/atlas)
- ✅ **Cloudinary account** (for image/video storage - free at https://cloudinary.com)
- ✅ **Gmail account** (for email notifications)
- ✅ Code editor (VS Code recommended)
- ✅ Terminal/Command Prompt access

---

### **📋 Complete Step-by-Step Setup Guide**

#### **Step 1️⃣: Get the Code**

```bash
# Clone the repository
git clone https://github.com/abhishekmishra4k/GigHive_Saazu.git

# Navigate to project
cd "GigHive_Saazu"

# Verify project structure
ls -la
# You should see: gighive-backend/ src/ package.json SRS.md etc.
```

**Expected Output:**
```
eslint.config.js
index.html
package.json
README.md
vite.config.js
gighive-backend/
public/
src/
```

---

#### **Step 2️⃣: Setup MongoDB Atlas (Database)**

**2A. Create MongoDB Account:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" → Create free account
3. Verify email

**2B. Create Database Cluster:**
1. Dashboard → Click "Create"
2. Choose "M0 Sandbox" (FREE tier)
3. Select your region (closest to you)
4. Click "Create Cluster" (wait 5-10 minutes)

**2C. Create Database User:**
1. Click "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `gighive_user`
4. Password: Create strong password (SAVE IT!)
5. Click "Add User"

**2D. Whitelist Your IP:**
1. Click "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Add Current IP Address" (your machine's IP)
4. Confirm

**2E. Get Connection String:**
1. Click "Database" → Your cluster
2. Click "Connect" → "Drivers"
3. Copy connection string (looks like):
```
mongodb+srv://gighive_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Replace `<password>` with your actual password

---

#### **Step 3️⃣: Setup Cloudinary (Image/Video Storage)**

**3A. Create Cloudinary Account:**
1. Go to https://cloudinary.com
2. Click "Sign Up" → Create free account
3. Verify email

**3B. Get API Credentials:**
1. Dashboard → Settings → API Keys
2. Copy and save:
   - Cloud Name
   - API Key
   - API Secret

---

#### **Step 4️⃣: Create Environment Variables**

**4A. Backend Environment File:**

Create `.env` file in `gighive-backend/` folder:

```bash
cd gighive-backend
touch .env
```

**Add these lines to `.env`:**
```env
# Server
PORT=5001

# MongoDB Connection (from Step 2E)
MONGO_URI=mongodb+srv://gighive_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gighive?retryWrites=true&w=majority

# JWT Secret (create random string)
JWT_SECRET=your_super_secret_jwt_key_here_12345

# Cloudinary (from Step 3B)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Email Settings (Gmail)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

# (Optional) Admin email
ADMIN_EMAIL=admin@gighive.com
```

⚠️ **IMPORTANT:** Never commit `.env` file to Git! Add to `.gitignore`

---

#### **Step 5️⃣: Install All Dependencies**

**5A. Install Backend Dependencies:**
```bash
cd gighive-backend
npm install
# Wait 2-5 minutes...
# You'll see: ✅ added XXX packages
```

**5B. Go Back & Install Frontend Dependencies:**
```bash
cd ..
npm install
# Wait 2-5 minutes...
# You'll see: ✅ added XXX packages
```

**Verify Installation:**
```bash
# Check if node_modules exist
ls node_modules | head -10
ls gighive-backend/node_modules | head -10
```

---

#### **Step 6️⃣: Start the Application**

You need **2 Terminal Windows/Tabs** to run frontend and backend simultaneously.

**Terminal Window 1 - Backend Server:**

```bash
cd gighive-backend
npm run start
```

**Expected Output:**
```
> gighive-backend@1.0.0 start
> nodemon server.js

[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
✅ MongoDB connected
🚀 Server started on port 5001
```

✅ **Backend is ready!** (Do NOT close this terminal)

---

**Terminal Window 2 - Frontend Dev Server:**

```bash
npm run dev
```

**Expected Output:**
```
  VITE v7.0.4  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ **Frontend is ready!** (Do NOT close this terminal)

---

#### **Step 7️⃣: Open in Browser**

Open your browser and visit:

```
http://localhost:3000
```

You should see the **GigHive Home Page** with:
- Header with Logo
- "For Students" & "For Employers" sections
- Login/Signup buttons
- Footer

---

### **🧪 Test the Application**

#### **Test 1: Sign Up as Student**
1. Click "Login" button
2. Click "Create new account" or "Sign Up"
3. Fill form:
   - Name: "John Student"
   - Email: "student@test.com"
   - Password: "Password@123"
   - Role: "Student"
4. Click "Sign Up"
5. You'll see OTP verification screen
6. Check email (might be in spam) for OTP
7. Enter OTP and verify
8. ✅ You're logged in!

#### **Test 2: Explore Student Dashboard**
1. You should see Student Dashboard
2. Left sidebar with menu:
   - Dashboard
   - Find Gigs
   - Feed
   - Messages
   - Profile
3. Browse different sections

#### **Test 3: Sign Up as Employer (New Account)**
1. Logout
2. Sign up with:
   - Role: "Employer"
   - Email: "employer@test.com"
3. Fill company details
4. ✅ Logged in as employer

#### **Test 4: Create a Gig (As Employer)**
1. Go to "Post Gig" in sidebar
2. Fill form:
   - Title: "Create a Logo"
   - Description: "Design a modern logo"
   - Skills Required: "Design, Photoshop"
   - Budget: "$500"
3. Click "Post Gig"
4. ✅ Gig created!

#### **Test 5: Apply for Gig (As Student)**
1. Logout & login as student
2. Go to "Find Gigs"
3. You should see the gig you created
4. Click gig card
5. Click "Apply Now"
6. Write application message
7. Click "Submit"
8. ✅ Applied successfully!

#### **Test 6: Real-Time Chat**
1. Login as employer
2. Go to "Messages"
3. You should see student's application notification
4. Click to chat
5. Type a message
6. Message should appear in real-time
7. ✅ Real-time chat works!

---

### **📱 Test Across Devices**

To test on mobile or other devices on same network:

```bash
# Find your machine's IP
ipconfig getifaddr en0    # macOS
ifconfig | grep inet      # Linux
ipconfig                  # Windows

# Use IP instead of localhost
# Example: http://192.168.1.100:3000
```

---

### **🔄 Useful Commands**

**Development:**
```bash
# Start backend with auto-reload
npm run start

# Start frontend dev server
npm run dev

# Build frontend for production
npm run build

# Lint frontend code
npm run lint
```

**Database:**
```bash
# View MongoDB in MongoDB Atlas dashboard
# https://cloud.mongodb.com

# Connect via MongoDB Compass (GUI tool)
# Connection: mongodb+srv://gighive_user:password@cluster0.xxxxx.mongodb.net/gighive
```

**Terminal Shortcuts:**
```bash
# Stop current process
Ctrl + C

# Switch between terminals
Cmd + Tab (Mac) / Alt + Tab (Windows)

# Clear screen
clear

# Go back to parent folder
cd ..

# Go to home directory
cd ~
```

---

### **❌ Troubleshooting**

#### **Issue: MongoDB Connection Failed**
```
❌ Error: querySrv ENOTFOUND _mongodb._tcp.cluster0...
```
**Solutions:**
1. Check `.env` file has correct MONGO_URI
2. Verify IP is whitelisted in MongoDB Atlas Network Access
3. Check internet connection
4. Try with local MongoDB (download MongoDB Community)

#### **Issue: Port Already in Use**
```
❌ Error: listen EADDRINUSE :::3000 or :::5001
```
**Solution:**
```bash
# Kill process using port (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Or use different ports
PORT=5002 npm run start    # backend on 5002
```

#### **Issue: npm: command not found**
```
❌ npm: command not found
```
**Solution:**
- Install Node.js from https://nodejs.org
- Restart terminal after installation
- Verify: `node -v` && `npm -v`

#### **Issue: CORS Error in Browser Console**
```
❌ Error: Access to XMLHttpRequest blocked by CORS
```
**Solution:**
- Ensure backend is running on port 5001
- Check CORS settings in `gighive-backend/server.js`
- Frontend must be on `http://localhost:3000`

#### **Issue: Blank Page or White Screen**
```
❌ Frontend shows white/blank screen
```
**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Clear browser cache
5. Restart dev server: `npm run dev`

#### **Issue: Changes Not Reflecting**
```
❌ Edited code but changes don't appear
```
**Solution:**
1. Ensure dev server is running
2. Check for syntax errors
3. Hard refresh browser
4. Restart dev server
5. Check file is saved (dot next to filename in editor)

#### **Issue: Email OTP Not Received**
```
❌ No email received after signup
```
**Solution:**
1. Check spam/junk folder
2. Verify MAIL_USER and MAIL_PASS in `.env`
3. For Gmail, use **App Password** (not regular password)
   - Go to https://myaccount.google.com/apppasswords
   - Generate app password for Mail
   - Use that in `.env`
4. Resend OTP from signup page

---

### **✅ Success Checklist**

After starting the app, verify:

- [ ] Terminal 1 shows: `🚀 Server started on port 5001`
- [ ] Terminal 2 shows: `➜ Local: http://localhost:3000/`
- [ ] Browser opens http://localhost:3000 successfully
- [ ] GigHive home page loads (not blank)
- [ ] Can click "Login" button
- [ ] Can create new account (student)
- [ ] Can receive OTP email
- [ ] Can verify OTP and login
- [ ] Dashboard loads correctly
- [ ] Can switch to employer role
- [ ] Can post a gig
- [ ] Can apply for gigs (as student)
- [ ] Chat works in real-time
- [ ] No console errors (F12 → Console tab)

---

### **🚀 Quick Start (TL;DR)**

For experienced developers:

```bash
# Clone & setup
git clone https://github.com/abhishekmishra4k/GigHive_Saazu.git
cd GigHive_Saazu

# Configure .env in gighive-backend/
echo "MONGO_URI=your_mongodb_uri" > gighive-backend/.env
echo "JWT_SECRET=your_secret" >> gighive-backend/.env
# Add other env vars...

# Install & run
cd gighive-backend && npm install && npm run start &
cd .. && npm install && npm run dev
```

Then open http://localhost:3000

---

### **📞 Need Help?**

- Check MongoDB Atlas status: https://cloud.mongodb.com
- Check Cloudinary dashboard: https://cloudinary.com/console
- GitHub Issues: https://github.com/abhishekmishra4k/GigHive_Saazu/issues
- Read error messages carefully - they usually explain the problem!

---

## **Prerequisites**
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git

### **Step 1: Clone Repository**
```bash
git clone https://github.com/abhishekmishra4k/GigHive_Saazu.git
cd "GigHive_Saazu"
```

### **Step 2: Setup Environment Variables**

Create `.env` file in `gighive-backend/` folder:
```env
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/gighive?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
```

### **Step 3: Install Dependencies**

**Backend:**
```bash
cd gighive-backend
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### **Step 4: Start Development Servers**

**Terminal 1 - Backend Server:**
```bash
cd gighive-backend
npm run start
# Output: 🚀 Server started on port 5001
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
# Output: VITE v7.0.4 ready in XXX ms
# ➜ Local: http://localhost:3000/
```

### **Step 5: Open in Browser**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`
- Swagger/API docs (if available): `http://localhost:5001/api-docs`

---

## 📊 Visual Diagrams

### **User Journey Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                   USER SIGNUP/LOGIN                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
            Choose Role: Student / Employer
                            ↓
        Email Verification (OTP sent & verified)
                            ↓
        ┌──────────────────┬──────────────────┐
        ↓                  ↓                  ↓
   STUDENT             EMPLOYER             ADMIN
   ┌─────────┐        ┌────────┐         ┌────────┐
   │Dashboard│        │Dashboard         │Dashboard
   │Browse   │        │Post Gig   │      │Moderate│
   │Gigs     │        │View Apps   │     │Stats   │
   │Apply    │        │Chat       │      │Users   │
   │Chat     │        │Analytics  │      │        │
   │Profile  │        │           │      │        │
   └─────────┘        └────────┘         └────────┘
        ↓                  ↓                  ↓
    Find Gig          Post Gig           Verify Gig
    Apply Now         Receive Apps       Approve/Reject
    Get Hired         Manage Apps        Monitor
    Get Paid          Hire Students      Platform
```

### **Data Flow Diagram**

```
┌──────────────┐
│   Student    │
│   Browser    │
└──────┬───────┘
       │
       │ (1) Enter email & password
       │
       ↓
┌─────────────────────────┐
│   React Frontend        │ ← Displays forms, pages
│   (Vite + Tailwind)     │ ← Handles user interactions
│                         │
│ State: User data,       │
│ Gigs, Messages, etc     │
└────────┬────────────────┘
         │
         │ (2) HTTP Request (Axios)
         │ POST /api/user/login
         │
         ↓
┌─────────────────────────────────┐
│   Node.js Backend Server        │
│   (Express.js)                  │
│                                 │
│ Receives request                │
│ → Validates input               │
│ → Checks password (Bcrypt)      │
│ → Creates JWT token             │
│ → Returns token                 │
└────────┬────────────────────────┘
         │
         │ (3) Queries database
         │
         ↓
┌──────────────────────┐
│  MongoDB Database    │
│  (Atlas Cloud)       │
│                      │
│ Collections:         │
│ • users              │
│ • gigs               │
│ • applications       │
│ • messages           │
└──────────────────────┘
         ↑
         │ (4) Returns user data
         │
         ├─────────────────────────┐
         │                         │
    Backend                        │
    stores in                      │
    memory                         │
         │                         │
         └──→ JSON response with JWT
              {
                token: "eyJh...",
                user: { id, name, email, role }
              }
         │
         │ (5) HTTP Response
         │
         ↓
┌──────────────┐
│   Frontend   │
│              │
│ Receives JWT │ ← Stores in localStorage
│ Stores token │ ← Uses for future requests
│              │ ← Redirects to dashboard
└──────────────┘
```

### **Real-time Chat Flow**

```
┌──────────────────────────────────────────────────────┐
│           Real-Time Messaging (Socket.io)           │
└──────────────────────────────────────────────────────┘

Student Browser              Backend                Employer Browser
    │                           │                         │
    │─── "Type message" ────────→│                         │
    │                   (socket)  │                         │
    │                            │── store in DB ──→       │
    │                            │── emit to room ────→    │
    │                            │── broadcast ─────────→  │
    │←─── Real-time update ──────│                         │
    │          (JSON)            │←─ Receive message ──────│
    │                            │                         │
    │ Message appears instantly  │   Message appears       │
    │ in chat window            │   instantly in chat      │
    │                            │                         │
    └────────────────────────────────────────────────────┘
```

### **Application Status Workflow**

```
Student Applies
       ↓
Status: PENDING ← Employer Reviews
       ↓
  ┌────┴─────────┬──────────────┐
  ↓              ↓              ↓
SHORTLISTED   DECLINED      (Waiting)
  ↓
HIRED ← Employer Makes Final Decision
  ↓
✅ ACCEPTED - Student starts work
  ↓
Payment → Review → Ratings
```

---

## 📁 Project Structure Summary

```
GigHive_Saazu/
│
├── 📁 gighive-backend/              # Backend Node.js server
│   ├── server.js                    # Main server file
│   ├── package.json
│   ├── 📁 config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── mailer.js                # Email setup
│   ├── 📁 models/                   # Database schemas
│   │   ├── user.js
│   │   ├── gig.js
│   │   ├── message.js
│   │   ├── profile.js
│   │   ├── review.js
│   │   └── reel.js
│   ├── 📁 routes/                   # API endpoints
│   │   ├── user.js
│   │   ├── gig.js
│   │   ├── profile.js
│   │   ├── dashboard.js
│   │   ├── message.js
│   │   └── conversation.js
│   ├── 📁 controllers/              # Business logic
│   │   ├── user.js
│   │   ├── gig.js
│   │   ├── profile.js
│   │   └── dashboardController.js
│   ├── 📁 middleware/               # Auth & validation
│   │   └── user.js
│   ├── 📁 services/                 # Utilities
│   │   ├── mediaUploader.js
│   │   ├── storageService.js
│   │   └── dashboardService.js
│   └── 📁 temp/                     # Temporary files
│
├── 📁 src/                          # Frontend React code
│   ├── main.jsx                     # Entry point
│   ├── App.jsx                      # Main app component
│   ├── index.css
│   ├── App.css
│   ├── 📁 components/
│   │   ├── auth/                    # Login/Signup
│   │   ├── student/                 # Student pages
│   │   ├── employer/                # Employer pages
│   │   ├── admin/                   # Admin pages
│   │   ├── dashboards/              # Dashboard containers
│   │   ├── pages/                   # Public pages
│   │   ├── layout/                  # Header/Footer
│   │   ├── ui/                      # UI components
│   │   └── figma/                   # Custom components
│   ├── 📁 styles/
│   │   └── globals.css
│   └── 📁 assets/
│       └── react.svg
│
├── 📁 public/                       # Static files
│   └── vite.svg
│
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite configuration
├── eslint.config.js                 # Linting rules
├── index.html                       # HTML entry point
│
└── SRS.md                           # This document!
```

---

## 🔐 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - Bcryptjs encryption  
✅ **CORS Protection** - Controlled origin access  
✅ **OTP Verification** - Email verification for signup  
✅ **Role-Based Access Control (RBAC)** - Different permissions per role  
✅ **Middleware Validation** - Request validation before processing  

---

## 📈 Scalability Features

🟢 **MongoDB Atlas** - Handles large datasets  
🟢 **Socket.io** - Efficient real-time messaging  
🟢 **Cloudinary CDN** - Fast video/image delivery  
🟢 **Stateless Backend** - Easy horizontal scaling  
🟢 **Frontend Caching** - Reduced server load  

---

## 🐛 Common Issues & Fixes

### **Issue 1: MongoDB Connection Error**
```
❌ Error: querySrv ENOTFOUND _mongodb._tcp.cluster0...
```
**Fix:**
- Check MONGO_URI in `.env` file
- Verify IP whitelist in MongoDB Atlas
- Ensure internet connection is active

### **Issue 2: Port Already in Use**
```
❌ Error: listen EADDRINUSE :::5001
```
**Fix:**
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
PORT=5002 npm run start
```

### **Issue 3: CORS Error**
```
❌ Error: Access to XMLHttpRequest blocked by CORS
```
**Fix:**
- Check backend CORS configuration in `server.js`
- Ensure frontend runs on correct port (3000)
- Verify allowed origins in backend

### **Issue 4: Missing Dependencies**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support & Contact

- **GitHub:** https://github.com/abhishekmishra4k/GigHive_Saazu
- **Branch:** `abhishek` (main development branch)
- **Issues:** Report bugs via GitHub Issues

---

## ✅ Checklist for New Developers

- [ ] Clone repository
- [ ] Read this SRS document
- [ ] Setup `.env` file with correct MongoDB URI
- [ ] Install backend dependencies (`npm install` in gighive-backend)
- [ ] Install frontend dependencies (`npm install` in root)
- [ ] Start backend server (`npm run start` in gighive-backend)
- [ ] Start frontend server (`npm run dev` in root)
- [ ] Open http://localhost:3000 in browser
- [ ] Test user registration & login
- [ ] Test creating a gig (as employer)
- [ ] Test applying for gig (as student)
- [ ] Test real-time chat functionality

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io](https://socket.io)
- [JWT Basics](https://jwt.io)

---

**Last Updated:** April 2026  
**Status:** ✅ Active Development  
**Version:** 1.0
