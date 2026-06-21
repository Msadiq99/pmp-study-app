import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

export const documents = {
  upload: (file: File, knowledgeArea?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (knowledgeArea) formData.append("knowledge_area", knowledgeArea);
    return api.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: () => api.get("/api/documents/"),
  delete: (id: number) => api.delete(`/api/documents/${id}`),
};

export const flashcards = {
  create: (data: { front: string; back: string; knowledge_area?: string }) =>
    api.post("/api/flashcards/", data),
  list: () => api.get("/api/flashcards/"),
  due: (limit?: number) => api.get(`/api/flashcards/due?limit=${limit || 20}`),
  review: (id: number, data: { rating: number; review_time_ms?: number }) =>
    api.post(`/api/flashcards/${id}/review`, data),
  delete: (id: number) => api.delete(`/api/flashcards/${id}`),
};

export const quiz = {
  generate: (data: {
    title: string;
    knowledge_area?: string;
    num_questions?: number;
    question_types?: string[];
  }) => api.post("/api/quiz/generate", data),
  list: () => api.get("/api/quiz/"),
  get: (id: number) => api.get(`/api/quiz/${id}`),
  submit: (id: number, data: { question_id: number; answer: string }) =>
    api.post(`/api/quiz/${id}/submit`, data),
  complete: (id: number) => api.post(`/api/quiz/${id}/complete`),
};

export const study = {
  startSession: (type?: string, area?: string) =>
    api.post(
      `/api/study/session?session_type=${type || "study"}&knowledge_area=${area || ""}`
    ),
  endSession: (id: number, data?: any) =>
    api.put(`/api/study/session/${id}/end`, null, { params: data }),
  getPlan: () => api.get("/api/study/plan"),
  evaluateVoice: (data: { text: string; topic?: string }) =>
    api.post("/api/study/voice/evaluate", data),
};

export const analytics = {
  dashboard: () => api.get("/api/analytics/dashboard"),
  velocity: () => api.get("/api/analytics/velocity"),
};

export const chat = {
  send: (message: string) => api.post("/api/chat/", { message }),
  explain: (concept: string) =>
    api.post(`/api/chat/explain?concept=${concept}`),
};

export const formulas = {
  list: (category?: string) =>
    api.get(`/api/formulas/${category ? `?category=${category}` : ""}`),
  categories: () => api.get("/api/formulas/categories"),
  calculate: (name: string, inputs: any) =>
    api.post(`/api/formulas/calculate?name=${name}`, inputs),
};

export const groups = {
  create: (name: string, description?: string) =>
    api.post(
      `/api/groups/create?name=${name}&description=${description || ""}`
    ),
  join: (code: string) => api.post(`/api/groups/join?invite_code=${code}`),
  my: () => api.get("/api/groups/my"),
  members: (id: number) => api.get(`/api/groups/${id}/members`),
};

export const exam = {
  simulate: () => api.post("/api/exam/simulate"),
  status: (id: number) => api.get(`/api/exam/${id}/status`),
};

export default api;
