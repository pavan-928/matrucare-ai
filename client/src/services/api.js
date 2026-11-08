import axios from 'axios';

// withCredentials sends the HTTP-only auth cookie on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

/** Turns an Axios error into { message, code, fieldErrors } for forms and toasts. */
export const parseError = (err) => {
  const data = err?.response?.data;
  const fieldErrors = {};
  (data?.errors || []).forEach((e) => {
    // express-validator paths look like teamMembers[0].name; forms use teamMembers.0.name
    fieldErrors[String(e.field).replace(/\[(\d+)\]/g, '.$1')] = e.message;
  });
  return {
    message: data?.message || (err?.request ? 'Cannot reach the server. Check your connection.' : 'Something went wrong'),
    code: data?.code,
    status: err?.response?.status,
    fieldErrors,
  };
};

export const authApi = {
  signup: (body) => api.post('/auth/signup', body),
  verifyOtp: (body) => api.post('/auth/verify-otp', body),
  resendOtp: (body) => api.post('/auth/resend-otp', body),
  login: (body) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
};
export const userApi = {
  me: () => api.get('/user/me'),
  update: (body) => api.put('/user/update', body),
};
export const hackathonApi = {
  register: (body) => api.post('/hackathon/register', body),
  myEntry: () => api.get('/hackathon/my-entry'),
  update: (id, body) => api.put(`/hackathon/${id}`, body),
  remove: (id) => api.delete(`/hackathon/${id}`),
};
export const contactApi = { send: (body) => api.post('/contact', body) };

export default api;
