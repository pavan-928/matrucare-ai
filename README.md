# MatruCare AI Hackathon Registration Portal

A full-stack MERN portal where students sign up, verify their email with an OTP, log in, and register their team and project for the **MatruCare AI Hackathon**. Built for the MatruCare AI Full Stack Developer Internship Programme.

- **Live frontend:** `https://your-frontend-url.vercel.app` (placeholder)
- **Live backend:** `https://your-backend-url.onrender.com` (placeholder)

## Features

- Landing page with hero, highlights, timeline, prizes, tracks, about and contact sections
- Signup with bcrypt-hashed passwords and a 6-digit email OTP (expires in 10 minutes, single use, 5 attempts)
- Resend OTP with a 30-second cooldown
- Login with JWT stored in an **HTTP-only cookie**; unverified accounts are blocked
- Protected dashboard showing profile, registration status, project and team details
- Registration form with frontend and backend validation, dynamic team member fields (1 to 5), duplicate prevention, and a confirmation email
- Full CRUD for a registration: create, read (dashboard), update (`Edit registration`), delete
- Contact form saved to MongoDB and forwarded to the company inbox
- Responsive design with loading, error and success states

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router DOM 6, Axios, Lucide React, React Hot Toast |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, express-validator, helmet, express-rate-limit |

## Folder structure

```
matrucare-ai-hackathon/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, Field, OtpInput, TeamMembers, ProtectedRoute...
│   │   ├── pages/        # Home, Signup, VerifyOtp, Login, Dashboard, Register, Contact...
│   │   ├── layouts/      # MainLayout
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useAuth
│   │   ├── services/     # api.js (Axios + endpoints)
│   │   ├── utils/        # constants.js, validators.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── server/
│   ├── config/           # db.js
│   ├── controllers/      # auth, user, hackathon, contact
│   ├── middleware/       # auth (JWT), validators, error handling
│   ├── models/           # User, Registration, Contact
│   ├── routes/
│   ├── services/         # emailService, otpService
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Installation

Requirements: Node.js 18+, npm, and a MongoDB database (local or Atlas).

```bash
git clone <your-repo-url>
cd matrucare-ai-hackathon
```

### Backend setup

```bash
cd server
npm install
cp .env.example .env     # Windows: copy .env.example .env
# edit .env (see below)
npm run dev              # API on http://localhost:5000
```

### Frontend setup

```bash
cd client
npm install
cp .env.example .env
npm run dev              # App on http://localhost:5173
```

### MongoDB configuration

- **Local:** install MongoDB Community and use `MONGO_URI=mongodb://127.0.0.1:27017/matrucare-hackathon`.
- **Atlas:** create a free cluster, add a database user, allow your IP under *Network Access* (use `0.0.0.0/0` for Render/Railway), then copy the connection string into `MONGO_URI` and add a database name, e.g. `...mongodb.net/matrucare-hackathon?retryWrites=true&w=majority`.

### Gmail App Password configuration

1. Sign in to the Gmail account you own and want to use for development/testing.
2. Turn on **2-Step Verification** (Google Account → Security).
3. Open **App passwords**, create one named "MatruCare Portal", and copy the 16-character code.
4. Paste it into `EMAIL_PASS` in `server/.env` (no spaces). Never commit it.

Emails use **MatruCare AI** as the sender display name and the address configured in `EMAIL_USER` as the actual sender. For final evaluation, use the official `matrucareai@gmail.com` account only if the assignment provider gives you authorized access; do not impersonate an account you do not control.

> **Local testing / troubleshooting:** when the server starts it checks the Gmail login and prints `[email] Gmail login OK` or a plain-English reason it failed. In development, if `EMAIL_PASS` is empty **or Gmail rejects the message**, the email (including the OTP) is printed in the backend terminal instead, so you can always finish signup. In production, failures return an error.

## Environment variables

**server/.env**

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign JWTs and hash OTPs |
| `EMAIL_USER` | Your authorized Gmail sender address |
| `EMAIL_PASS` | Gmail App Password |
| `CLIENT_URL` | Frontend origin for CORS, e.g. `http://localhost:5173` (comma-separate several) |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL including `/api`, e.g. `http://localhost:5000/api` |

