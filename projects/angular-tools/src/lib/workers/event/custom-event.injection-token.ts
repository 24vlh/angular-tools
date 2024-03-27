import { InjectionToken } from '@angular/core';
import { ReplaySubject } from 'rxjs';

/**
 * InjectionToken for the type of custom event.
 * This InjectionToken is used to provide the type of custom event in the application.
 * The type of the custom event is a string.
 *
 * @type {InjectionToken<string>}
 */
export const CUSTOM_EVENT_TYPE: InjectionToken<string> =
  new InjectionToken<string>('CUSTOM_EVENT_TYPE');

/**
 * InjectionToken for a ReplaySubject that streams custom events.
 * This InjectionToken is used to provide a ReplaySubject that can be used to stream custom events in the application.
 * The ReplaySubject is typed as unknown, meaning it can emit values of any type.
 *
 * @type {InjectionToken<ReplaySubject<unknown>>}
 */
export const CUSTOM_EVENT_STREAM_REPLAY_SUBJECT: InjectionToken<
  ReplaySubject<unknown>
> = new InjectionToken<ReplaySubject<unknown>>(
  'CUSTOM_EVENT_STREAM_REPLAY_SUBJECT'
);

/**
 * InjectionToken for a Window object.
 * This InjectionToken is used to provide a Window object that can be used to dispatch custom events in the application.
 * The Window object is typed as Window & typeof globalThis, meaning it can be used to dispatch custom events in the application.
 *
 * @template globalThis
 * @type {InjectionToken<Window & typeof globalThis>}
 */
export const CUSTOM_EVENT_WINDOW_OBJECT: InjectionToken<
  Window & typeof globalThis
> = new InjectionToken<Window & typeof globalThis>(
  'CUSTOM_EVENT_WINDOW_OBJECT'
);
