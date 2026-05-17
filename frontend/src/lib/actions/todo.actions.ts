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

    if (!res.ok) return { error: "Failed to create task. Please try again." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Could not connect to the server." };
  }
}

export async function toggleTodo(
  documentId: string,
  currentStatus: boolean
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

    if (!res.ok) return { error: "Failed to update task. Please try again." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
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

    if (!res.ok) return { error: "Failed to delete task. Please try again." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Could not connect to the server." };
  }
}
