export interface ServerSentEvent<M, E> {
  event: E;
  data: M;
}
