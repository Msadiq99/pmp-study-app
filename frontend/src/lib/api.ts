const IS_STATIC = typeof window !== "undefined" && !window.location.hostname.includes("localhost");

const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const mockResponse = (data: any) => ({ data });

const MOCK_USER = { id: 1, email: "demo@pmpstudy.app", username: "DemoUser", is_active: true, created_at: "2026-01-01T00:00:00Z" };

const MOCK_DASHBOARD = {
  readiness_score: 67,
  documents_uploaded: 3,
  flashcards_total: 48,
  quizzes_taken: 12,
  study_sessions: 28,
  study_streak: 7,
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
  weak_areas: ["Planning and Managing Schedule", "Business Environment", "Managing Project Changes", "Planning and Managing Budget"],
  recent_quizzes: [
    { id: 1, title: "PMBOK Process Groups", score: 72, date: "2026-06-20T10:00:00Z" },
    { id: 2, title: "EVM Formulas Practice", score: 85, date: "2026-06-19T14:00:00Z" },
    { id: 3, title: "Risk Management Quiz", score: 58, date: "2026-06-18T09:00:00Z" },
  ],
};

const MOCK_FORMULAS = [
  { name: "Cost Performance Index (CPI)", formula: "CPI = EV / AC", category: "evm", description: "Measures cost efficiency. CPI > 1 = under budget", variables: { EV: "Earned Value", AC: "Actual Cost" }, example: "EV=$80K, AC=$100K → CPI=0.8 (over budget)" },
  { name: "Schedule Performance Index (SPI)", formula: "SPI = EV / PV", category: "evm", description: "Measures schedule efficiency. SPI > 1 = ahead", variables: { EV: "Earned Value", PV: "Planned Value" }, example: "EV=$80K, PV=$70K → SPI=1.14 (ahead)" },
  { name: "Cost Variance (CV)", formula: "CV = EV - AC", category: "evm", description: "Positive = under budget", variables: { EV: "Earned Value", AC: "Actual Cost" } },
  { name: "Schedule Variance (SV)", formula: "SV = EV - PV", category: "evm", description: "Positive = ahead of schedule", variables: { EV: "Earned Value", PV: "Planned Value" } },
  { name: "Estimate at Completion (EAC)", formula: "EAC = BAC / CPI", category: "evm", description: "Projected total cost at completion", variables: { BAC: "Budget at Completion", CPI: "Cost Performance Index" } },
  { name: "PERT Estimate", formula: "(O + 4M + P) / 6", category: "risk", description: "Weighted average of three-point estimates", variables: { O: "Optimistic", M: "Most Likely", P: "Pessimistic" } },
  { name: "Standard Deviation", formula: "(P - O) / 6", category: "risk", description: "Measure of estimate uncertainty", variables: { P: "Pessimistic", O: "Optimistic" } },
  { name: "Expected Monetary Value", formula: "EMV = P × I", category: "risk", description: "Average outcome of risk events", variables: { P: "Probability", I: "Impact" } },
  { name: "Communication Channels", formula: "N(N-1)/2", category: "communication", description: "Number of communication paths", variables: { N: "Team size" } },
  { name: "Return on Investment", formula: "(Net Profit / Cost) × 100", category: "business", description: "Percentage return on investment", variables: { "Net Profit": "Profit", Cost: "Investment" } },
  { name: "Present Value", formula: "PV = FV / (1+r)^n", category: "business", description: "Current value of future money", variables: { FV: "Future Value", r: "Discount rate", n: "Periods" } },
  { name: "Critical Path", formula: "Longest path through network", category: "schedule", description: "Sequence determining min duration", variables: {} },
  { name: "Total Float", formula: "LS - ES or LF - EF", category: "schedule", description: "Time activity can be delayed", variables: { LS: "Late Start", ES: "Early Start", LF: "Late Finish", EF: "Early Finish" } },
];

