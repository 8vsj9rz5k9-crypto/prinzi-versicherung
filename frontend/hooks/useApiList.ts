import { useEffect, useRef, useState } from "react";

export function useApiList<T>(loader: () => Promise<T[]>) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loaderRef.current()
      .then((items) => {
        if (active) {
          setData(items);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
