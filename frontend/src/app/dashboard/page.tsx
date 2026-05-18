import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddTodoForm from "@/components/todos/AddTodoForm";
import TodoItem from "@/components/todos/TodoItem";
import AiAssistant from "@/components/todos/AiAssistant";
import { signOut } from "@/lib/actions/auth.actions";
import type { Todo, StrapiListResponse } from "@/lib/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function fetchUserTodos(token: string): Promise<Todo[]> {
    const res = await fetch(`${STRAPI_URL}/api/todos?sort=createdAt:desc`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("STRAPI FETCH ERROR:", res.status, errText);
        return [];
    }

    const json = await res.json();
    console.log("STRAPI SUCCESS DATA:", JSON.stringify(json, null, 2));


    return json?.data || json || [];
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) redirect("/signin");

    const userCookie = cookieStore.get("user")?.value;
    const user = (() => {
        try { return userCookie ? JSON.parse(userCookie) : null; } catch { return null; }
    })() ?? { username: "User" };

    const todos = await fetchUserTodos(token!);

    return (
        <main className="min-h-screen py-12 bg-gray-50">
            <div className="max-w-5xl px-4 mx-auto flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-zinc-950">Hello, {user.username}</p>
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
                            <div className="p-8 text-center bg-white border border-dashed rounded-lg shadow-sm">
                                <p className="text-gray-500">You have no tasks yet. Add one above or ask the AI!</p>
                            </div>
                        ) : (
                            todos.map((todo) => <TodoItem key={todo.documentId} todo={todo} />)
                        )}
                    </div>
                </div>

                <div className="w-full md:w-80 flex-shrink-0">
                    <div className="sticky top-12">
                        <AiAssistant />
                    </div>
                </div>
            </div>
        </main>
    );
}
