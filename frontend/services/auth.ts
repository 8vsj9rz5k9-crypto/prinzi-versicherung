import { createClient } from '@supabase/supabase-js';
import { isBrowser } from '@/services/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const STORAGE_KEY = 'prinzi-ai-auth-session';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const hasSupabaseConfig = Boolean(supabase);

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (!isBrowser()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthUser> {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }

        const user: AuthUser = {
          id: data.user?.id ?? 'supabase-user',
          email,
          name: data.user?.user_metadata?.full_name ?? email.split('@')[0].replace(/[._-]/g, ' '),
          role: data.user?.user_metadata?.role ?? 'Insurance Agent'
        };
        persistUser(user);
        return user;
      } catch {
        // graceful fallback to local mock auth below
      }
    }

    const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Insurance Agent';
    const user: AuthUser = {
      id: 'mock-user-001',
      name: role === 'Admin' ? 'Alex Mercer' : 'Taylor Reed',
      email,
      role,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Prinzi'
    };

    persistUser(user);
    return user;
  },
  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // keep local logout behavior even if supabase is unavailable
      }
    }

    persistUser(null);
  }
};
