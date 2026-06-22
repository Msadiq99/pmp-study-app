import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
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

let _backendAvailable: boolean | null = null;
async function isBackendAvailable(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    _backendAvailable = true;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

function mockResponse(data: any) {
  return { data };
}

const MOCK_USER = { id: 1, email: "demo@pmpstudy.app", username: "DemoUser", is_active: true, created_at: "2026-01-01T00:00:00Z" };

const MOCK_DASHBOARD = {
  readiness_score: 67, documents_uploaded: 3, flashcards_total: 48, quizzes_taken: 12, study_sessions: 28, study_streak: 7,
  mastery_heatmap: [
    { area: "Stakeholder Performance", domain: "people", mastery: 82, questions_attempted: 45, questions_correct: 37, last_studied: "2026-06-20T10:00:00Z" },
    { area: "Team Performance", domain: "people", mastery: 71, questions_attempted: 38, questions_correct: 27, last_studied: "2026-06-19T14:00:00Z" },
    { area: "Planning and Managing Project Work", domain: "process", mastery: 55, questions_attempted: 30, questions_correct: 16, last_studied: "2026-06-18T09:00:00Z" },
    { area: "Managing Project Changes", domain: "process", mastery: 43, questions_attempted: 25, questions_correct: 11, last_studied: "2026-06-17T11:00:00Z" },
    { area: "Managing Project Risks", domain: "process", mastery: 62, questions_attempted: 40, questions_correct: 25, last_studied: "2026-06-20T08:00:00Z" },
    { area: "Engaging Stakeholders", domain: "people", mastery: 88, questions_attempted: 50, questions_correct: 44, last_studied: "2026-06-21T07:00:00Z" },
    { area: "Planning and Managing Schedule", domain: "process", mastery: 35, questions_attempted: 20, questions_correct: 7, last_studied: "2026-06-15T16:00:00Z" },
    { area: "Planning and Managing Budget", domain: "process", mastery: 48, questions_attempted: 22, questions_correct: 11, last_studied: "2026-06-16T10:00:00Z" },
    { area: "Managing Project Quality", domain: "process", mastery: 73, questions_attempted: 35, questions_correct: 26, last_studied: "2026-06-19T09:00:00Z" },
    { area: "Managing Scope", domain: "process", mastery: 59, questions_attempted: 28, questions_correct: 17, last_studied: "2026-06-18T14:00:00Z" },
    { area: "Business Environment", domain: "business_environment", mastery: 41, questions_attempted: 18, questions_correct: 7, last_studied: "2026-06-14T11:00:00Z" },
    { area: "Promoting Team Performance", domain: "people", mastery: 76, questions_attempted: 42, questions_correct: 32, last_studied: "2026-06-20T15:00:00Z" },
  ],
  weak_areas: ["Planning and Managing Schedule", "Business Environment", "Managing Project Changes"],
  recent_quizzes: [
    { id: 1, title: "PMBOK Process Groups", score: 72, date: "2026-06-20T10:00:00Z" },
    { id: 2, title: "EVM Formulas Practice", score: 85, date: "2026-06-19T14:00:00Z" },
  ],
};

const MOCK_FORMULAS = [
  { name: "Cost Performance Index (CPI)", formula: "CPI = EV / AC", category: "evm", description: "Measures cost efficiency. CPI > 1 = under budget", variables: { EV: "Earned Value", AC: "Actual Cost" }, example: "EV=$80K, AC=$100K -> CPI=0.8" },
  { name: "Schedule Performance Index (SPI)", formula: "SPI = EV / PV", category: "evm", description: "Measures schedule efficiency. SPI > 1 = ahead", variables: { EV: "Earned Value", PV: "Planned Value" } },
  { name: "Cost Variance (CV)", formula: "CV = EV - AC", category: "evm", description: "Positive = under budget", variables: { EV: "Earned Value", AC: "Actual Cost" } },
  { name: "Schedule Variance (SV)", formula: "SV = EV - PV", category: "evm", description: "Positive = ahead of schedule", variables: { EV: "Earned Value", PV: "Planned Value" } },
  { name: "Estimate at Completion (EAC)", formula: "EAC = BAC / CPI", category: "evm", description: "Projected total cost", variables: { BAC: "Budget at Completion", CPI: "CPI" } },
  { name: "PERT Estimate", formula: "(O + 4M + P) / 6", category: "risk", description: "Weighted average of 3-point estimates", variables: { O: "Optimistic", M: "Most Likely", P: "Pessimistic" } },
  { name: "Standard Deviation", formula: "(P - O) / 6", category: "risk", description: "Measure of uncertainty", variables: { P: "Pessimistic", O: "Optimistic" } },
  { name: "Expected Monetary Value", formula: "EMV = P x I", category: "risk", description: "Average outcome of risk events", variables: { P: "Probability", I: "Impact" } },
  { name: "Communication Channels", formula: "N(N-1)/2", category: "communication", description: "Number of communication paths", variables: { N: "Team size" } },
  { name: "Return on Investment", formula: "(Net Profit / Cost) x 100", category: "business", description: "Percentage return on investment" },
  { name: "Present Value", formula: "PV = FV / (1+r)^n", category: "business", description: "Current value of future money" },
  { name: "Total Float", formula: "LS - ES or LF - EF", category: "schedule", description: "Time activity can be delayed" },
];

const MOCK_FLASHCARDS = [
  { id: 1, front: "What is the Project Charter?", back: "A document that formally authorizes the existence of a project and provides the PM with authority.", knowledge_area: "Stakeholder Performance", state: 2, due_date: new Date().toISOString(), total_reviews: 5, correct_reviews: 4, difficulty: 0.3, stability: 2.5, retrievability: 0.85 },
  { id: 2, front: "What does CPI > 1 indicate?", back: "The project is under budget.", knowledge_area: "Planning and Managing Budget", state: 2, due_date: new Date().toISOString(), total_reviews: 3, correct_reviews: 2, difficulty: 0.4, stability: 1.8, retrievability: 0.72 },
  { id: 3, front: "What is the Critical Path?", back: "The longest sequence of activities determining project duration.", knowledge_area: "Planning and Managing Schedule", state: 1, due_date: new Date().toISOString(), total_reviews: 2, correct_reviews: 1, difficulty: 0.5, stability: 1.2, retrievability: 0.6 },
];

const MOCK_QUIZ_QUESTIONS = [
  { id: 1, question_text: "What is the primary purpose of the Project Charter?", question_type: "mcq", options: ["A) Authorize the project", "B) Define detailed scope", "C) Assign team members", "D) Set the budget"], correct_answer: "A) Authorize the project", explanation: "The Project Charter formally authorizes the project.", difficulty: 0.3, knowledge_area: "Stakeholder Performance" },
  { id: 2, question_text: "CPI = EV / AC. If CPI = 0.8, the project is:", question_type: "mcq", options: ["A) Under budget", "B) Over budget", "C) On schedule", "D) Ahead"], correct_answer: "B) Over budget", explanation: "CPI < 1 means spending more than planned.", difficulty: 0.3, knowledge_area: "Planning and Managing Budget" },
  { id: 3, question_text: "The PERT formula is (O + 4M + P) / 6.", question_type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "PERT uses weighted average with Most Likely weighted 4x.", difficulty: 0.3, knowledge_area: "Managing Project Risks" },
];

async function apiCall(handler: () => any, fallback?: () => any) {
  if (await isBackendAvailable()) {
    try {
      return await handler();
    } catch (e) {
      if (fallback) return fallback();
      throw e;
    }
  }
  return fallback ? fallback() : Promise.reject(new Error("Backend not available. Run the app with: bash scripts/start.sh"));
}

export const auth = {
  register: (data: any) => apiCall(() => api.post("/api/auth/register", data), () => mockResponse({ access_token: "demo-token", token_type: "bearer", user: MOCK_USER })),
  login: (data: any) => apiCall(() => api.post("/api/auth/login", data), () => mockResponse({ access_token: "demo-token", token_type: "bearer", user: MOCK_USER })),
  me: () => apiCall(() => api.get("/api/auth/me"), () => mockResponse(MOCK_USER)),
};

export const documents = {
  upload: (file: File, knowledgeArea?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (knowledgeArea) formData.append("knowledge_area", knowledgeArea);
    return apiCall(() => api.post("/api/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }), () => mockResponse({ id: Date.now(), filename: file.name, status: "completed", message: "Processed 24 chunks from 15 pages" }));
  },
  list: () => apiCall(() => api.get("/api/documents/"), () => mockResponse([
    { id: 1, filename: "PMBOK_Guide_7th.pdf", original_filename: "PMBOK_Guide_7th.pdf", file_type: "pdf", file_size: 5242880, total_pages: 15, is_processed: true, processing_status: "completed", knowledge_area: null, created_at: "2026-06-15T10:00:00Z", chunk_count: 24 },
  ])),
  delete: (id: number) => apiCall(() => api.delete(`/api/documents/${id}`), () => mockResponse({ status: "deleted" })),
};

export const flashcards = {
  create: (data: any) => apiCall(() => api.post("/api/flashcards/", data), () => mockResponse({ id: Date.now(), ...data, state: 0, due_date: new Date().toISOString(), total_reviews: 0, correct_reviews: 0, difficulty: 0.3, stability: 1.0, retrievability: 1.0 })),
  list: () => apiCall(() => api.get("/api/flashcards/"), () => mockResponse(MOCK_FLASHCARDS)),
  due: (limit?: number) => apiCall(() => api.get(`/api/flashcards/due?limit=${limit || 20}`), () => mockResponse(MOCK_FLASHCARDS)),
  review: (id: number, data: any) => apiCall(() => api.post(`/api/flashcards/${id}/review`, data), () => mockResponse({ flashcard: MOCK_FLASHCARDS[0], next_review: new Date(Date.now() + 86400000 * 3).toISOString(), interval_days: 3 })),
  delete: (id: number) => apiCall(() => api.delete(`/api/flashcards/${id}`), () => mockResponse({ status: "deleted" })),
};

export const quiz = {
  generate: (data: any) => apiCall(() => api.post("/api/quiz/generate", data), () => mockResponse({ id: Date.now(), title: data.title, quiz_type: "practice", knowledge_area: data.knowledge_area, total_questions: data.num_questions || 10, correct_answers: 0, score: 0, is_completed: false, created_at: new Date().toISOString(), questions: MOCK_QUIZ_QUESTIONS.slice(0, data.num_questions || 3) })),
  list: () => apiCall(() => api.get("/api/quiz/"), () => mockResponse([{ id: 1, title: "PMBOK Process Groups", quiz_type: "practice", knowledge_area: null, total_questions: 10, correct_answers: 7, score: 70, is_completed: true, created_at: "2026-06-20T10:00:00Z", questions: [] }])),
  get: (id: number) => apiCall(() => api.get(`/api/quiz/${id}`), () => mockResponse({ id, title: "Practice Quiz", questions: MOCK_QUIZ_QUESTIONS })),
  submit: (id: number, data: any) => apiCall(() => api.post(`/api/quiz/${id}/submit`, data), () => mockResponse({ score: 60 })),
  complete: (id: number) => apiCall(() => api.post(`/api/quiz/${id}/complete`), () => mockResponse({ status: "completed", score: 60 })),
};

export const study = {
  startSession: (type?: string, area?: string) => apiCall(() => api.post(`/api/study/session?session_type=${type || "study"}&knowledge_area=${area || ""}`), () => mockResponse({ id: Date.now(), session_type: type || "study" })),
  endSession: (id: number, data?: any) => apiCall(() => api.put(`/api/study/session/${id}/end`, null, { params: data }), () => mockResponse({ id, duration_minutes: 25 })),
  getPlan: () => apiCall(() => api.get("/api/study/plan"), () => mockResponse({ weak_areas: ["Schedule Management", "Business Environment"], readiness_score: 67, recommended_topics: ["Schedule Management", "Change Control"], estimated_hours: 8 })),
  evaluateVoice: (data: any) => apiCall(() => api.post("/api/study/voice/evaluate", data), () => mockResponse({ understanding_score: 72, strengths: ["Good EVM understanding"], gaps: ["Missed TCPI"], suggestions: ["Review TCPI calculations"] })),
};

export const analytics = {
  dashboard: () => apiCall(() => api.get("/api/analytics/dashboard"), () => mockResponse(MOCK_DASHBOARD)),
  velocity: () => apiCall(() => api.get("/api/analytics/velocity"), () => mockResponse({ avg_questions_per_day: 15, avg_minutes_per_day: 35, total_study_hours: 18.5 })),
};

export const chat = {
  send: (message: string) => apiCall(() => api.post("/api/chat/", { message }), () => mockResponse({ response: `[Demo mode - connect to backend for real AI]\n\nBased on PMBOK Guide, this is an important concept for the PMP exam. Upload your study materials to get personalized answers with source citations.`, sources: [] })),
  explain: (concept: string) => apiCall(() => api.post(`/api/chat/explain?concept=${concept}`), () => mockResponse({ response: `[Demo mode] ${concept} is a key PMP concept. Run the backend for real AI explanations.`, concept })),
};

export const formulas = {
  list: (category?: string) => apiCall(() => api.get(`/api/formulas/${category ? `?category=${category}` : ""}`), () => mockResponse(category ? MOCK_FORMULAS.filter(f => f.category === category) : MOCK_FORMULAS)),
  categories: () => apiCall(() => api.get("/api/formulas/categories"), () => mockResponse(["evm", "risk", "communication", "business", "schedule"])),
  calculate: (name: string, inputs: any) => {
    const nums = Object.values(inputs).map(Number);
    let result = 0;
    if (name.includes("CPI")) result = (inputs.EV || 0) / (inputs.AC || 1);
    else if (name.includes("SPI")) result = (inputs.EV || 0) / (inputs.PV || 1);
    else if (name.includes("Cost Variance")) result = (inputs.EV || 0) - (inputs.AC || 0);
    else if (name.includes("Schedule Variance")) result = (inputs.EV || 0) - (inputs.PV || 0);
    else if (name.includes("Communication")) result = ((inputs.N || 0) * ((inputs.N || 0) - 1)) / 2;
    else result = nums.reduce((a, b) => a + b, 0);
    return apiCall(() => api.post(`/api/formulas/calculate?name=${name}`, inputs), () => mockResponse({ formula: name, result: Math.round(result * 10000) / 10000, inputs }));
  },
};

export const groups = {
  create: (name: string, description?: string) => apiCall(() => api.post(`/api/groups/create?name=${name}&description=${description || ""}`), () => mockResponse({ id: Date.now(), name, invite_code: "PMP" + Math.random().toString(36).substring(2, 8).toUpperCase() })),
  join: (code: string) => apiCall(() => api.post(`/api/groups/join?invite_code=${code}`), () => mockResponse({ message: "Joined group", group_id: 1 })),
  my: () => apiCall(() => api.get("/api/groups/my"), () => mockResponse([{ id: 1, name: "PMP Study Group", invite_code: "PMP2026X" }])),
  members: (id: number) => apiCall(() => api.get(`/api/groups/${id}/members`), () => mockResponse([{ user_id: 1, username: "DemoUser", role: "admin" }])),
};

export const exam = {
  simulate: () => apiCall(() => api.post("/api/exam/simulate"), () => mockResponse({ quiz_id: 999, total_questions: 180, time_limit_minutes: 230, domains: { people: { weight: 0.42, name: "People" }, process: { weight: 0.50, name: "Process" }, business_environment: { weight: 0.08, name: "Business Environment" } }, instructions: ["230 minutes for 180 questions", "Mix of predictive, agile, and hybrid", "Based on PMBOK 7th Edition"] })),
  status: (id: number) => apiCall(() => api.get(`/api/exam/${id}/status`), () => mockResponse({ quiz_id: id, total_questions: 180, score: 0, is_completed: false })),
};

export const ittos = {
  graph: () => apiCall(() => api.get("/api/ittos/graph"), () => mockResponse({
    nodes: [
      { id: "process-1", type: "default", data: { label: "Develop Project Charter", category: "Process" }, position: { x: 400, y: 250 }, style: { backgroundColor: "#3b82f6", color: "white", padding: "15px", borderRadius: "8px" } },
      { id: "input-1", type: "input", data: { label: "Business Case", category: "Input" }, position: { x: 50, y: 150 }, style: { backgroundColor: "#10b981", color: "white", padding: "10px", borderRadius: "4px" } },
      { id: "output-1", type: "output", data: { label: "Project Charter", category: "Output" }, position: { x: 750, y: 200 }, style: { backgroundColor: "#ef4444", color: "white", padding: "10px", borderRadius: "4px" } }
    ],
    edges: [
      { id: "e1", source: "input-1", target: "process-1", animated: true, style: { stroke: "#10b981" } },
      { id: "e7", source: "process-1", target: "output-1", animated: true, style: { stroke: "#ef4444" } }
    ]
  })),
  explain: (id: string) => apiCall(() => api.get(`/api/ittos/nodes/${id}/explanation`), () => mockResponse({ explanation: "[Demo] This element is critical for the Develop Project Charter process." })),
};

const apiClient = { get: (url: string) => api.get(url), post: (url: string, data?: any) => api.post(url, data), put: (url: string, data?: any) => api.put(url, data), delete: (url: string) => api.delete(url) };
export default apiClient;
