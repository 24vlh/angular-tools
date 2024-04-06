import { Observable, retry, timer } from 'rxjs';

/**
 * Function to implement exponential backoff in observables.
 *
 * @template T - The type of the items in the Observable.
 * @param maxRetryAttempts - The maximum number of retry attempts. Default is 3.
 * @param initialDelay - The initial delay in milliseconds before the first retry. Default is 1000.
 * @param maxDelay - The maximum delay in milliseconds between retries. Default is 2 minutes.
 * @param {number} disableAndUseConstantDelayOf - If provided, disables exponential backoff and uses this constant delay instead.
 * @returns {(sourceObservable: Observable<T>) => Observable<T>} - A function that takes an Observable and returns an Observable with retry logic applied.
 * @example
 *  ExponentiallyBackoff(10, 1000, 2 * 60 * 1000, 5000);
 *  // => Returns an Observable with retry logic applied.
 *  // => The maximum number of retry attempts is 10.
 *  // => The initial delay is 1000 milliseconds.
 *  // => The maximum delay is 2 minutes.
 *  // => If the disableAndUseConstantDelayOf is provided, it disables exponential backoff and uses the constant delay of 5000 milliseconds instead.
 *  // => The sourceObservable is the Observable to which the retry logic is applied.
 *  // => The returned Observable has retry logic applied.
 */
export function ExponentiallyBackoff<T>(
  maxRetryAttempts = 3,
  initialDelay = 1000,
  maxDelay = 2 * 60 * 1000,
  disableAndUseConstantDelayOf?: number
): (sourceObservable: Observable<T>) => Observable<T> {
  return (sourceObservable: Observable<T>): Observable<T> =>
    sourceObservable.pipe(
      retry({
        count: maxRetryAttempts,
        resetOnSuccess: true,
        delay: (errors: Event, retryCount: number) => {
          return timer(
            disableAndUseConstantDelayOf ??
              Math.min(initialDelay * Math.pow(2, retryCount), maxDelay)
          );
        }
      })
    );
}
