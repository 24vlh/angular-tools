import { ServerSentEventWorker } from './server-sent-event.worker';
import { FactoryProvider, InjectionToken, NgZone } from '@angular/core';
import { TimeoutBackoffConfigs } from '../../helpers/timeout-backoff.interface';

/**
 * Factory function to create a provider for the server-sent event worker
 *
 * @template M - The type of the messages.
 * @param {string} url - The URL of the server-sent event server.
 * @param {TimeoutBackoffConfigs | undefined} timeoutBackoffConfigs - The timeout backoff configurations. Optional.
 * @param {typeof ServerSentEventWorker<M> | InjectionToken<ServerSentEventWorker<M>>} workerInjectionToken - The injection token to provide. Defaults to ServerSentEventWorker.
 * @param {boolean | undefined} withCredentials - Whether to include credentials in the request. Optional.
 *
 * @returns {FactoryProvider} - The created provider.
 * @example
 *  providers: [SERVER_EVENT_SENT_PROVIDER_FACTORY('http://localhost:3000')]
 *  // => Provides the server-sent event worker.
 *  // => The server-sent event worker is used to manage server-sent event requests.
 *  const workerInjectionToken = new InjectionToken<ServerSentEventWorker<M>>('injectionToken');
 *  providers: [SERVER_EVENT_SENT_PROVIDER_FACTORY('http://localhost:3000', undefined, workerInjectionToken)]
 *  // => Provides the server-sent event worker.
 *  // => The server-sent event worker is used to manage server-sent event requests.
 *  providers: [SERVER_EVENT_SENT_PROVIDER_FACTORY('http://localhost:3000', undefined, workerInjectionToken, true)]
 *  // => Provides the server-sent event worker.
 *  // => The server-sent event worker is used to manage server-sent event requests.
 */
export const SERVER_EVENT_SENT_PROVIDER_FACTORY = <M>(
  url: string,
  timeoutBackoffConfigs?: TimeoutBackoffConfigs,
  workerInjectionToken:
    | typeof ServerSentEventWorker<M>
    | InjectionToken<ServerSentEventWorker<M>> = ServerSentEventWorker,
  withCredentials?: boolean
): FactoryProvider => {
  return {
    provide: workerInjectionToken,
    useFactory: (ngZone: NgZone) =>
      new ServerSentEventWorker<M>(
        url,
        withCredentials,
        timeoutBackoffConfigs,
        ngZone
      ),
    deps: [NgZone]
  };
};
