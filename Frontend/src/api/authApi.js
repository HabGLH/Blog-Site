import axiosClient from "./axiosClient";

const authApi = {
  login: (email, password) =>
    axiosClient.post("/auth/login", { email, password }),
  register: (username, email, password) =>
    axiosClient.post("/auth/register", { username, email, password }),
  logout: () => axiosClient.post("/auth/logout"),
  updateProfile: (data) => axiosClient.put("/auth/profile", data),
};

export default authApi;
