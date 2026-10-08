import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data?: T;
  error?: string;
  loading: boolean;
  refreshing: boolean;
}

/** Ejecuta una carga asíncrona y expone `refresh` para el pull-to-refresh. */
export function useAsync<T>(load: (force: boolean) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true, refreshing: false });
  const alive = useRef(true);

  const run = useCallback(
    async (force: boolean) => {
      setState((s) => ({ ...s, loading: !s.data, refreshing: force, error: undefined }));
      try {
        const data = await load(force);
        if (alive.current) setState({ data, loading: false, refreshing: false });
      } catch (e) {
        if (alive.current) {
          setState((s) => ({ ...s, loading: false, refreshing: false, error: e instanceof Error ? e.message : String(e) }));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    alive.current = true;
    run(false);
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { ...state, refresh: () => run(true) };
}
