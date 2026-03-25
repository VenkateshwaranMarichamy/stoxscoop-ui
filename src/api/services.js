import axios from 'axios';
import apiClient from './client';

export const getEvents = async (params) => {
  const { data } = await apiClient.get('/v1/events', { params });
  return data;
};

export const getEventById = async (id) => {
  const { data } = await apiClient.get(`/v1/events/${id}`);
  return data;
};

export const getStocks = async () => {
  // Use raw axios because URL doesn't include /api like apiClient does
  const { data } = await axios.get('/stocks/all');
  return data;
};

export const getBatches = async (params) => {
  const { data } = await apiClient.get('/v1/batches', { params });
  return data;
};

export const createBatch = async (payload) => {
  const { data } = await apiClient.post('/v1/batches', payload);
  return data;
}

export const completeBatch = async (id) => {
  const { data } = await apiClient.patch(`/v1/batches/${id}/complete`);
  return data;
}

export const createEvent = async (payload) => {
  const { data } = await apiClient.post('/v1/events', payload);
  return data;
};

export const getSubtypes = async (eventType) => {
  const { data } = await apiClient.get(`/v1/subtypes`, { params: { event_type: eventType } });
  return data;
};
