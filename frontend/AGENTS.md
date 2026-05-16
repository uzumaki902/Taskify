# Taskify Frontend — AI Agent Instructions

You are an expert Full-Stack Next.js Developer. Follow every rule below without deviation.
When in doubt, prefer security and server-side execution over convenience.

---

## 1. Core Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js App Router | 14+ |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | No custom CSS unless animation requires it |
| Backend | Strapi CMS REST API | v5, running at `http://localhost:1337` |

---

## 2. Project Structure (Canonical — Do Not Deviate)

```
app/
├── layout.tsx              ← Root layout. Wraps with AuthProvider if needed.
├── page.tsx                ← Root route: redirects to /dashboard or /signin.
├── middleware.ts           ← Route protection. Runs at the edge.
├── signin/
│   └── page.tsx
├── signup/
│   └── page.tsx
└── dashboard/
    ├── page.tsx            ← Server Component. Fetches todos server-side.
    ├── loading.tsx         ← Suspense fallback UI.
    └── error.tsx           ← Error boundary UI.

components/
├── auth/
│   ├── SignInForm.tsx       ← "use client". Calls Server Action.
│   └── SignUpForm.tsx       ← "use client". Calls Server Action.
└── todos/
    ├── TodoList.tsx        ← Server Component wrapper.
    ├── TodoItem.tsx        ← "use client" only if it has onClick/toggle.
    └── AddTodoForm.tsx     ← "use client". Calls Server Action.

lib/
├── actions/
│   ├── auth.actions.ts     ← Server Actions: signIn, signUp, signOut.
│   └── todo.actions.ts     ← Server Actions: createTodo, updateTodo, deleteTodo.
├── api/
│   └── strapi.ts           ← Raw fetch wrapper. Server-side only. Never import in client components.
└── types.ts                ← All shared TypeScript interfaces.
```

---

## 3. Rendering Rules

- **Default to Server Components.** Every `page.tsx`, `layout.tsx`, and most `components/` files are Server Components unless stated otherwise.
- **Use `"use client"` only when the component uses:** `useState`, `useEffect`, `onClick`, `onChange`, browser APIs (`window`, `document`), or third-party client-only libs.
- **Keep Client Components as leaves.** A Server Component can import and render a Client Component, never the reverse for data-fetching logic.
- **Never fetch data inside a Client Component with `useEffect`.** Use `page.tsx` (server) or a Server Action instead.

---

## 4. Data Fetching (Server-Side Only)

All data fetching happens in `page.tsx` or server components via the `lib/api/strapi.ts` helper.

```typescript
// lib/api/strapi.ts
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';

export async function strapiGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;

  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store', // Always fresh — todos must not be stale.
  });

  if (!res.ok) throw new Error(`Strapi GET ${path} failed: ${res.status}`);
  return res.json();
}
```

> **Rule:** `strapiGet` / `strapiPost` etc. are server-only utilities. Never import them into a `"use client"` file.

---

## 5. Mutations — Server Actions (Strict Pattern)

All mutations (create, update, delete, login, logout) MUST be **Server Actions** in `lib/actions/`.

```typescript
// lib/actions/todo.actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createTodo(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  const title = formData.get('title') as string;

  if (!title?.trim()) return { error: 'Title is required.' };

  const res = await fetch(`${process.env.STRAPI_URL}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { title } }),
    // NOTE: Do NOT send user ID from the client. The Strapi controller
    // reads ctx.state.user from the JWT — the backend assigns ownership.
  });

  if (!res.ok) return { error: 'Failed to create todo.' };

  revalidatePath('/dashboard'); // Revalidate the server-rendered todo list.
}
```

**Rules for all Server Actions:**
- File must start with `'use server'`.
- Read the JWT from `cookies()` (server-only) — never from props or client state.
- Always call `revalidatePath('/dashboard')` after a mutation so the page re-renders fresh data.
- Return `{ error: string }` on failure — never throw unhandled exceptions.
- Never trust data from the client for ownership (user ID). The backend controller handles that.

---

## 6. Authentication — JWT in HTTP-Only Cookies

**Storage rule:** JWT is stored **exclusively** in an HTTP-Only cookie. Never localStorage, never sessionStorage.

```typescript
// lib/actions/auth.actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  const res = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) return { error: 'Invalid credentials.' };

  const { jwt, user } = await res.json();

  const cookieStore = await cookies();
  cookieStore.set('jwt', jwt, {
    httpOnly: true,   // ← Not accessible via JS (XSS protection)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Store non-sensitive user info (id, username) in a separate readable cookie
  // for client-side display only (NOT for auth decisions).
  cookieStore.set('user', JSON.stringify({ id: user.id, username: user.username }), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('jwt');
  cookieStore.delete('user');
  redirect('/signin');
}
```

---

## 7. Route Protection — Middleware

```typescript
// middleware.ts (root of project, NOT inside /app)
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // Not logged in trying to access protected route → redirect to signin
  if (isProtected && !jwt) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Already logged in trying to access signin/signup → redirect to dashboard
  if (isAuthRoute && jwt) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
};
```

---

## 8. TypeScript Types

Define all shared types in `lib/types.ts`. Never use `any`.

```typescript
// lib/types.ts

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
}

export interface Todo {
  id: number;
  documentId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; total: number } };
}

export interface StrapiSingleResponse<T> {
  data: T;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}
```

---

## 9. Environment Variables

```env
# .env.local (frontend)
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_APP_NAME=Taskify
```

- `STRAPI_URL` — server-only (no `NEXT_PUBLIC_` prefix). Safe.
- Never put JWT secrets or Strapi API tokens in `NEXT_PUBLIC_` variables.

---

## 10. Error Handling Checklist

Every Server Action must:
- [ ] Validate inputs before hitting the API
- [ ] Handle non-ok HTTP responses with a user-friendly `{ error }` return
- [ ] Never expose raw error messages or stack traces to the client
- [ ] Call `revalidatePath()` only on success

Every `page.tsx` must:
- [ ] Have a sibling `loading.tsx` with a skeleton/spinner UI
- [ ] Have a sibling `error.tsx` with a `"use client"` error boundary

---

## 11. What NOT To Do (Anti-Patterns)

| ❌ Never | ✅ Instead |
|---|---|
| `localStorage.setItem('jwt', token)` | `cookies().set('jwt', ..., { httpOnly: true })` |
| `useEffect(() => fetch('/api/todos'))` | Fetch in `page.tsx` server component |
| `body: JSON.stringify({ data: { user: userId } })` | Let the Strapi controller assign user from JWT |
| Import `lib/api/strapi.ts` in a `"use client"` file | Only use in server components / actions |
| `catch (e) { return e.message }` | `catch { return { error: 'Something went wrong.' } }` |
| Use `any` type | Define an explicit interface in `lib/types.ts` |
