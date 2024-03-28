/**
 * Server Sent Event interface
 *
 * @param M - Message type
 * @param E - Event type
 */
export interface ServerSentEvent<M, E> {
  event: E;
  data: M;
}
