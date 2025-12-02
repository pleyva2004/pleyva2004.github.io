// lib/realtime/types.ts
/**
 * Minimal shapes for the subset of OpenAI Realtime events we consume.
 * The API can return many more properties, so we keep an index signature
 * to remain forward compatible while still avoiding `any`.
 */
export interface RealtimeEventItem extends Record<string, unknown> {
  type?: string;
  call_id?: string;
  name?: string;
}

export interface RealtimeEvent extends Record<string, unknown> {
  type?: string;
  delta?: string;
  item?: RealtimeEventItem;
  item_id?: string;
  call_id?: string;
  name?: string;
  function_name?: string;
}

