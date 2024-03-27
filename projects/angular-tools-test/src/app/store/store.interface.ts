export interface Store extends Record<string, unknown> {
  name: string | null;
  value: string | null;
  object: Record<string, unknown> | null;
}
