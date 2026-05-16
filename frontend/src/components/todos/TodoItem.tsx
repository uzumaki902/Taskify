// src/components/todos/TodoItem.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleTodo, deleteTodo } from "@/lib/actions/todo.actions";
import type { Todo } from "@/lib/types";

export default function TodoItem({ todo }: { todo: Todo }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTodo(todo.documentId, todo.isCompleted);
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteTodo(todo.documentId);
        // We don't need to set isDeleting to false because the component will unmount
    };

    return (
        <div className={`flex items-center justify-between p-4 mb-2 bg-white border rounded-lg shadow-sm transition-all ${isDeleting ? "opacity-50 scale-95" : "opacity-100"}`}>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={handleToggle}
                    disabled={isPending || isDeleting}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className={`text-lg ${todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                    {todo.title}
                </span>
            </div>

            <button
                onClick={handleDelete}
                disabled={isPending || isDeleting}
                className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
            >
                {isDeleting ? "..." : "Delete"}
            </button>
        </div>
    );
}