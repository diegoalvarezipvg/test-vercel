export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function buildPagination<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore
    }
  };
} 