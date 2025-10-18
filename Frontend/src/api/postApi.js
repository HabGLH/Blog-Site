import axiosClient from "./axiosClient";

const postApi = {
  // params: optional { tag }
  getAll: (params) => axiosClient.get("/posts", { params }),
  getById: (id) => axiosClient.get(`/posts/${id}`),
  create: (data) => axiosClient.post("/posts", data),
  update: (id, data) => axiosClient.put(`/posts/${id}`, data),
  remove: (id) => axiosClient.delete(`/posts/${id}`),
  // like toggle
  toggleLike: (id) => axiosClient.post(`/posts/${id}/like`),
  // comments
  addComment: (id, data) => axiosClient.post(`/posts/${id}/comments`, data),
  deleteComment: (id, commentId) =>
    axiosClient.delete(`/posts/${id}/comments/${commentId}`),
};

export default postApi;
