import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Resilient query for public catalogs (menu_items, rooms, cottages).
 * If authenticated client returns 0 items or errors (due to Supabase RLS policy mismatch for authenticated role),
 * this automatically falls back to an anonymous REST fetch so public products/rooms NEVER disappear.
 */
export async function fetchCatalogResilient<T>(
  table: string,
  options?: {
    filter?: string; // e.g. "available=eq.true&order=name.asc"
    supabaseQuery?: (query: any) => Promise<{ data: any; error: any }>;
  }
): Promise<T[]> {
  // 1. Try normal Supabase client query
  try {
    let result: { data: any; error: any };
    if (options?.supabaseQuery) {
      result = await options.supabaseQuery(supabase.from(table));
    } else {
      result = await supabase.from(table).select('*');
    }

    if (!result.error && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data as T[];
    }
  } catch (err) {
    console.warn(`Standard Supabase query error for ${table}:`, err);
  }

  // 2. Resilient fallback to direct anonymous REST fetch
  try {
    const query = options?.filter ? `select=*&${options.filter}` : 'select=*';
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    if (res.ok) {
      const anonData = await res.json();
      if (Array.isArray(anonData) && anonData.length > 0) {
        return anonData as T[];
      }
    }
  } catch (err) {
    console.error(`Resilient anon fallback fetch error for ${table}:`, err);
  }

  return [];
}
