const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === 'production';

// In production the frontend and API live on different domains (Vercel + Render),
// so the cookie must be SameSite=None and Secure. Locally Lax works fine.
const cookieOptions = {
  httpOnly: true, // not readable from JavaScript, which protects the token from XSS
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SEVEN_DAYS_MS });
const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions);

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie };
