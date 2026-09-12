import { createClient } from '@supabase/supabase-js';
import type { AuthResponse } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }) 
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

export async function signInWithGoogleSupabase(redirectPath: string = '/dashboard') {
  if (!supabase) {
    throw new Error('Supabase authentication is not configured.');
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inIframe = typeof window !== 'undefined' && window !== window.top;

  // In an iframe (like AI Studio preview), Google OAuth MUST be opened in a popup window
  // because Google's servers reject iframe embedding (X-Frame-Options: DENY).
  if (inIframe) {
    const callbackUrl = `${origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    if (data?.url) {
      const popup = window.open(
        data.url,
        'google_oauth_auth_window',
        'width=540,height=680,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes'
      );
      if (!popup) {
        // If popup blocker intervened, attempt top level navigation
        try {
          if (window.top) {
            window.top.location.href = data.url;
            return { data, error: null };
          }
        } catch {
          // Fallback to current window navigation
        }
        window.location.href = data.url;
      }
    }
    return { data, error: null };
  }

  // Direct top-level navigation
  const cleanPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
  const redirectTo = `${origin}${cleanPath}`;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}