const MOCK_FLASHCARDS = [
  { id: 1, front: "What is the Project Charter?", back: "A document that formally authorizes the existence of a project and provides the PM with authority to apply resources.", knowledge_area: "Stakeholder Performance", state: 2, due_date: new Date().toISOString(), total_reviews: 5, correct_reviews: 4, difficulty: 0.3, stability: 2.5, retrievability: 0.85 },
  { id: 2, front: "What does CPI > 1 indicate?", back: "The project is under budget - getting more value per dollar spent than planned.", knowledge_area: "Planning and Managing Budget", state: 2, due_date: new Date().toISOString(), total_reviews: 3, correct_reviews: 2, difficulty: 0.4, stability: 1.8, retrievability: 0.72 },
  { id: 3, front: "What is the Critical Path?", back: "The longest sequence of activities through a network diagram that determines the shortest possible project duration.", knowledge_area: "Planning and Managing Schedule", state: 1, due_date: new Date().toISOString(), total_reviews: 2, correct_reviews: 1, difficulty: 0.5, stability: 1.2, retrievability: 0.6 },
  { id: 4, front: "What is EMV?", back: "Expected Monetary Value = Probability × Impact. Used in quantitative risk analysis.", knowledge_area: "Managing Project Risks", state: 2, due_date: new Date().toISOString(), total_reviews: 4, correct_reviews: 3, difficulty: 0.35, stability: 2.0, retrievability: 0.78 },
  { id: 5, front: "Define Scope Creep", back: "Uncontrolled changes or continuous expansion of project scope without adjustments to time, cost, and resources.", knowledge_area: "Managing Scope", state: 0, due_date: new Date().toISOString(), total_reviews: 0, correct_reviews: 0, difficulty: 0.3, stability: 1.0, retrievability: 1.0 },
];

const MOCK_QUIZ_QUESTIONS = [
  { id: 1, question_text: "What is the primary purpose of the Project Charter?", question_type: "mcq", options: ["A) Authorize the project", "B) Define detailed scope", "C) Assign team members", "D) Set the budget"], correct_answer: "A) Authorize the project", explanation: "The Project Charter formally authorizes the project and gives the PM authority.", difficulty: 0.3, knowledge_area: "Stakeholder Performance" },
  { id: 2, question_text: "In predictive project management, scope changes are managed through:", question_type: "mcq", options: ["A) Informal discussions", "B) Formal change control process", "C) PM's discretion", "D) Team voting"], correct_answer: "B) Formal change control process", explanation: "Predictive projects use formal change control for all scope changes.", difficulty: 0.4, knowledge_area: "Managing Project Changes" },
  { id: 3, question_text: "CPI = EV / AC. If CPI = 0.8, the project is:", question_type: "mcq", options: ["A) Under budget", "B) Over budget", "C) On schedule", "D) Ahead of schedule"], correct_answer: "B) Over budget", explanation: "CPI < 1 means the project is spending more than planned.", difficulty: 0.3, knowledge_area: "Planning and Managing Budget" },
  { id: 4, question_text: "The formula for PERT estimate is (O + 4M + P) / 6.", question_type: "true_false", options: ["True", "False"], correct_answer: "True", explanation: "PERT uses a weighted average with Most Likely weighted 4x.", difficulty: 0.3, knowledge_area: "Managing Project Risks" },
  { id: 5, question_text: "Which process group includes the 'Develop Project Charter' process?", question_type: "mcq", options: ["A) Planning", "B) Executing", "C) Initiating", "D) Monitoring & Controlling"], correct_answer: "C) Initiating", explanation: "Develop Project Charter is the first process in the Initiating group.", difficulty: 0.3, knowledge_area: "Stakeholder Performance" },
];

async function apiCall(handler: () => any) {
  if (IS_STATIC) return mockDelay(200).then(handler);
  try {
    const axios = (await import("axios")).default;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const api = axios.create({ baseURL: API_BASE });
    return handler();
  } catch {
    return mockDelay(200).then(handler);
  }
}

export const auth = {
  register: (data: any) => apiCall(() => mockResponse({ access_token: "mock-token", token_type: "bearer", user: MOCK_USER })),
  login: (data: any) => apiCall(() => mockResponse({ access_token: "mock-token", token_type: "bearer", user: MOCK_USER })),
  me: () => apiCall(() => mockResponse(MOCK_USER)),
};

