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
  const { data } = await apiClient.get('/stocks/active');
  // returns { total, data: [...] } — extract the array
  return data?.data ?? data;
};

export const getBatches = async (params) => {
  const { data } = await apiClient.get('/v1/batches', { params });
  return data;
};

export const createBatch = async (payload) => {
  const { data } = await apiClient.post('/v1/batches', payload);
  return data;
}

export const createBatchWithEvents = async (payload) => {
  const { data } = await apiClient.post('/v1/batches/with-events', payload);
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

export const getMarketUpdates = async (params) => {
  const { data } = await apiClient.get('/v1/market-updates', { params });
  return data;
};

export const createMarketUpdate = async (payload) => {
  const { data } = await apiClient.post('/v1/market-updates', payload);
  return data;
};

export const getMacroSectors = async () => {
  const { data } = await apiClient.get('/classification/macro-economic-sectors');
  return data;
};

export const getSectors = async (mes_code = null) => {
  const params = mes_code ? { mes_code } : {};
  const { data } = await apiClient.get('/classification/sectors', { params });
  return data;
};

export const getIndustries = async (sector_code = null) => {
  const params = sector_code ? { sect_code: sector_code } : {};
  const { data } = await apiClient.get('/classification/industries', { params });
  return data;
};

export const getBasicIndustries = async (ind_code = null) => {
  const params = { skip: 0, limit: 200, ...(ind_code ? { ind_code } : {}) };
  const { data } = await apiClient.get('/classification/basic-industries', { params });
  return data;
};
