export type DataStatus = "loading" | "ready" | "error";

export interface DataState<T> {
  status: DataStatus;
  data: T;
  error: string | null;
}
