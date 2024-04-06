/**
 * Timeout backoff configurations
 *
 * @export
 * @interface TimeoutBackoffConfigs
 * @property {number} [maxRetries] - The maximum number of retries before the error callback is called.
 * @property {number} [initialDelay] - The initial delay in milliseconds before the first retry.
 * @property {number} [maxDelay] - The maximum delay in milliseconds between retries.
 */
export interface TimeoutBackoffConfigs {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}
