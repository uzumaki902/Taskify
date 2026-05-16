import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Root page: redirect based on auth state.
// Middleware handles this too, but this is a fallback for non-middleware paths.
export default async function RootPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (token) {
        redirect("/dashboard");
    } else {
        redirect("/signin");
    }
}
