import { createClient } from '@supabase/supabase-js';
import type { AuthResponse } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const hasSupabaseClient = () => !!supabase;

export async function signInWithSupabase(email: string, password: string): Promise<AuthResponse> {
  if (!supabase) {
    throw new Error('Supabase authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithSupabase(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  if (!supabase) {
    throw new Error('Supabase authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });
}

export async function signInWithGoogleSupabase() {
  if (!supabase) {
    throw new Error('Supabase authentication is not configured.');
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  });
}
