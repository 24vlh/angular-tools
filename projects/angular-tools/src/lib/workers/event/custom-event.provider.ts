import { InjectionToken, Provider } from '@angular/core';
import { CustomEventWorker } from './custom-event.worker';
import { ReplaySubject } from 'rxjs';
import { CUSTOM_EVENT_WINDOW_OBJECT } from './custom-event.injection-token';
import { CustomEventProviderFactoryConfigs } from './custom-event.interface';
import { OfObjectType } from '@24vlh/ts-assert';

/**
 * `CUSTOM_EVENT_PROVIDER_FACTORY` is a function that provides a custom event worker and a custom event stream.
 * It is used to provide a custom event worker instance and a custom event stream.
 * The localized injection tokens should be defined locally and for them to pass
 * and not fail, they should be identical in type/value with the type/value expected.
 *
 * @function
 * @template T - The type of the custom event worker.
 * @param {InjectionToken<CustomEventWorker<T>>} workerInjectionToken - The injection token for the custom event worker.
 * @param configs
 * @returns {Provider[]} An array of providers.
 * @example
 *  providers: CUSTOM_EVENT_PROVIDER_FACTORY(LOCALIZED_CUSTOM_EVENT_WORKER_INJECTION_TOKEN, LOCALIZED_CUSTOM_EVENT_STREAM_REPLAY_SUBJECT_INJECTION_TOKEN, bufferSize)
 *  // => Provides a custom event worker instance and a custom event stream.
 *  // => The custom event worker instance dispatches custom events to the custom event stream.
 *  // => LOCALIZED_CUSTOM_EVENT_WORKER_INJECTION_TOKEN is the injection token for the custom event worker.
 *  // => LOCALIZED_CUSTOM_EVENT_STREAM_REPLAY_SUBJECT_INJECTION_TOKEN is the injection token for the custom event stream.
 *  // => replySubjectBufferSize is the buffer size of the custom event stream.
 *  // => CUSTOM_EVENT_WINDOW_OBJECT is the injection token for the window object.
 *  // => The window object is the window object.
 *  // => LOCALIZED_CUSTOM_EVENT_STREAM_REPLAY_SUBJECT_INJECTION_TOKEN should be of type CUSTOM_EVENT_STREAM_REPLAY_SUBJECT
 */
export const CUSTOM_EVENT_PROVIDER_FACTORY = <T>(
  workerInjectionToken: InjectionToken<CustomEventWorker<T>>,
  configs?: CustomEventProviderFactoryConfigs
): Provider[] => {
  configs = {
    ...{
      replySubjectBufferSize: 1,
      windowObjectInjectionToken: CUSTOM_EVENT_WINDOW_OBJECT,
      windowObject: window
    },
    ...(OfObjectType<CustomEventProviderFactoryConfigs>(configs) ? configs : {})
  };
  return [
    {
      provide: workerInjectionToken,
      useFactory: (windowObject: Window & typeof globalThis) =>
        new CustomEventWorker(
          workerInjectionToken.toString(),
          new ReplaySubject<T>(configs.replySubjectBufferSize),
          windowObject
        ),
      deps: [configs.windowObjectInjectionToken]
    },
    {
      provide: configs.windowObjectInjectionToken,
      useValue: configs.windowObject
    }
  ];
};
