import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("medimind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("medimind_token");
      localStorage.removeItem("medimind_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
