import axios from "axios";

// Create a centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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

export const predictBoard = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // Must match the 'file' parameter in FastAPI

  const response = await api.post("/ai/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // Expecting { fen: "...", lichess_url: "..." }
};

export const saveBoardToLibrary = async (file: File, fen: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fen", fen); // Pass the FEN so the backend doesn't have to calculate it again

  const response = await api.post("/fen/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Protect the route
    },
  });

  return response.data;
};

export const getUserLibrary = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await api.get("/fen/library", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // Expecting an array of { id, fen, image_url, created_at }
};

export const deleteBoardFromLibrary = async (boardId: string | number) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  await api.delete(`/fen/library/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch a single board by ID
export const getBoard = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await api.get(`/fen/library/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update a board (FEN, Category, Notes)
export const updateBoard = async (
  id: string,
  updates: { fen?: string; category?: string; notes?: string },
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await api.patch(`/fen/library/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
