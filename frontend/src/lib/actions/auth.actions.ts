'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { StrapiUser, ActionResult } from '@/lib/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function signUp(formData: FormData): Promise<ActionResult> {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!username?.trim()) return { error: 'Username is required.' };
  if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' };
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' };

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error?.message || 'Registration failed. Please try again.' };
    }

    const { jwt, user }: { jwt: string; user: StrapiUser } = await res.json();
    await setAuthCookies(jwt, user);

  } catch {
    return { error: 'Could not connect to the server. Please try again.' };
  }

  redirect('/dashboard');
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  if (!identifier?.trim()) return { error: 'Email or username is required.' };
  if (!password) return { error: 'Password is required.' };

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      return { error: 'Invalid credentials. Please check your email and password.' };
    }

    const { jwt, user }: { jwt: string; user: StrapiUser } = await res.json();
    await setAuthCookies(jwt, user);

  } catch {
    return { error: 'Could not connect to the server. Please try again.' };
  }

  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('jwt');
  cookieStore.delete('user');
  redirect('/signin');
}

async function setAuthCookies(jwt: string, user: StrapiUser): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  const baseOptions = {
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };

  cookieStore.set('jwt', jwt, {
    ...baseOptions,
    httpOnly: true,
  });

  cookieStore.set('user', JSON.stringify({ id: user.id, username: user.username }), {
    ...baseOptions,
    httpOnly: false,
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
