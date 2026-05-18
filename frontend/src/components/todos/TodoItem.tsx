"use client";

import { useState, useTransition } from "react";
import { toggleTodo, deleteTodo, editTodo } from "@/lib/actions/todo.actions";
import type { Todo } from "@/lib/types";

export default function TodoItem({ todo }: { todo: Todo }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTodo(todo.documentId, todo.isCompleted);
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteTodo(todo.documentId);
        
        if (!result?.error) {
             setIsDeleted(true); // Instantly remove from screen
        } else {
             setIsDeleting(false); // Only revert if there was an error
        }
    };

    const handleEditSave = () => {
        if (!editTitle.trim() || editTitle === todo.title) {
            setIsEditing(false);
            return;
        }
        
        startTransition(async () => {
            await editTodo(todo.documentId, editTitle);
            setIsEditing(false);
        });
    };

    if (isDeleted) return null;

    return (
        <div className={`flex items-center justify-between p-4 mb-2 bg-white border rounded-lg shadow-sm transition-all ${isDeleting ? "opacity-50 scale-95" : "opacity-100"}`}>
            <div className="flex items-center gap-3 flex-1">
                <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={handleToggle}
                    disabled={isPending || isDeleting || isEditing}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                
                {isEditing ? (
                    <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") setIsEditing(false);
                        }}
                        disabled={isPending}
                        autoFocus
                        className="flex-1 px-2 py-1 border border-blue-500 rounded text-gray-900 bg-white focus:outline-none"
                    />
                ) : (
                    <span className={`text-lg ${todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {todo.title}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 ml-4">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleEditSave}
                            disabled={isPending || isDeleting}
                            className="px-3 py-1 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "..." : "Save"}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={isPending || isDeleting}
                            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={isPending || isDeleting || todo.isCompleted}
                            className="px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded disabled:opacity-50 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending || isDeleting}
                            className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
                        >
                            {isDeleting ? "..." : "Delete"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}