import axios from 'axios';

// In production (Render), frontend and backend are on the same domain.
// VITE_API_URL is set in Render's environment variables for the static site.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE_URL,
});

export const fetchDayStatus    = (day)                   => API.get(`/days/${day}`);
export const fetchQuestions    = (day, topic, difficulty) => {
  const params = {};
  if (day)        params.day        = day;
  if (topic)      params.topic      = topic;
  if (difficulty) params.difficulty = difficulty;
  return API.get('/questions', { params });
};
export const fetchStats           = ()             => API.get('/questions/stats');
export const updateQuestionStatus = (id, status)  => API.put(`/questions/${id}`, { status });
export const updateDayStatus      = (day, status) => API.post('/days/status', { day, status });
