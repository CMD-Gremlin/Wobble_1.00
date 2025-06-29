export interface CookieMethods {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options: any) => void;
  remove: (name: string, options: any) => void;
}

export interface SupabaseClientOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
    flowType?: 'implicit' | 'pkce';
    debug?: boolean;
    storage?: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    };
  };
}
