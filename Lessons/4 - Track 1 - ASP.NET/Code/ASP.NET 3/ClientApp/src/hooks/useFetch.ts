import { useState, useEffect } from "react";

export function useFetch<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await load();
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Could not load data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      ignore = true;
    };
    // The linter cannot check dependencies handed in as a parameter,
    // the same story as the transform in the previous version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
