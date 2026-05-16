// =============================================================================
// Shared TypeScript types for Taskify
// Import from here — never define inline types in components or actions.
// =============================================================================

// --------------------------------------------------------------------------
// Auth
// --------------------------------------------------------------------------

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

/** Stored in the readable 'user' cookie (non-sensitive display data only) */
export interface PublicUser {
  id: number;
  username: string;
}

// --------------------------------------------------------------------------
// Todos
// --------------------------------------------------------------------------

export interface Todo {
  id: number;
  documentId: string; // Strapi v5 uses documentId for mutations (PUT/DELETE)
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Strapi API Response Shapes
// --------------------------------------------------------------------------

/** Strapi v5 returns { data: T[], meta: {...} } for collection endpoints */
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

/** Strapi v5 returns { data: T } for single-item endpoints */
export interface StrapiSingleResponse<T> {
  data: T;
}

// --------------------------------------------------------------------------
// Server Action Return Type
// --------------------------------------------------------------------------

/**
 * Standard return type for all Server Actions.
 * On success: { success: true }
 * On failure: { error: 'message' }
 * Actions that redirect don't need to return anything (void).
 */
export interface ActionResult {
  error?: string;
  success?: boolean;
}