export const documents = {
  upload: (file: File, knowledgeArea?: string) => apiCall(() => mockResponse({ id: Date.now(), filename: file.name, status: "completed", message: "Processed 24 chunks from 15 pages" })),
  list: () => apiCall(() => mockResponse([
    { id: 1, filename: "PMBOK_Guide_7th.pdf", original_filename: "PMBOK_Guide_7th.pdf", file_type: "pdf", file_size: 5242880, total_pages: 15, is_processed: true, processing_status: "completed", knowledge_area: null, created_at: "2026-06-15T10:00:00Z", chunk_count: 24 },
    { id: 2, filename: "PMP_Exam_Preparation.pdf", original_filename: "PMP_Exam_Preparation.pdf", file_type: "pdf", file_size: 3145728, total_pages: 10, is_processed: true, processing_status: "completed", knowledge_area: "Managing Project Risks", created_at: "2026-06-16T14:00:00Z", chunk_count: 18 },
    { id: 3, filename: "Agile_Practice_Guide.pdf", original_filename: "Agile_Practice_Guide.pdf", file_type: "pdf", file_size: 2097152, total_pages: 8, is_processed: true, processing_status: "completed", knowledge_area: null, created_at: "2026-06-17T09:00:00Z", chunk_count: 12 },
  ])),
  delete: (id: number) => apiCall(() => mockResponse({ status: "deleted" })),
};

export const flashcards = {
  create: (data: any) => apiCall(() => mockResponse({ id: Date.now(), ...data, state: 0, due_date: new Date().toISOString(), total_reviews: 0, correct_reviews: 0, difficulty: 0.3, stability: 1.0, retrievability: 1.0, created_at: new Date().toISOString() })),
  list: () => apiCall(() => mockResponse(MOCK_FLASHCARDS)),
  due: (limit?: number) => apiCall(() => mockResponse(MOCK_FLASHCARDS.filter((c) => new Date(c.due_date) <= new Date()).slice(0, limit || 20))),
  review: (id: number, data: any) => apiCall(() => mockResponse({ flashcard: MOCK_FLASHCARDS.find((c) => c.id === id) || MOCK_FLASHCARDS[0], next_review: new Date(Date.now() + 86400000 * 3).toISOString(), interval_days: 3 })),
  delete: (id: number) => apiCall(() => mockResponse({ status: "deleted" })),
};

export const quiz = {
  generate: (data: any) => apiCall(() => mockResponse({ id: Date.now(), title: data.title, quiz_type: "practice", knowledge_area: data.knowledge_area, total_questions: data.num_questions || 10, correct_answers: 0, score: 0, is_completed: false, time_limit_minutes: null, created_at: new Date().toISOString(), questions: MOCK_QUIZ_QUESTIONS.slice(0, data.num_questions || 5) })),
  list: () => apiCall(() => mockResponse([
    { id: 1, title: "PMBOK Process Groups", quiz_type: "practice", knowledge_area: null, total_questions: 10, correct_answers: 7, score: 70, is_completed: true, time_limit_minutes: null, created_at: "2026-06-20T10:00:00Z", questions: [] },
    { id: 2, title: "EVM Formulas Practice", quiz_type: "practice", knowledge_area: "Planning and Managing Budget", total_questions: 15, correct_answers: 13, score: 87, is_completed: true, time_limit_minutes: null, created_at: "2026-06-19T14:00:00Z", questions: [] },
  ])),
  get: (id: number) => apiCall(() => mockResponse({ id, title: "Practice Quiz", quiz_type: "practice", knowledge_area: null, total_questions: 5, correct_answers: 3, score: 60, is_completed: false, time_limit_minutes: null, created_at: new Date().toISOString(), questions: MOCK_QUIZ_QUESTIONS })),
  submit: (id: number, data: any) => apiCall(() => mockResponse({ id, score: 60, correct_answers: 3, total_questions: 5 })),
  complete: (id: number) => apiCall(() => mockResponse({ status: "completed", score: 60 })),
};

export const study = {
  startSession: (type?: string, area?: string) => apiCall(() => mockResponse({ id: Date.now(), session_type: type || "study", knowledge_area: area, duration_minutes: 0, questions_attempted: 0, questions_correct: 0, started_at: new Date().toISOString(), ended_at: null })),
  endSession: (id: number, data?: any) => apiCall(() => mockResponse({ id, duration_minutes: 25, questions_attempted: 10, questions_correct: 7, ended_at: new Date().toISOString() })),
  getPlan: () => apiCall(() => mockResponse({ weak_areas: ["Planning and Managing Schedule", "Business Environment", "Managing Project Changes"], readiness_score: 67, recommended_topics: ["Schedule Management", "Business Environment Analysis", "Change Control"], estimated_hours: 8 })),
  evaluateVoice: (data: any) => apiCall(() => mockResponse({ understanding_score: 72, strengths: ["Good understanding of EVM concepts", "Correctly explained CPI and SPI"], gaps: ["Missed TCPI formula", "Could explain risk responses better"], suggestions: ["Review TCPI calculations", "Practice explaining risk response strategies"], corrected_explanation: "A comprehensive explanation of earned value management..." })),
};

