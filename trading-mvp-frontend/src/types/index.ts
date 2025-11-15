export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  hasJoined?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface CompetitionFilters {
  search?: string;
  freeOnly?: boolean;
  page?: number;
  size?: number;
}
