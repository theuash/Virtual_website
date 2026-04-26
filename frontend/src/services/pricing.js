import api from './api';

export const getPricingSummary = () => api.get('/pricing/summary');
export const getAllPricing     = () => api.get('/pricing');
export const getDepartmentPricing = (dept) => api.get(`/pricing/${dept}`);
