'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Read and update browse filters stored in the URL. */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = useCallback((key: string) => searchParams.get(key) ?? '', [searchParams]);

  const update = useCallback(
    (changes: Record<string, string | null | undefined>, opts: { pathname?: string } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      // Any filter change goes back to page 1.
      if (!('page' in changes)) next.delete('page');
      const qs = next.toString();
      startTransition(() => {
        router.push(`${opts.pathname ?? pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const clear = useCallback(
    (keep: string[] = []) => {
      const next = new URLSearchParams();
      for (const key of keep) {
        const v = searchParams.get(key);
        if (v) next.set(key, v);
      }
      const qs = next.toString();
      startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false }));
    },
    [router, pathname, searchParams]
  );

  return { get, update, clear, isPending, searchParams };
}
