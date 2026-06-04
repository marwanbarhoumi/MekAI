import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const diagnose = async ({ problem, lang, images = [] }) => {
  const formData = new FormData();
  formData.append('problem', problem);
  formData.append('lang', lang);
  images.forEach(img => formData.append('images', img));
  const { data } = await api.post('/api/diagnose', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const sendFollowUp = async ({ id, question, lang }) => {
  const { data } = await api.post(`/api/diagnose/${id}/followup`, { question, lang });
  return data;
};

export const getHistory = async (userId = 'anonymous') => {
  const { data } = await api.get(`/api/history/${userId}`);
  return data;
};

export const rateD = async ({ id, rating }) => {
  const { data } = await api.post(`/api/diagnose/${id}/rate`, { rating });
  return data;
};