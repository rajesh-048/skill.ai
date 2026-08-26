import axios from 'axios';

// In production (Vercel), API calls are proxied via vercel.json rewrites.
// In development, Vite's proxy handles /api → localhost:8000.
// For direct backend access (e.g. mobile or custom domain), set VITE_API_URL.
const API_BASE_URL = 'https://skillsphere-backend-k1kw.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly Error Logging & Normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    console.error('API Error:', message, error);
    return Promise.reject(new Error(message));
  }
);

// --- Auth APIs ---
export const loginApi = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const demoLoginApi = async (role) => {
  const res = await api.post('/auth/demo-login', { role });
  return res.data;
};

export const registerApi = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// --- Student APIs ---
export const getStudentDashboardApi = async () => {
  const res = await api.get('/student/dashboard');
  return res.data;
};

export const getStudentSkillsApi = async () => {
  const res = await api.get('/student/skills');
  return res.data;
};

export const recalculateCompetencyApi = async () => {
  const res = await api.post('/student/recalculate-competency');
  return res.data;
};

export const getLearningPathApi = async () => {
  const res = await api.get('/student/learning-path');
  return res.data;
};

export const updateMilestoneApi = async (day, status) => {
  const res = await api.put('/student/learning-path/milestone', { day, status });
  return res.data;
};

export const getRecommendationsApi = async () => {
  const res = await api.get('/student/recommendations');
  return res.data;
};

export const submitOnboardingApi = async (onboardingData) => {
  const res = await api.post('/student/onboarding', onboardingData);
  return res.data;
};

export const getAchievementsApi = async () => {
  const res = await api.get('/student/achievements');
  return res.data;
};

export const getNotificationsApi = async () => {
  const res = await api.get('/student/notifications');
  return res.data;
};

export const markNotificationReadApi = async (notifId) => {
  const res = await api.put(`/student/notifications/${notifId}/read`);
  return res.data;
};

// --- Instructor APIs ---
export const getInstructorDashboardApi = async () => {
  const res = await api.get('/instructor/dashboard');
  return res.data;
};

export const getSkillHeatmapApi = async () => {
  const res = await api.get('/instructor/heatmap');
  return res.data;
};

export const getInstructorCoursesApi = async () => {
  const res = await api.get('/instructor/courses');
  return res.data;
};

export const createCourseApi = async (courseData) => {
  const res = await api.post('/instructor/courses', courseData);
  return res.data;
};

export const getPerformanceReportApi = async () => {
  const res = await api.get('/instructor/reports');
  return res.data;
};

// --- Admin APIs ---
export const getAdminStatsApi = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAllUsersApi = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const updateUserRoleApi = async (userId, role) => {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data;
};

export const getAuditLogsApi = async () => {
  const res = await api.get('/admin/audit-logs');
  return res.data;
};

export const getSystemHealthApi = async () => {
  const res = await api.get('/admin/system-health');
  return res.data;
};

// --- Document Management APIs ---
export const uploadDocumentApi = async (formData) => {
  const res = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getDocumentsApi = async () => {
  const res = await api.get('/documents');
  return res.data;
};

export const getDocumentDetailApi = async (docId) => {
  const res = await api.get(`/documents/${docId}`);
  return res.data;
};

export const deleteDocumentApi = async (docId) => {
  const res = await api.delete(`/documents/${docId}`);
  return res.data;
};

// --- Quiz & Assessment APIs ---
export const generateQuizApi = async (payload) => {
  const res = await api.post('/quizzes/generate', payload);
  return res.data;
};

export const getQuizzesApi = async () => {
  const res = await api.get('/quizzes');
  return res.data;
};

export const getQuizDetailApi = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data;
};

export const submitQuizApi = async (quizId, submissionData) => {
  const res = await api.post(`/quizzes/${quizId}/submit`, submissionData);
  return res.data;
};

export const getQuizHistoryApi = async () => {
  const res = await api.get('/quizzes/history/attempts');
  return res.data;
};

// --- AI Mentor APIs ---
export const chatWithMentorApi = async (payload) => {
  const res = await api.post('/ai/chat', payload);
  return res.data;
};

/**
 * Stream chat via SSE. Calls `onToken(text)` for each chunk,
 * `onMeta({citations, suggested})` when metadata arrives,
 * and `onDone()` when the stream finishes.
 * Returns an abort function.
 */
export const chatWithMentorStreamApi = (payload, { onToken, onMeta, onDone, onError }) => {
  const controller = new AbortController();

  const token = localStorage.getItem('skillsphere_token');

  fetch('https://skillsphere-backend-k1kw.onrender.com/api/ai/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // keep incomplete tail
        for (const part of parts) {
          let eventType = 'message';
          let dataLines = [];
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataLines.push(line.slice(6));
            }
          }
          if (dataLines.length === 0) continue;
          const raw = dataLines.join('\n');
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          if (eventType === 'token') onToken?.(parsed);
          else if (eventType === 'citations' || eventType === 'suggested') onMeta?.({ [eventType]: parsed });
          else if (eventType === 'done') onDone?.();
        }
      }
      onDone?.();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError?.(err);
    });

  return () => controller.abort();
};

export const getAIInsightsApi = async () => {
  const res = await api.get('/ai/insights');
  return res.data;
};

// --- Course Catalog APIs ---
export const getCoursesApi = async (params = {}) => {
  const res = await api.get('/courses', { params });
  return res.data;
};

export const getCourseDetailApi = async (idOrSlug) => {
  const res = await api.get(`/courses/${idOrSlug}`);
  return res.data;
};

export const enrollCourseApi = async (courseId) => {
  const res = await api.post(`/courses/${courseId}/enroll`);
  return res.data;
};

export const updateCourseProgressApi = async (courseId, progressPercentage) => {
  const res = await api.put(`/courses/${courseId}/progress`, {
    progress_percentage: progressPercentage,
  });
  return res.data;
};

// --- iGOT Karmayogi APIs ---
export const getIGOTStatusApi = async () => {
  const res = await api.get('/igot/status');
  return res.data;
};

export const getIGOTCompetenciesApi = async () => {
  const res = await api.get('/igot/competencies');
  return res.data;
};

export const getIGOTCoursesApi = async () => {
  const res = await api.get('/igot/courses');
  return res.data;
};

export const triggerIGOTSyncApi = async (payload = { sync_direction: 'bidirectional' }) => {
  const res = await api.post('/igot/sync', payload);
  return res.data;
};

export const getIGOTHistoryApi = async () => {
  const res = await api.get('/igot/history');
  return res.data;
};

// --- Global Search API ---
export const globalSearchApi = async (query) => {
  const res = await api.get('/search', { params: { q: query } });
  return res.data;
};

export default api;
