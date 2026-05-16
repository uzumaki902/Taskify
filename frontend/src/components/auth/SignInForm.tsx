"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth.actions";
import Link from "next/link";

export default function SignInForm() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signIn(formData);

        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="mt-2 text-sm text-gray-600">Sign in to manage your tasks</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                    <input
                        type="text"
                        name="identifier"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="johndoe@example.com"
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        disabled={isPending}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isPending ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    );
}