export const analytics = {
  dashboard: () => apiCall(() => mockResponse(MOCK_DASHBOARD)),
  velocity: () => apiCall(() => mockResponse({ avg_questions_per_day: 15, avg_minutes_per_day: 35, total_study_hours: 18.5 })),
};

export const chat = {
  send: (message: string) => apiCall(() => mockResponse({ response: `Great question! Based on the PMBOK Guide, ${message.toLowerCase().includes("cpi") ? "CPI (Cost Performance Index) measures cost efficiency. CPI = EV / AC. A CPI greater than 1.0 indicates the project is under budget." : "this is an important PMP concept. Let me explain it in detail based on the study materials you've uploaded."}\n\nThis concept is frequently tested on the PMP exam. Make sure you understand how it relates to other PMBOK processes.`, sources: [{ filename: "PMBOK_Guide_7th.pdf", page: 42, heading: "Cost Management" }] })),
  explain: (concept: string) => apiCall(() => mockResponse({ response: `${concept} is a key concept in project management. It's defined in the PMBOK Guide and is essential for PMP exam preparation. Understanding this concept will help you in both the exam and real-world project management.`, concept })),
};

export const formulas = {
  list: (category?: string) => apiCall(() => mockResponse(category ? MOCK_FORMULAS.filter((f) => f.category === category) : MOCK_FORMULAS)),
  categories: () => apiCall(() => mockResponse(["evm", "risk", "communication", "business", "schedule"])),
  calculate: (name: string, inputs: any) => {
    const nums = Object.values(inputs).map(Number);
    let result = 0;
    if (name.includes("CPI")) result = (inputs.EV || 0) / (inputs.AC || 1);
    else if (name.includes("SPI")) result = (inputs.EV || 0) / (inputs.PV || 1);
    else if (name.includes("Cost Variance")) result = (inputs.EV || 0) - (inputs.AC || 0);
    else if (name.includes("Schedule Variance")) result = (inputs.EV || 0) - (inputs.PV || 0);
    else if (name.includes("Communication")) result = ((inputs.N || 0) * ((inputs.N || 0) - 1)) / 2;
    else result = nums.reduce((a, b) => a + b, 0);
    return apiCall(() => mockResponse({ formula: name, result: Math.round(result * 10000) / 10000, inputs }));
  },
};

export const groups = {
  create: (name: string, description?: string) => apiCall(() => mockResponse({ id: Date.now(), name, invite_code: "PMP" + Math.random().toString(36).substring(2, 8).toUpperCase() })),
  join: (code: string) => apiCall(() => mockResponse({ message: "Joined group", group_id: 1, group_name: "PMP Study Group" })),
  my: () => apiCall(() => mockResponse([{ id: 1, name: "PMP Study Group Alpha", invite_code: "PMP2026X" }])),
  members: (id: number) => apiCall(() => mockResponse([{ user_id: 1, username: "DemoUser", role: "admin" }, { user_id: 2, username: "StudyBuddy", role: "member" }])),
};

export const exam = {
  simulate: () => apiCall(() => mockResponse({ quiz_id: 999, total_questions: 180, time_limit_minutes: 230, domains: { people: { weight: 0.42, name: "People" }, process: { weight: 0.50, name: "Process" }, business_environment: { weight: 0.08, name: "Business Environment" } }, instructions: ["230 minutes for 180 questions", "Two 10-minute breaks", "Mix of predictive, agile, and hybrid", "Based on PMBOK 7th Edition"] })),
  status: (id: number) => apiCall(() => mockResponse({ quiz_id: id, total_questions: 180, score: 0, is_completed: false, time_limit_minutes: 230 })),
};

const api = { get: (url: string) => apiCall(() => mockResponse({})), post: (url: string, data?: any) => apiCall(() => mockResponse({})), put: (url: string, data?: any) => apiCall(() => mockResponse({})), delete: (url: string) => apiCall(() => mockResponse({})) };
export default api;
