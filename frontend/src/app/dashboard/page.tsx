// src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddTodoForm from "@/components/todos/AddTodoForm";
import TodoItem from "@/components/todos/TodoItem";
import { signOut } from "@/lib/actions/auth.actions";
import type { Todo, StrapiListResponse } from "@/lib/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// Server-side data fetcher
async function fetchUserTodos(token: string): Promise<Todo[]> {
    const res = await fetch(`${STRAPI_URL}/api/todos?sort=createdAt:desc`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Always fetch fresh data
    });

    if (!res.ok) return [];
    const json: StrapiListResponse<Todo> = await res.json();
    return json.data;
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    // The middleware already protects this route, but this is a double-check
    if (!token) redirect("/signin");

    // Read the public user cookie we set during login for the greeting
    const userCookie = cookieStore.get("user")?.value;
    // Wrap in try-catch — a malformed cookie would crash the entire page otherwise
    const user = (() => {
        try { return userCookie ? JSON.parse(userCookie) : null; } catch { return null; }
    })() ?? { username: "User" };

    // token! — redirect() above guarantees it's defined here, but TS can't infer that
    const todos = await fetchUserTodos(token!);

    return (
        <main className="min-h-screen py-12 bg-gray-50">
            <div className="max-w-3xl px-4 mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">TaskForge Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {user.username}</p>
                    </div>

                    <form action={signOut}>
                        <button type="submit" className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Sign Out
                        </button>
                    </form>
                </header>

                <AddTodoForm />

                <div className="mt-8 space-y-2">
                    {todos.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-dashed rounded-lg">
                            <p className="text-gray-500">You have no tasks yet. Add one above!</p>
                        </div>
                    ) : (
                        todos.map((todo) => <TodoItem key={todo.documentId} todo={todo} />)
                    )}
                </div>
            </div>
        </main>
    );
}