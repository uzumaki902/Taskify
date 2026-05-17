export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface PublicUser {
  id: number;
  username: string;
}

export interface Todo {
  id: number;
  documentId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}
