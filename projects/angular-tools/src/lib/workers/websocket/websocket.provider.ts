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
 * @param {WebsocketWorker<M> | InjectionToken<WebsocketWorker<M>>} injectionToken - The injection token to provide. Defaults to WebsocketWorker.
 * @param {WebsocketExponentialBackoffOptions | null} exponentialBackoffOptions - The options for exponential backoff. Optional.
 * @param {WebsocketEventObserver | null} openEventObserver - The observer for open events. Optional.
 * @param {WebsocketEventObserver | null} closeEventObserver - The observer for close events. Optional.
 *
 * @returns {FactoryProvider} - The created provider.
 * @example
 *  providers: [WEBSOCKET_PROVIDER_FACTORY('ws://localhost:8080')]
 *  // => Provides the websocket worker.
 *  // => The websocket worker is used to manage the websocket connection.
 */
export const WEBSOCKET_PROVIDER_FACTORY = <M>(
  urlOrWebSocketSubjectConfig: string | WebSocketSubjectConfig<M>,
  injectionToken:
    | typeof WebsocketWorker<M>
    | InjectionToken<WebsocketWorker<M>> = WebsocketWorker,
  exponentialBackoffOptions: WebsocketExponentialBackoffOptions | null = null,
  openEventObserver: WebsocketEventObserver | null = null,
  closeEventObserver: WebsocketEventObserver | null = null
): FactoryProvider => {
  return {
    provide: injectionToken,
    useFactory: () =>
      new WebsocketWorker<M>(
        urlOrWebSocketSubjectConfig,
        exponentialBackoffOptions,
        openEventObserver,
        closeEventObserver
      )
  };
};
