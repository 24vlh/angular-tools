import { FactoryProvider, InjectionToken } from '@angular/core';
import { StoreWorker } from './store.worker';

/**
 * Factory function for creating a StoreWorker provider.
 *
 * @template T - The type of the initial state.
 * @param {T} initialState - The initial state of the StoreWorker.
 * @param {typeof StoreWorker<T> | InjectionToken<StoreWorker<T>>} storeInjectionToken - The injection token for the StoreWorker.
 *
 * @return {FactoryProvider} The created provider.
 */
export const STORE_PROVIDER_FACTORY = <T extends Record<string, unknown>>(
  initialState: T,
  storeInjectionToken: typeof StoreWorker<T> | InjectionToken<StoreWorker<T>>
): FactoryProvider => {
  return {
    provide: storeInjectionToken,
    useFactory: (): StoreWorker<T> => new StoreWorker<T>(initialState)
  };
};
