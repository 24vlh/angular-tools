import { InjectionToken } from '@angular/core';

/**
 * `STORE_WORKER_INITIAL_STATE` is an injection token for the initial state of the store worker.
 * It is used to provide the initial state of the store worker.
 *
 * @type {InjectionToken<unknown>}
 * @example
 *  providers: [{ provide: STORE_WORKER_INITIAL_STATE, useValue: initialState }]
 *  // => Provides the initial state of the store worker.
 *  // => The initial state is used to initialize the store worker.
 */
export const STORE_WORKER_INITIAL_STATE: InjectionToken<unknown> =
  new InjectionToken<unknown>('STORE_WORKER_INITIAL_STATE');
