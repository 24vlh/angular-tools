import { WebsocketWorker } from './websocket.worker';
import { WebSocketSubjectConfig } from 'rxjs/internal/observable/dom/WebSocketSubject';
import {
  WebsocketEventObserver,
  WebsocketExponentialBackoffOptions
} from './websocket.type';
import { FactoryProvider, InjectionToken } from '@angular/core';

/**
 * Factory function to create a provider for the websocket worker
 *
 * @template M - The type of the messages.
 * @param {string | WebSocketSubjectConfig<M>} urlOrWebSocketSubjectConfig - The URL or WebSocketSubjectConfig to use for the websocket connection.
 * @param {WebsocketWorker<M> | InjectionToken<WebsocketWorker<M>>} workerInjectionToken - The injection token to provide. Defaults to WebsocketWorker.
 * @param {WebsocketExponentialBackoffOptions | null} exponentialBackoffOptions - The options for exponential backoff. Optional.
 * @param {WebsocketEventObserver | null} openEventObserver - The observer for open events. Optional.
 * @param {WebsocketEventObserver | null} closeEventObserver - The observer for close events. Optional.
 *
 * @returns {FactoryProvider} - The created provider.
 * @example
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080')]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 *  const workerInjectionToken = new InjectionToken<WebsocketWorker<M>>('injectionToken');
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080', workerInjectionToken)]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 *  const workerInjectionToken = new InjectionToken<WebsocketWorker<M>>('injectionToken');
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080', workerInjectionToken, { initialDelay: 1000, maxDelay: 5000 })]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 *  // => The websocket worker uses exponential backoff with an initial delay of 1000ms and a max delay of 5000ms.
 *  const workerInjectionToken = new InjectionToken<WebsocketWorker<M>>('injectionToken');
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080', workerInjectionToken, { initialDelay: 1000, maxDelay: 5000 }, { next: () => console.log('open') }, { next: () => console.log('close') })]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 *  // => The websocket worker uses exponential backoff with an initial delay of 1000ms and a max delay of 5000ms.
 *  // => The websocket worker has an observer for open events that logs 'open'.
 *  // => The websocket worker has an observer for close events that logs 'close'.
 *  const workerInjectionToken = new InjectionToken<WebsocketWorker<M>>('injectionToken');
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080', workerInjectionToken, null, { next: () => console.log('open') }, { next: () => console.log('close') })]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 *  // => The websocket worker has an observer for open events that logs 'open'.
 *  // => The websocket worker has an observer for close events that logs 'close'.
 */
export const WEBSOCKET_PROVIDER_FACTORY = <M>(
  urlOrWebSocketSubjectConfig: string | WebSocketSubjectConfig<M>,
  workerInjectionToken:
    | typeof WebsocketWorker<M>
    | InjectionToken<WebsocketWorker<M>> = WebsocketWorker,
  exponentialBackoffOptions: WebsocketExponentialBackoffOptions | null = null,
  openEventObserver: WebsocketEventObserver | null = null,
  closeEventObserver: WebsocketEventObserver | null = null
): FactoryProvider => {
  return {
    provide: workerInjectionToken,
    useFactory: () =>
      new WebsocketWorker<M>(
        urlOrWebSocketSubjectConfig,
        exponentialBackoffOptions,
        openEventObserver,
        closeEventObserver
      )
  };
};
