import { StoreWorker } from './store.worker';
import { Observable } from 'rxjs';
import { SelectOptions } from './store.interface';

/**
 * A generic function that retrieves a value from the store instance.
 * The value is retrieved based on the provided key.
 *
 * @template T - The type of the store instance, which extends a record of string keys to unknown values.
 * @template R - The type of the value to be retrieved from the store instance.
 * @template K - The type of the key to be used to retrieve the value from the store instance.
 * @param {StoreWorker<T>} storeInstance - The instance of the store to retrieve the value from.
 * @returns {(key: K) => R | undefined} - A function that takes a key and returns the value associated with that key, or undefined if the key does not exist.
 * @example
 *  const store = new StoreWorker({ key: 'value' });
 *  const getValue = Get(store);
 *  getValue('key');
 *  // => 'value'
 *  getValue('nonExistentKey');
 *  // => undefined
 */
export const Get =
  <T extends Record<string, unknown>, R, K extends keyof T>(
    storeInstance: StoreWorker<T>
  ): ((key: K) => R | undefined) =>
  <R, K extends keyof T>(key: K): R | undefined =>
    storeInstance.get(key);

/**
 * A generic function that retrieves a value from the store instance.
 * The value is retrieved based on the provided key path.
 *
 * @template T - The type of the store instance, which extends a record of string keys to unknown values.
 * @template R - The type of the value to be retrieved from the store instance.
 * @param {StoreWorker<T>} storeInstance - The instance of the store to retrieve the value from.
 * @returns {(searchKeyPath: string | (keyof T)[]) => R | undefined} - A function that takes a key path and returns the value associated with that key path, or undefined if the key path does not exist.
 * @example
 *  const store = new StoreWorker({ key: { nestedKey: 'value' } });
 *  const getValue = GetIn(store);
 *  getValue('key.nestedKey');
 *  // => 'value'
 *  getValue('nonExistentKey');
 *  // => undefined
 *  getValue('key.nonExistentNestedKey');
 *  // => undefined
 *  getValue(['key', 'nestedKey']);
 *  // => 'value'
 */
export const GetIn =
  <T extends Record<string, unknown>, R>(
    storeInstance: StoreWorker<T>
  ): ((
    searchKeyPath: string | (keyof T)[],
    notSetValue?: R | undefined
  ) => R | undefined) =>
  <R>(
    searchKeyPath: string | (keyof T)[],
    notSetValue: R | undefined = undefined
  ): R | undefined => {
    return storeInstance.getIn(searchKeyPath, notSetValue);
  };

/**
 * Returns a function that selects a value from the store as an observable, based on the provided key.
 * The observable emits the value whenever it changes.
 *
 * - If the value does not exist, the observable emits `undefined` or `notSetValue` if provided in options.
 * - If a `filterCallback` is provided in options, the value is only emitted if the callback returns `true`.
 * - If a `comparerCallback` is provided in options, the value is only emitted if the callback returns `true`.
 *
 * @template T The type of the store state.
 * @template R The type of the value to be retrieved.
 * @template K The type of the key.
 * @param storeInstance The store instance to retrieve the value from.
 * @returns A function that takes a key and an optional options object, and returns an observable of the value or `undefined`.
 * @example
 *  const store = new StoreWorker({ key: 'value' });
 *  const select = Select(store);
 *  select('key').subscribe(value => console.log(value)); // => 'value'
 *  select('nonExistentKey').subscribe(value => console.log(value)); // => undefined
 *  select('key', { filterCallback: v => v === 'value' }).subscribe(value => console.log(value)); // => 'value'
 *  select('key', { filterCallback: v => v === 'nonExistentValue' }).subscribe(value => console.log(value)); // => undefined
 *  select('key', { comparerCallback: (prev, curr) => prev === curr }).subscribe(value => console.log(value)); // => 'value'
 */
export const Select$ =
  <T extends Record<string, unknown>, R, K extends keyof T>(
    storeInstance: StoreWorker<T>
  ): ((key: K, options?: SelectOptions<R>) => Observable<R | undefined>) =>
  <R, K extends keyof T>(
    key: K,
    options?: SelectOptions<R>
  ): Observable<R | undefined> =>
    storeInstance.select$(key, options);

/**
 * Returns a function that selects a value from the store as an observable, based on the provided key path.
 * The observable emits the value whenever it changes.
 *
 * - If the value does not exist, the observable emits `undefined` or `notSetValue` if provided in options.
 * - If a `filterCallback` is provided in options, the value is only emitted if the callback returns `true`; otherwise, emits `notSetValue` or `undefined`.
 * - If a `comparerCallback` is provided in options, the value is only emitted if the callback returns `true`; otherwise, emits `notSetValue` or `undefined`.
 *
 * @template T The type of the store state.
 * @template R The type of the value to be retrieved.
 * @param storeInstance The store instance to retrieve the value from.
 * @returns A function that takes a key path and an optional options object, and returns an observable of the value or `undefined`.
 * @example
 *  const store = new StoreWorker({ key: { nestedKey: 'value' } });
 *  const selectIn = SelectIn$(store);
 *  selectIn('key.nestedKey').subscribe(value => console.log(value)); // => 'value'
 *  selectIn('nonExistentKey').subscribe(value => console.log(value)); // => undefined
 *  selectIn('key.nonExistentNestedKey').subscribe(value => console.log(value)); // => undefined
 *  selectIn(['key', 'nestedKey']).subscribe(value => console.log(value)); // => 'value'
 *  selectIn('key.nestedKey', { filterCallback: v => v === 'value' }).subscribe(value => console.log(value)); // => 'value'
 *  selectIn('key.nestedKey', { filterCallback: v => v === 'nonExistentValue' }).subscribe(value => console.log(value)); // => undefined
 *  selectIn('key.nestedKey', { comparerCallback: (prev, curr) => prev === curr }).subscribe(value => console.log(value)); // => 'value'
 */
export const SelectIn$ =
  <T extends Record<string, unknown>, R>(
    storeInstance: StoreWorker<T>
  ): ((
    searchKeyPath: string | (keyof T)[],
    options?: SelectOptions<R>
  ) => Observable<R | undefined>) =>
  <R>(
    searchKeyPath: string | (keyof T)[],
    options?: SelectOptions<R>
  ): Observable<R | undefined> =>
    storeInstance.selectIn$(searchKeyPath, options);
