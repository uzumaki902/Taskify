"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// --- Helper to get the token server-side ---
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("jwt")?.value;
}

// --------------------------------------------------------------------------
// CREATE
// --------------------------------------------------------------------------
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
      // We do NOT send the user ID — our custom Strapi controller
      // reads ctx.state.user from the JWT and assigns ownership securely.
      body: JSON.stringify({ data: { title } }),
    });

    // Early return on failure — no need to throw + catch (redundant pattern)
    if (!res.ok) return { error: "Failed to create task. Please try again." };

    // Tell Next.js to revalidate the dashboard page cache instantly
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Could not connect to the server." };
  }
}

// --------------------------------------------------------------------------
// TOGGLE (Update Status: Pending ↔ Completed)
// --------------------------------------------------------------------------
export async function toggleTodo(
  documentId: string,
  currentStatus: boolean
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };

  try {
    // Strapi v5 requires documentId (string UUID) for updates, NOT numeric id
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

// --------------------------------------------------------------------------
// DELETE
// --------------------------------------------------------------------------
export async function deleteTodo(documentId: string): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { error: "Unauthorized." };

  try {
    // Strapi v5 requires documentId for deletions
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
