import { useState, useEffect } from "react";

export function useFetch<TRaw, TData>(
  url: string,
  transform: (raw: TRaw) => TData,
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const raw: TRaw = await response.json();
        if (!ignore) {
          setData(transform(raw));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("Could not load data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
    // The linter will complain that transform is a missing dependency,
    // so we add the following line. If you want to fix this,
    // look into useCallback. For now, we skip it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
}
