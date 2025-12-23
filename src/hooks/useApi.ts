import { useState, useEffect, useCallback } from 'react';
import { apiServices } from '../services/apiServices';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  fetchFunction: () => Promise<any>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, enabled = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFunction();
      
      if (response.data.success) {
        const result = response.data.data ?? response.data;
        setData(result as T);
        onSuccess?.(result as T);
      } else {
        throw new Error(response.data.error || 'Request failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Network error';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, enabled, onSuccess, onError]);

  const refetch = () => {
    setRefetchCount(prev => prev + 1);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData, refetchCount]);

  return { data, loading, error, refetch };
}

// Hook khusus untuk surat
export function useSurat(filters?: any) {
  return useApi(
    () => apiServices.surat.getAll(filters),
    { enabled: !!filters || true }
  );
}

// Hook untuk dashboard stats
export function useDashboardStats() {
  return useApi(() => apiServices.surat.getStats());
}

// Hook untuk perusahaan
export function usePerusahaan(activeOnly?: boolean) {
  return useApi(
    () => apiServices.perusahaan.getAll(activeOnly),
    { enabled: true }
  );
}

// Hook untuk kategori
export function useKategori() {
  return useApi(() => apiServices.kategori.getAll());
}

// Hook untuk users
export function useUsers() {
  return useApi(() => apiServices.users.getAll());
}

// Hook untuk settings
export function useSettings() {
  return useApi(() => apiServices.settings.getSettings());
}