import { PollingConfigs, PollingFilter, PollingManager } from './polling.type';
import {
  distinctUntilChanged,
  filter,
  Observable,
  Subscription,
  switchMap,
  tap,
  timer
} from 'rxjs';
import { OfFunctionType } from '@24vlh/ts-assert';

/**
 * The `startPolling` function is used to perform HTTP GET requests at regular intervals.
 *
 * @template T The type of the response object.
 * @param {Observable<T>} httpGetCall The Observable of the HTTP GET request.
 * @param {number} interval The time interval (in milliseconds) at which the HTTP GET request will be sent.
 * @param {PollingConfigs<T>} configs The configuration object for the polling operation.
 * @returns {Observable<T>} An Observable that emits the response of each HTTP GET request.
 * @example
 *  startPolling(() => http.get('https://api.example.com/data'), 1000, {
 *  comparerCallback: (prev, curr) => prev.id === curr.id,
 *  callback: (response) => console.log(response)
 *  });
 *  // => Returns an Observable that emits the response of each HTTP GET request.
 *  // => The HTTP GET request is sent to the provided URL at regular intervals.
 *  // => The time interval is 1000 milliseconds.
 *  // => The comparerCallback function is used to compare the current and previous responses.
 *
 * The configuration object (`configs`) has the following properties:
 * - `comparerCallback`: A function to compare the current and previous responses. If this function returns `true`, the Observable will not emit the current response.
 * - `callback`: A function that is called with the response of each HTTP GET request.
 *
 * If the `comparerCallback` function is not provided, the method uses a default comparer that checks if the JSON stringified versions of the current and previous responses are equal.
 */
export const StartPolling = <T>(
  httpGetCall: Observable<T>,
  interval: number,
  configs?: Omit<PollingConfigs<T>, 'httpOptions'>
): Observable<T> => {
  return timer(0, interval).pipe(
    switchMap(() => httpGetCall),
    filter(
      ((filterCallback: PollingFilter<T> | undefined) => {
        return (data: T): boolean => {
          if (OfFunctionType<PollingFilter<T>>(filterCallback)) {
            return filterCallback(data);
          } else {
            return true;
          }
        };
      })(configs?.filterCallback)
    ),
    distinctUntilChanged(
      OfFunctionType(configs?.comparerCallback)
        ? configs?.comparerCallback
        : (prev: T, curr: T): boolean =>
            JSON.stringify(prev) === JSON.stringify(curr)
    ),
    tap(configs?.callback)
  );
};

/**
 * The `pollFactory` function is used to create a polling function with a specific time interval and configuration.
 *
 * @template T The type of the response object.
 * @param {number} interval The time interval (in milliseconds) at which the HTTP GET request will be sent.
 * @param {PollingConfigs<T>} configs The configuration object for the polling operation.
 * @returns {(httpGetCall: () => Observable<T>) => Observable<T>} A function that takes an Observable of the HTTP GET request and returns an Observable that emits the response of each HTTP GET request.
 * @example
 *  const poll = pollFactory(1000, {
 *  comparerCallback: (prev, curr) => prev.id === curr.id,
 *  callback: (response) => console.log(response)
 *  });
 *  poll(() => http.get('https://api.example.com/data'));
 *  // => Returns an Observable that emits the response of each HTTP GET request.
 *  // => The HTTP GET request is sent to the provided URL at regular intervals.
 *  // => The time interval is 1000 milliseconds.
 *  // => The comparerCallback function is used to compare the current and previous responses.
 */
export const PollFactory = <T>(
  interval: number,
  configs?: Omit<PollingConfigs<T>, 'httpOptions'>
): ((httpGetCall: Observable<T>) => Observable<T>) => {
  return (httpGetCall: Observable<T>) =>
    StartPolling(httpGetCall, interval, configs);
};

/**
 * The `BootstrapPollingSession` function is used to create a polling manager with a specific time interval and configuration.
 * The polling manager controls the polling operation and provides methods to stop and resume the polling operation.
 * The polling manager also provides an Observable that emits the response of each HTTP GET request.
 * The polling manager is created with the `httpGetCall` function, which returns an Observable of the HTTP GET request, the time interval, and the configuration object.
 *
 * @template T The type of the response object.
 * @param {Observable<T>} httpGetCall The Observable of the HTTP GET request.
 * @param {number} interval The time interval (in milliseconds) at which the HTTP GET request will be sent.
 * @param {PollingConfigs<T>} configs The configuration object for the polling operation.
 * @returns {PollingManager<T>} A polling manager that controls the polling operation.
 * @example
 *  const pollingManager = BootstrapPollingSession(() => http.get('https://api.example.com/data'), 1000, {
 *  comparerCallback: (prev, curr) => prev.id === curr.id,
 *  callback: (response) => console.log(response)
 *  });
 *  // => Returns a polling manager that controls the polling operation.
 *  // => The HTTP GET request is sent to the provided URL at regular intervals.
 *  // => The time interval is 1000 milliseconds.
 *  // => The comparerCallback function is used to compare the current and previous responses.
 */
export const BootstrapPollingSession = <T>(
  httpGetCall: Observable<T>,
  interval: number,
  configs?: Omit<PollingConfigs<T>, 'httpOptions'>
): PollingManager<T> => {
  const observable: Observable<T> = StartPolling(
    httpGetCall,
    interval,
    configs
  );
  let subscription: Subscription = observable.subscribe();

  return {
    get pollingObservable$(): Observable<T> {
      return observable;
    },
    get pollingSubscription(): Subscription {
      return subscription;
    },
    stop(): void {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }
    },
    resume(): void {
      if (subscription.closed) {
        subscription = observable.subscribe();
      }
    },
    restart(): void {
      this.stop();
      this.resume();
    }
  };
};
