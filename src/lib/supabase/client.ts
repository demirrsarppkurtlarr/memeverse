import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Offline/local mode: allow the app to boot without Supabase.
    // Auth will always be unauthenticated.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    } as any;
  }

  return createBrowserClient(url, anonKey);
}
