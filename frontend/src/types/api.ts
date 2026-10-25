/**
 * API Response contract matching backend com.wallet.common.response.ApiResponse<T>
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errorCode?: string | null;
  data: T;
  timestamp?: string;
}

/**
 * Spring Data Page contract matching Page<T>
 */
export interface Page<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort?: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements?: number;
  empty: boolean;
}

export interface ApiError {
  message: string;
  errorCode?: string;
  status?: number;
  correlationId?: string;
  details?: Record<string, string>;
}
