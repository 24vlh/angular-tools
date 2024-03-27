import { ServerSentEventWorker } from './server-sent-event.worker';
import { FactoryProvider, InjectionToken, NgZone } from '@angular/core';
import { TimeoutBackoffConfigs } from '../../helpers/timeout-backoff.interface';

/**
 * Factory function to create a provider for the server-sent event worker
 *
 * @template M - The type of the messages.
 * @param {string} url - The URL of the server-sent event server.
 * @param {TimeoutBackoffConfigs | undefined} timeoutBackoffConfigs - The timeout backoff configurations. Optional.
 * @param {typeof ServerSentEventWorker<M> | InjectionToken<ServerSentEventWorker<M>>} injectionToken - The injection token to provide. Defaults to ServerSentEventWorker.
 * @param {boolean | undefined} withCredentials - Whether to include credentials in the request. Optional.
 *
 * @returns {FactoryProvider} - The created provider.
 */
export const SERVER_EVENT_SENT_PROVIDER_FACTORY = <M>(
  url: string,
  timeoutBackoffConfigs?: TimeoutBackoffConfigs,
  injectionToken:
    | typeof ServerSentEventWorker<M>
    | InjectionToken<ServerSentEventWorker<M>> = ServerSentEventWorker,
  withCredentials?: boolean
): FactoryProvider => {
  return {
    provide: injectionToken,
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
