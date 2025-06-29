// Stub type declarations for libraries without available @types packages.
// This silences "Cannot find type definition" errors while the project does not
// directly depend on these libraries.

declare module 'chai' {
  const chai: any;
  export = chai;
}

declare module 'cookiejar' {
  const cookiejar: any;
  export = cookiejar;
}

declare module 'deep-eql' {
  const eql: any;
  export = eql;
}

declare module 'estree' {
  export interface Node {
    type: string;
    [key: string]: any;
  }
}

declare module 'phoenix' {
  const phoenix: any;
  export = phoenix;
}

declare module '@supabase/ssr' {
  export interface SupabaseClient {
    from: (...args: any[]) => any;
    auth: any;
  }
  export function createServerClient<DB = any>(...args: any[]): SupabaseClient;
  export function createServerClient<DB = any>(...args: any[]): SupabaseClient;
}
