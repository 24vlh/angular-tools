export type WebsocketEventObserver = (event: Event | CloseEvent) => void;

/**
 * `WebsocketExponentialBackoffOptions` is an interface that defines the configuration options for
 * an exponential backoff strategy in a WebSocket connection.
 *
 * Exponential backoff is a strategy used in network communication for retrying failed requests,
 * where the delay between retry attempts exponentially increases with each failed attempt, up to a maximum delay.
 *
 * @property {number} maxRetryAttempts - The maximum number of retry attempts. If not specified, the default is `Infinity`.
 * @property {number} initialDelay - The initial delay in milliseconds before the first retry attempt. If not specified, the default is `1000`.
 * @property {number} maxDelay - The maximum delay in milliseconds between retry attempts. If not specified, the default is `30000`.
 * @property {number} disableAndUseConstantDelayOf - If specified, disables the exponential backoff strategy and uses a constant delay of this value in milliseconds between retry attempts.
 */
export interface WebsocketExponentialBackoffOptions {
  maxRetryAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  disableAndUseConstantDelayOf?: number;
}
