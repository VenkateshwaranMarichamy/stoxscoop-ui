import apiClient from './client';

export const getEvents = async (params) => {
  const { data } = await apiClient.get('/events', { params });
  return data;
};

export const getEventById = async (id) => {
  const { data } = await apiClient.get(`/events/${id}`);
  return data;
};

export const getStocks = async () => {
  const { data } = await apiClient.get('/stocks/all');
  return data;
};

export const getBatches = async (params) => {
  const { data } = await apiClient.get('/batches', { params });
  return data;
};

export const createBatchWithEvents = async (payload) => {
  const { data } = await apiClient.post('/batches/with-events', payload);
  return data;
};

export const createEvent = async (payload) => {
  const { data } = await apiClient.post('/events', payload);
  return data;
};
