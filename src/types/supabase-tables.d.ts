/**
 * This file provides TypeScript declarations for tables that might not be
 * included in the auto-generated Supabase types.
 */

declare module "@supabase/supabase-js" {
  interface PostgrestQueryBuilder<T> {
    // Add any missing table names here to make TypeScript happy
    // This is a type-level hack that allows any string to be used with from()
    from(table: string): PostgrestFilterBuilder<T>;
  }
}
