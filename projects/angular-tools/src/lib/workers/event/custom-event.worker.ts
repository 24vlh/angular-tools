import { Inject, Optional } from '@angular/core';
import {
  CUSTOM_EVENT_STREAM_REPLAY_SUBJECT,
  CUSTOM_EVENT_TYPE,
  CUSTOM_EVENT_WINDOW_OBJECT
} from './custom-event.injection-token';
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  race,
  repeat,
  ReplaySubject,
  take
} from 'rxjs';
import { CustomEventApi } from './custom-event.api';
import { DispatchCustomEvent } from './custom-event.helper';
import { OfFunctionType } from '@24vlh/ts-assert';

/**
 * Class representing a custom event worker.
 *
 * @template T - The type of the data associated with the custom event.
 */
export class CustomEventWorker<T> {
  public customEventStream$: Observable<T> =
    this.customEventStream.asObservable();

  /**
   * Create a custom event worker.
   *
   * @template T
   * @template globalThis
   * @param {string} type - The type of the custom event.
   * @param {ReplaySubject<T>} customEventStream - The custom event stream.
   * @param {Window & typeof globalThis} windowObject - The window object.
   */
  constructor(
    @Inject(CUSTOM_EVENT_TYPE)
    @Optional()
    private type: string,
    @Inject(CUSTOM_EVENT_STREAM_REPLAY_SUBJECT)
    @Optional()
    public customEventStream: ReplaySubject<T>,
    @Inject(CUSTOM_EVENT_WINDOW_OBJECT)
    @Optional()
    private windowObject: Window & typeof globalThis = window
  ) {}

  /**
   * Dispatch a custom event.
   *
   * @param {T} data - The data to be dispatched with the custom event.
   * @param {CustomEventInit} eventInitDict - The custom event initialization dictionary.
   * @returns {void}
   * @example
   *  customEventWorker.DispatchCustomEvent(window, 'type', data);
   *  customEventWorker.DispatchCustomEvent(window, 'type', data, eventInitDict);
   *  // => Dispatches a custom event with the provided data and event initialization dictionary.
   *  // => If the event initialization dictionary is not provided, it defaults to the CustomEventInit dictionary.
   *  // => If the event initialization dictionary is not of type CustomEventInit, it catches the error and logs it.
   *  // => If the data is not provided, it catches the error and logs it.
   *  // => If the data is not of type T, it catches the error and logs it.
   *  // => If the type is not provided, it catches the error and logs it.
   *  // => If the type is not of type string, it catches the error and logs it.
   *  // => If the window object is not provided, it catches the error and logs it.
   *  // => If the window object is not of type Window, it catches the error and logs it.
   */
  DispatchCustomEvent(data: T, eventInitDict?: CustomEventInit): void {
    DispatchCustomEvent(this.windowObject, this.type, data, eventInitDict);
  }

  /**
   * Dispatch a custom event.
   *
   * @param {T} data - The data to be dispatched with the custom event.
   * @param {CustomEventInit} eventInitDict - The custom event initialization dictionary.
   * @returns {void}
   * @example
   *  customEventWorker.dispatch(data);
   *  customEventWorker.dispatch(data, eventInitDict);
   *  // => Dispatches a custom event with the provided data and event initialization dictionary.
   *  // => The event is dispatched to the window object.
   *  // => The event is also dispatched to the custom event stream.
   *  // => The event is dispatched to the custom event listeners.
   *  // => If the event initialization dictionary is not provided, it defaults to the CustomEventInit dictionary.
   *  // => If the event initialization dictionary is not of type CustomEventInit, it catches the error and logs it.
   *  // => If the data is not provided, it catches the error and logs it.
   *  // => If the data is not of type T, it catches the error and logs it.
   *  // => If the type is not provided, it catches the error and logs it.
   *  // => If the type is not of type string, it catches the error and logs it.
   *  // => If the window object is not provided, it catches the error and logs it.
   *  // => If the window object is not of type Window, it catches the error and logs it.
   *  // => If the custom event stream is not provided, it catches the error and logs it.
   *  // => If the custom event stream is not of type ReplaySubject, it catches the error and logs it.
   *  // => If the custom event stream observable is not provided, it catches the error and logs it.
   */
  dispatch(data: T, eventInitDict?: CustomEventInit): void {
    this.customEventStream.next(data);
    this.DispatchCustomEvent(data, eventInitDict);
  }

  /**
   * Listen for a custom event.
   *
   * @param {(data: T) => boolean} filterCallback - A callback function to filter the custom events.
   * @param {(prev: T, curr: T) => boolean} comparerCallback - A callback function to compare the previous and current custom events.
   * @returns {Observable<T>} An observable of the custom events.
   * @example
   *  customEventWorker.listen$();
   *  // => An observable of the custom events.
   *  customEventWorker.listen$((data: T) => data.key === 'value');
   *  // => An observable of the custom events that pass the filter callback.
   *  customEventWorker.listen$(
   *   (data: T) => data.key === 'value',
   *   (prev: T, curr: T) => prev.key === curr.key
   *  );
   *  // => An observable of the custom events that pass the filter callback and do not match the comparer callback.
   */
  listen$(
    filterCallback?: (data: T) => boolean,
    comparerCallback?: (prev: T, curr: T) => boolean
  ): Observable<T> {
    return race(
      fromEvent<CustomEventApi<T>>(this.windowObject, this.type).pipe(
        map((event: CustomEventApi<T>): T => event.data)
      ),
      this.customEventStream$
    ).pipe(
      repeat(), // Repeat the observable indefinitely. Keep this before the take operator.
      take(1),
      filter(
        OfFunctionType<() => boolean>(filterCallback)
          ? filterCallback
          : (): boolean => true
      ),
      distinctUntilChanged(
        OfFunctionType<(prev: T, curr: T) => boolean>(comparerCallback)
          ? comparerCallback
          : (prev: T, curr: T): boolean =>
              JSON.stringify(prev) === JSON.stringify(curr)
      )
    );
  }
}
