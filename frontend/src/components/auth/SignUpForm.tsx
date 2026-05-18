"use client";

import { useState } from "react";
import { signUp } from "@/lib/actions/auth.actions";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signUp(formData);

        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                <p className="mt-2 text-sm text-gray-600">Join Taskify to start organizing</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-black mb-1">Username</label>
                    <input
                        type="text"
                        name="username"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Type your username"
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="ram@example.com"
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Minimum 6 characters"
                            disabled={isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isPending}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>

                    </div>



                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="relative w-full px-4 py-2 font-medium text-white bg-gray-950 rounded-md shadow-2xl overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/50 disabled:bg-blue-400 before:absolute before:right-0 before:top-0 before:h-full before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-[500px]"
                >
                    {isPending ? "Creating account..." : "Sign Up"}

                </button>
            </form>

            <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}