## API documentation

Base URL: `/api`. Authenticated routes use the `token` HTTP-only cookie. Errors return `{ "message": "...", "errors": [{ "field", "message" }] }`.

### Auth

| Method | Endpoint | Body | Notes |
|---|---|---|---|
| POST | `/auth/signup` | `fullName, email, password, confirmPassword` | Creates an unverified user and emails an OTP |
| POST | `/auth/verify-otp` | `email, otp` | Marks the user verified and invalidates the OTP |
| POST | `/auth/resend-otp` | `email` | 30-second cooldown |
| POST | `/auth/login` | `email, password` | Sets the auth cookie; `403 NOT_VERIFIED` if unverified |
| POST | `/auth/logout` | none | Clears the cookie |

### User (auth required)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/user/me` | Current user (no password or OTP data) |
| PUT | `/user/update` | Body `{ fullName }` |

### Hackathon (auth required)

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/hackathon/register` | Creates the registration (one per user, `409` if it exists) and sends the confirmation email |
| GET | `/hackathon/my-entry` | `{ registration }` or `{ registration: null }` |
| PUT | `/hackathon/:id` | Updates your own registration |
| DELETE | `/hackathon/:id` | Deletes your own registration |

Registration body: `fullName, mobileNumber, collegeName, course, branch, yearOfStudy, domain, projectName, pptLink, prototypeLink, demoVideoLink?, teamSize, teamMembers[{name,email}]`. `email` is always the verified account email. **Team size 1 is solo and takes an empty `teamMembers` array; sizes 2 to 5 require exactly that many members.**

### Contact

| Method | Endpoint | Body |
|---|---|---|
| POST | `/contact` | `name, email, message` |

## Manual test checklist

1. Sign up, then check the email (or server console) for the OTP.
2. Enter a wrong OTP: error. Wait 10 minutes (or edit `otpExpiresAt` in the DB): "expired".
3. Verify with the right OTP, then log in and open the dashboard. Visiting `/dashboard` while logged out redirects to login.
4. Register: change team size 1 to 5 and check member fields appear, keep typed values and validate.
5. Try registering twice: blocked. Edit and delete from the dashboard.

## Deployment

### Database: MongoDB Atlas
Create a cluster and copy the connection string (see above).

### Backend: Render (or Railway)
1. New **Web Service** from your GitHub repo, **Root Directory** `server`.
2. Build command `npm install`, start command `npm start`.
3. Add env vars: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, and `CLIENT_URL` set to your deployed frontend URL (no trailing slash).
4. Deploy and note the URL, e.g. `https://matrucare-api.onrender.com`.

### Frontend: Vercel (or Netlify)
1. Import the repo, **Root Directory** `client`, framework preset **Vite**.
2. Add `VITE_API_URL=https://<your-backend>/api`.
3. Deploy. `vercel.json` and `public/_redirects` already handle SPA routing for Vercel and Netlify.
4. Copy the frontend URL back into the backend's `CLIENT_URL` and redeploy the backend.

**Production cookies:** with `NODE_ENV=production` the auth cookie is `Secure` and `SameSite=None` so it works across the Vercel and Render domains. This requires HTTPS on both, which both platforms provide. Render free instances sleep when idle, so the first request after a pause can take about 30 seconds.

## Customising event content

Dates, prizes, tracks and social links on the home page are sample values in `client/src/utils/constants.js`. Replace them with the real event details before submitting.

## Screenshots

Add screenshots to a `screenshots/` folder and link them here:

- Home page: `screenshots/home.png`
- Signup and OTP: `screenshots/otp.png`
- Dashboard: `screenshots/dashboard.png`
- Registration form: `screenshots/register.png`

## Security notes

Passwords are hashed with bcrypt (cost 12). OTPs are stored only as HMAC hashes, expire after 10 minutes, are cleared on success and lock after 5 wrong attempts. JWTs live in HTTP-only cookies. Responses never include password or OTP fields. Requests are validated with express-validator, CORS is limited to `CLIENT_URL`, auth routes are rate limited, and `.env` files are git-ignored.
