import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/services';

export const useEvents = (params) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api.getEvents(params),
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.getEventById(id),
    enabled: !!id,
  });
};

export const useStocks = () => {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: api.getStocks,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (seldom changes)
  });
};

export const useBatches = (params) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => api.getBatches(params),
  });
};

export const useSubtypes = (eventType) => {
  return useQuery({
    queryKey: ['subtypes', eventType],
    queryFn: () => api.getSubtypes(eventType),
    enabled: !!eventType,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useCreateBatchWithEvents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ batch_name, notes, events }) => {
      // Step 1: Create Batch
      const batchRes = await api.createBatch({ batch_name, notes });
      const batchId = batchRes.id || batchRes.batch_id; // accommodate structural variations if exist
      
      // Step 2: Create all events inside batch
      await Promise.all(
        events.map((ev) => api.createEvent({ ...ev, batch_id: batchId }))
      );
      
      // Step 3: Complete batch
      await api.completeBatch(batchId);
      return batchId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
