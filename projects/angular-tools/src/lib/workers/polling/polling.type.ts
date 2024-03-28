import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

/**
 * The `PollingHttpOptions` interface is used to configure the HTTP GET request for polling.
 * The `PollingHttpOptions` interface extends the Angular `HttpOptions` interface.
 */
export interface PollingHttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?:
    | HttpParams
    | Record<
        string,
        string | number | boolean | readonly (string | number | boolean)[]
      >;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

/**
 * The `PollingComparer` type is used to compare the current and previous responses.
 * The `PollingComparer` type is a function that takes two arguments: the previous response and the current response.
 * The function returns a boolean value indicating whether the current response is equal to the previous response.
 */
export type PollingComparer<T> = (prev: T, curr: T) => boolean;

/**
 * The `PollingFilter` type is used to filter the response of the HTTP GET request.
 * The `PollingFilter` type is a function that takes the response of the HTTP GET request as an argument and returns a boolean value.
 * If the function returns `true`, the Observable will emit the response.
 */
export type PollingFilter<T> = (data: T) => boolean;

/**
 * The `PollingConfigs` interface is used to configure the polling operation.
 *
 * The `PollingConfigs` interface has the following properties:
 * - `httpOptions`: The optional HTTP headers for the GET request.
 * - `comparerCallback`: A function to compare the current and previous responses. If this function returns `true`, the Observable will not emit the current response.
 * - `callback`: A function that is called with the response of each HTTP GET request.
 */
export interface PollingConfigs<T> {
  httpOptions?: PollingHttpOptions;
  filterCallback?: PollingFilter<T>;
  comparerCallback?: PollingComparer<T>;
  callback?: (data: T) => void;
}

/**
 * The `PollingManager` interface is used to manage the polling operation.
 *
 * The `PollingManager` interface has the following properties:
 * - `pollingObservable$`: An Observable that emits the response of each HTTP GET request.
 * - `pollingSubscription`: The subscription to the polling Observable.
 * - `stop`: A function to stop the polling operation.
 * - `resume`: A function to resume the polling operation with a new HTTP GET request, time interval, and configuration.
 * - `restart`: A function to restart the polling operation with the same HTTP GET request, time interval, and configuration.
 */
export interface PollingManager<T> {
  pollingObservable$: Observable<T>;
  pollingSubscription: Subscription;
  stop: () => void;
  resume: () => void;
  restart: () => void;
}
