// lib/vectorStore.ts
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

let _vecStorePromise: Promise<SupabaseVectorStore> | null = null;

export function getVecStorePromise(): Promise<SupabaseVectorStore> {
  if (!_vecStorePromise) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local"
      );
    }
    const supabase = createClient(url, anonKey);
    const embeddings = new OpenAIEmbeddings();
    _vecStorePromise = SupabaseVectorStore.fromExistingIndex(embeddings, {
      client: supabase,
      tableName: "tool_vectors",
    });
  }
  return _vecStorePromise;
}
