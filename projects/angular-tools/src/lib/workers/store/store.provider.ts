import { FactoryProvider, InjectionToken } from '@angular/core';
import { StoreWorker } from './store.worker';

/**
 * Factory function for creating a StoreWorker provider.
 *
 * @template T - The type of the initial state.
 * @param {T} initialState - The initial state of the StoreWorker.
 * @param {typeof StoreWorker<T> | InjectionToken<StoreWorker<T>>} workerInjectionToken - The injection token for the StoreWorker.
 *
 * @return {FactoryProvider} The created provider.
 * @example
 *  const workerInjectionToken = new InjectionToken<StoreWorker<T>>('injectionToken');
 *  providers: [STORE_PROVIDER_FACTORY(initialState, workerInjectionToken)]
 *  // => Provides the StoreWorker with the initial state.
 *  // => The StoreWorker is used to manage the state of the application.
 */
export const STORE_PROVIDER_FACTORY = <T extends Record<string, unknown>>(
  initialState: T,
  workerInjectionToken: typeof StoreWorker<T> | InjectionToken<StoreWorker<T>>
): FactoryProvider => {
  return {
    provide: workerInjectionToken,
    useFactory: (): StoreWorker<T> => new StoreWorker<T>(initialState)
  };
};
