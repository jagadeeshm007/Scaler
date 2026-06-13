'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

export function usePagination(defaultPage = 1) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(defaultPage));

  return {
    page,
    setPage,
    resetPage: () => setPage(defaultPage),
  };
}
