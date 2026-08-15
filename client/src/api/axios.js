import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// withCredentials lets the browser send/receive the httpOnly refresh-token cookie.
const api = axios.create({ baseURL, withCredentials: true });

// The access token is kept only in memory (not localStorage) so it can't be
// read by an injected script via XSS. It's lost on full page reload by design;
// the app re-authenticates via the refresh cookie on load (see AuthContext).
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        // Coalesce concurrent 401s into a single refresh call.
        refreshPromise = refreshPromise || api.post('/api/auth/refresh');
        const res = await refreshPromise;
        refreshPromise = null;
        setAccessToken(res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
