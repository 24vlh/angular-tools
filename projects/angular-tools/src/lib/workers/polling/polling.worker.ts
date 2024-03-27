import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PollingConfigs } from './polling.type';
import { Observable } from 'rxjs';
import { StartPolling } from './polling.helper';

/**
 * Class representing a polling worker.
 * The `PollingWorker` class is used to perform HTTP GET requests at regular intervals.
 */
@Injectable({
  providedIn: 'root'
})
export class PollingWorker {
  /**
   * Create a polling worker.
   *
   * @param {HttpClient} http - The Angular HttpClient service.
   * @example
   *  new PollingWorker(http);
   *  // => Creates a new polling worker with the provided Angular HttpClient service.
   */
  constructor(public http: HttpClient) {}

  /**
   * The `poll$` method is used to perform HTTP GET requests at regular intervals.
   *
   * @template T The type of the response object.
   * @param {string} url The URL to which the HTTP GET request will be sent.
   * @param {number} interval The time interval (in milliseconds) at which the HTTP GET request will be sent.
   * @param {PollingConfigs<T>} configs The configuration object for the polling operation.
   * @returns {Observable<T>} An Observable that emits the response of each HTTP GET request.
   * @example
   *  poll$('https://api.example.com/data', 1000, {
   *  httpOptions: {
   *  headers: new HttpHeaders({
   *  'Content-Type': 'application/json'
   *  })
   *  },
   *  comparerCallback: (prev, curr) => prev.id === curr.id,
   *  callback: (response) => console.log(response)
   *  });
   *  // => Returns an Observable that emits the response of each HTTP GET request.
   *  // => The HTTP GET request is sent to the provided URL at regular intervals.
   *  // => The time interval is 1000 milliseconds.
   *  // => The HTTP headers for the GET request are provided in the httpOptions property.
   *  // => The comparerCallback function is used to compare the current and previous responses.
   *
   * The configuration object (`configs`) has the following properties:
   * - `httpOptions`: The optional HTTP headers for the GET request.
   * - `comparerCallback`: A function to compare the current and previous responses. If this function returns `true`, the Observable will not emit the current response.
   * - `callback`: A function that is called with the response of each HTTP GET request.
   *
   * If the `comparerCallback` function is not provided, the method uses a default comparerCallback that checks if the JSON stringified versions of the current and previous responses are equal.
   */
  poll$<T>(
    url: string,
    interval: number,
    configs?: PollingConfigs<T>
  ): Observable<T> {
    return StartPolling<T>(
      this.http.get<T>(url, configs?.httpOptions),
      interval,
      configs
    );
  }
}
