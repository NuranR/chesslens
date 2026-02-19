import axios from "axios";

// Create a centralized Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  // FastAPI OAuth2 strictly requires Form Data
  const formData = new URLSearchParams();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  // Registration can use standard JSON based on the backend Pydantic model
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  // Optional: Redirect or refresh the page
  window.location.href = "/login";
};

export default api;
