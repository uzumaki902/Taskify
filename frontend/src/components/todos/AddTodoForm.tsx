// src/components/todos/AddTodoForm.tsx
"use client";

import { useState } from "react";
import { createTodo } from "@/lib/actions/todo.actions";

export default function AddTodoForm() {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const form = event.currentTarget;
        const formData = new FormData(form);

        const result = await createTodo(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            form.reset(); // Clear the input on success
        }

        setIsPending(false);
    }

    return (
        <div className="mb-8">
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="What needs to be done?"
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isPending}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isPending ? "Adding..." : "Add Task"}
                </button>
            </form>
        </div>
    );
}