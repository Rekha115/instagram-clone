# Instagram Clone (MERN Stack)

A fully functional, modern, and visually polished Instagram Clone featuring photo and video uploads, real-time feedback, social interactions, notifications, and user profile management. This project is built using the MERN stack (MongoDB, Express, React, Node.js) with styled components utilizing Tailwind CSS.

---

## 🚀 Key Features

* **Authentication & User Management**: Secure registration, login, and profile editing (including unique username validation).
* **Interactive Feed**: A personalized feed showing posts and reels from followed users.
* **Explore Page**: A global post discovery page sorted by popularity (likes) and upload date.
* **Instagram Reels**: Seamless, snap-scrolling video reels view with autoplay and mute toggles.
* **Creation System**: Modern post & reel creation modal supporting multi-image uploads, video uploads, captions, and location mapping.
* **Social Connections**: Follow and unfollow users with dynamic follower/following relationship checks.
* **Engagement Tools**: Like/unlike posts and comment system with live count updates.
* **Real-time Notifications**: Read and unread notifications count triggers for likes, follows, and comments.
* **Development Local Mode Fallback**: Automatically falls back to local base64 media storage when Cloudinary credentials are not configured, enabling zero-setup local testing.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite (Fast Bundling)
* **Styling**: Tailwind CSS (Modern Glassmorphic Dark Aesthetics)
* **Icons**: Lucide React
* **Client Routing**: React Router DOM
* **API Client**: Axios

### Backend
* **Runtime**: Node.js (ESM Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Validation**: Express Validator
* **Authentication**: JSON Web Tokens (JWT) & Cookie Parser
* **Media Processing**: Multer & Cloudinary

---

## 📂 Folder Structure

```text
instagram-clone/
├── backend/
│   ├── config/             # DB & Cloudinary configs
│   ├── controllers/        # Request handling logic
│   ├── middleware/         # Auth, Upload, Validation & Error handlers
│   ├── models/             # Mongoose Schemas (User, Post, Comment, etc.)
│   ├── routes/             # Express API Endpoints
│   ├── validators/         # Request schema validation rules
│   ├── .env.example        # Reference environment variables
│   ├── seed.js             # Local database populator/seeder
│   └── server.js           # Express main server entrypoint
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── api/            # API request clients (Axios instances)
│   │   ├── components/     # UI components (Layout, Post, User, Common)
│   │   ├── context/        # React Authentication Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Pages (Home, Reels, Profile, Explore)
│   │   ├── utils/          # Helpers & formatters
│   │   ├── App.jsx         # Core app routing
│   │   └── main.jsx        # React entrypoint
│   ├── .env.example        # Frontend API URL configuration
│   ├── tailwind.config.js  # Tailwind design system configuration
│   └── vite.config.js      # Vite compilation configuration
└── .gitignore              # Global git configuration
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/instagram
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_DAYS=7
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Configuration (App runs in local mock mode if left empty)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/instagram-clone.git
cd instagram-clone
```

### Step 2: Configure and Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   ```bash
   copy .env.example .env
   ```
4. (Optional) Run the database seeder to populate sample users, posts, and reels:
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### Step 3: Configure and Start the Frontend
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   ```bash
   copy .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to **`http://localhost:5173`**.

---

