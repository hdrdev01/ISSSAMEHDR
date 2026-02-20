import { useState, useEffect, useCallback } from 'react';
import { fetchHadiths as fetchHadithsApi } from '@/services/hadithApi';
import type { Hadith } from '@/types';

interface UseHadithsResult {
  hadiths: Hadith[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHadiths(editionName: string | null): UseHadithsResult {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!editionName) {
      setHadiths([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchHadithsApi(editionName);
      setHadiths(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hadiths');
    } finally {
      setLoading(false);
    }
  }, [editionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { hadiths, loading, error, refetch: fetchData };
}
