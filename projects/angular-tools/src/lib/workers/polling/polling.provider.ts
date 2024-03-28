import { FactoryProvider, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PollingWorker } from './polling.worker';

/**
 * Factory function to create a provider for the polling worker
 *
 * @param {typeof PollingWorker | InjectionToken<PollingWorker>} workerInjectionToken - The injection token to provide. Defaults to PollingWorker.
 *
 * @returns {FactoryProvider} - The created provider.
 * @example
 *  providers: [POLLING_WORKER_PROVIDER_FACTORY(PollingWorker)]
 *  // => Provides the polling worker.
 *  // => The polling worker is used to manage polling requests.
 *  const workerInjectionToken = new InjectionToken<PollingWorker>('injectionToken');
 *  providers: [POLLING_WORKER_PROVIDER_FACTORY(workerInjectionToken)]
 *  // => Provides the polling worker.
 *  // => The polling worker is used to manage polling requests.
 */
export const POLLING_WORKER_PROVIDER_FACTORY = (
  workerInjectionToken:
    | typeof PollingWorker
    | InjectionToken<PollingWorker> = PollingWorker
): FactoryProvider => {
  return {
    provide: workerInjectionToken,
    useFactory: (http: HttpClient) => {
      return new PollingWorker(http);
    },
    deps: [HttpClient]
  };
};
