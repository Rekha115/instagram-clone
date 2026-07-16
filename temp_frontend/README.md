# Instagram Clone — Frontend

A complete React (Vite) frontend built to match the provided Node/Express/MongoDB
backend (`instagram-clone-backend.zip`) route-for-route: auth, feed, explore,
reels, profiles, follow/unfollow, likes, comments, saved posts, and
notifications.

## Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS (Instagram-style dark theme)
- Axios (cookie + Bearer-token dual auth, matching the backend's dual support)
- lucide-react icons, react-hot-toast, date-fns

## 1. Run the backend first

From the backend project (the one in `instagram-clone-backend.zip`):

```bash
cd backend
cp .env.example .env
# then fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env
npm install
npm run dev
```

The backend listens on `http://localhost:5000` by default and expects the
frontend to run at `http://localhost:5173` (`CLIENT_URL` in its `.env`) — that's
already Vite's default port, so no changes are needed for local dev.

## 2. Run this frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api is already correct for local dev
npm install
npm run dev
```

Open `http://localhost:5173`.

## How the connection works

- `src/api/axios.js` creates one Axios instance pointed at `VITE_API_URL`
  (defaults to `http://localhost:5000/api`, matching `app.use('/api/...')` in
  `server.js`).
- The backend's `sendTokenResponse` sets an **httpOnly cookie** *and* returns
  the JWT in the JSON body. This frontend does both: it sends
  `withCredentials: true` on every request (so the cookie flows automatically)
  **and** stores the token from the response in `localStorage`, attaching it
  as `Authorization: Bearer <token>` on every request via an Axios
  interceptor. This means auth keeps working even if you later deploy the
  frontend and backend on different domains (where the cookie would need
  `sameSite: none` + HTTPS).
- Every function in `src/api/*.js` is commented with the exact backend route
  and controller it calls, and mirrors the request/response shape used by
  that controller (e.g. `POST /api/posts` uses a multipart field named
  `media`, `PATCH /api/users/me/avatar` uses `profilePicture`, login uses an
  `identifier` field that accepts either email or username, etc.) — these
  match `middleware/upload.js` and the validators exactly, so a mismatch here
  would cause real request failures, not just a style issue.
- `AuthContext` restores a session on page load by calling `GET /api/auth/me`
  whenever a stored token exists.

## Pages included

| Route | Page | Backend endpoints used |
|---|---|---|
| `/login`, `/register` | Auth | `/api/auth/*` |
| `/` | Home feed | `GET /api/posts/feed` |
| `/explore` | Explore grid | `GET /api/posts/explore` |
| `/reels` | Reels (scroll-snap video feed) | `GET /api/posts/reels` |
| `/:username` | Profile (posts grid, saved tab for own profile, followers/following modal) | `/api/users/:username`, `/api/posts/user/:username`, `/api/users/me/saved` |
| `/accounts/edit` | Edit profile + avatar | `PATCH /api/users/me`, `PATCH /api/users/me/avatar` |
| `/p/:postId` | Post detail + comments | `GET /api/posts/:postId`, `/api/posts/:postId/comments` |
| `/notifications` | Notifications | `/api/notifications*` |

Post creation, like/unlike, save/unsave, follow/unfollow, and commenting are
available inline from the feed, post detail page, and the "Create" button in
the sidebar/mobile nav.

## Notes on backend-shaped quirks the frontend accounts for

- `GET /api/posts/user/:username` (profile grid) intentionally returns a
  reduced post shape without `isLikedByMe` — that's only needed in the feed
  and post-detail views, which use the full shaped post from
  `GET /api/posts/:postId` or `GET /api/posts/feed`.
- Like/unlike and follow/unfollow endpoints return only a count/message, not
  the full updated object, so the UI updates optimistically and reconciles
  the count from the response.
- There's no backend endpoint for a single reel by post id filtered per-user,
  or for a user's reels specifically — so the Profile page only shows a
  Posts/Saved tab, matching what `postController.js` actually exposes.
- `shapePost()` on the backend only adds `isLikedByMe`, not an
  `isSavedByMe` flag, so the bookmark icon on the feed/post-detail page
  can't know a post's saved state up front — it starts unfilled and
  reflects whatever you toggle during the session. The Saved tab on your
  own profile (`GET /api/users/me/saved`) is the source of truth for what's
  actually saved.

