"use client";

import { useState, useTransition } from "react";
import { createAiTodo } from "@/lib/actions/todo.actions";

export default function AiAssistant() {
  const [aiInput, setAiInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAiSubmit = () => {
    if (!aiInput.trim()) return;

    startTransition(async () => {
      const result = await createAiTodo(aiInput);
      if (!result?.error) {
        setAiInput("");
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="w-full md:w-72 bg-white border rounded-lg p-5 flex flex-col gap-3 shadow-sm h-fit">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 className="font-bold text-lg text-gray-900">AI Assistant</h2>
      </div>
      <p className="text-xs text-gray-500">
        Tell me what you need to do, and I'll create a task for it.
      </p>
      <textarea
        className="border border-gray-300 rounded p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
        rows={4}
        placeholder="e.g. I need to apply for the VIT internship by tonight"
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        disabled={isPending}
      />
      <button
        onClick={handleAiSubmit}
        disabled={isPending || !aiInput.trim()}
        className="bg-black hover:bg-gray-800 text-white font-medium rounded-lg p-2 text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Thinking...
          </>
        ) : (
          "Add via AI"
        )}
      </button>
    </div>
  );
}
