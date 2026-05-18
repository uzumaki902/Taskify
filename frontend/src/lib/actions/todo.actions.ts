"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("jwt")?.value;
}

export async function createTodo(formData: FormData): Promise<ActionResult> {
  const token = await getAuthToken();
  const title = formData.get("title") as string;

  if (!token) return { error: "Unauthorized." };
  if (!title?.trim()) return { error: "Title is required." };

  try {
    const res = await fetch(`${STRAPI_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { title } }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("=== STRAPI CREATE ERROR ===");
      console.error("Status:", res.status);
      console.error("Payload:", JSON.stringify(errorData, null, 2));
      console.error("==========================");
      return { error: `Server error (${res.status}). Check terminal.` };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Network Fetch Error:", err);
    return { error: "Could not connect to the server." };
  }
}

export async function toggleTodo(
  documentId: string,
  currentStatus: boolean,
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };

  try {
    const res = await fetch(`${STRAPI_URL}/api/todos/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { isCompleted: !currentStatus } }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("=== STRAPI UPDATE ERROR ===");
      console.error("Status:", res.status);
      console.error("Payload:", JSON.stringify(errorData, null, 2));
      console.error("===========================");
      return { error: `Server error (${res.status}). Check terminal.` };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Network Fetch Error:", err);
    return { error: "Could not connect to the server." };
  }
}

export async function deleteTodo(documentId: string): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };

  try {
    const res = await fetch(`${STRAPI_URL}/api/todos/${documentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("=== STRAPI DELETE ERROR ===");
      console.error("Status:", res.status);
      console.error("Payload:", JSON.stringify(errorData, null, 2));
      console.error("===========================");
      return { error: `Server error (${res.status}). Check terminal.` };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Network Fetch Error:", err);
    return { error: "Could not connect to the server." };
  }
}

export async function editTodo(
  documentId: string,
  newTitle: string,
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };
  if (!newTitle?.trim()) return { error: "Title is required." };

  try {
    const res = await fetch(`${STRAPI_URL}/api/todos/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { title: newTitle } }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("=== STRAPI EDIT ERROR ===");
      console.error("Status:", res.status);
      console.error("Payload:", JSON.stringify(errorData, null, 2));
      console.error("===========================");
      return { error: `Server error (${res.status}). Check terminal.` };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Network Fetch Error:", err);
    return { error: "Could not connect to the server." };
  }
}

export async function createAiTodo(message: string): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };
  if (!message?.trim()) return { error: "Message is required." };

  try {
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{
          role: "user",
          content: `Extract a short, clean todo task title from this message. Return ONLY the todo title, nothing else, no quotes, no conversational filler. Message: "${message}"`
        }]
      })
    });

    if (!aiResponse.ok) {
        console.error("AI Fetch Failed:", await aiResponse.text());
        return { error: "Failed to connect to Groq AI." };
    }

    const aiData = await aiResponse.json();
    const title = aiData.choices?.[0]?.message?.content?.trim() || "AI Task";

    const res = await fetch(`${STRAPI_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { title } }),
    });

    if (!res.ok) {
      return { error: `Server error (${res.status}). Check terminal.` };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("AI Creation Error:", err);
    return { error: "Could not connect to the AI server." };
  }
}
