/**
 * Creates a function that will call a retry callback with an exponentially increasing delay between each call.
 * If the maximum number of retries is exceeded, an optional error callback is called.
 * The delay between retries can be reset by calling the returned function with `true`.
 *
 * @param {() => void} retryCallback - The callback to be called on each retry.
 * @param {() => void} [errorCallback] - The callback to be called when the maximum number of retries is exceeded.
 * @param [maxRetries=3] - The maximum number of retries before the error callback is called.
 * @param [initialDelay=1000] - The initial delay in milliseconds before the first retry.
 * @param [maxDelay='2 * 60 * 1000'] - The maximum delay in milliseconds between retries.
 * @returns {(reset?: boolean) => void} - A function that when called, will initiate a retry or reset the retry count.
 * @example
 *  TimeoutBackoff(
 *   () => console.log('Retry'),
 *   () => console.log('Error'),
 *   3,
 *   1000,
 *   2 * 60 * 1000
 *  );
 *  // => Returns a function that will initiate a retry or reset the retry count.
 *  // => The retryCallback is the callback to be called on each retry.
 *  // => The errorCallback is the callback to be called when the maximum number of retries is exceeded.
 *  // => The maximum number of retries is 3.
 *  // => The initial delay is 1000 milliseconds.
 *  // => The maximum delay is 2 minutes.
 */
export function TimeoutBackoff(
  retryCallback: () => void,
  errorCallback?: () => void,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 2 * 60 * 1000
): (reset?: boolean) => void {
  let retries = 0;
  const retry = (reset?: boolean): void => {
    if (reset === true) {
      retries = 0;
      return void 0;
    }

    ++retries;
    if (retries > maxRetries) {
      if (errorCallback) {
        errorCallback();
      }
    } else {
      setTimeout(
        (): void => {
          retryCallback();
        },
        Math.min(initialDelay * Math.pow(2, retries), maxDelay)
      );
    }
  };

  return (reset?: boolean) => retry(reset);
}
