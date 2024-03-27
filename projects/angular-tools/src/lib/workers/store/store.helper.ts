import { StoreWorker } from './store.worker';
import { Observable } from 'rxjs';

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
 * A generic function that retrieves a value from the store instance.
 * The value is retrieved based on the provided key.
 * The value is returned as an observable.
 * The observable emits the value associated with the key whenever the value changes.
 * If the value does not exist, the observable emits undefined.
 * If a filter callback is provided, the observable emits the value only if the filter callback returns true.
 * If a comparer callback is provided, the observable emits the value only if the comparer callback returns true.
 * If a notSetValue is provided, the observable emits the notSetValue if the value does not exist.
 * If a notSetValue is not provided, the observable emits undefined if the value does not exist.
 * If a notSetValue is provided, the observable emits the notSetValue if the filter callback returns false.
 * If a notSetValue is not provided, the observable emits undefined if the filter callback returns false.
 * If a notSetValue is provided, the observable emits the notSetValue if the comparer callback returns false.
 *
 * @template T - The type of the store instance, which extends a record of string keys to unknown values.
 * @template R - The type of the value to be retrieved from the store instance.
 * @template K - The type of the key to be used to retrieve the value from the store instance.
 * @param {StoreWorker<T>} storeInstance - The instance of the store to retrieve the value from.
 * @returns {(key: K, filterCallback?: (data: R) => boolean, comparerCallback?: (prev: R, curr: R) => boolean, notSetValue?: R | undefined) => Observable<R | undefined>} - A function that takes a key, an optional filter callback, an optional comparer callback, and an optional notSetValue, and returns an observable that emits the value associated with the key whenever the value changes, or undefined if the value does not exist.
 * @example
 *  const store = new StoreWorker({ key: 'value' });
 *  const select = Select(store);
 *  select('key').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => 'value'
 *  });
 *  select('nonExistentKey').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => undefined
 *  });
 *  select('key', (value: string) => value === 'value').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => 'value'
 *  });
 *  select('key', (value: string) => value === 'nonExistentValue').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => undefined
 *  });
 *  select('key', undefined, (prev: string, curr: string) => prev === curr).subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => 'value'
 *  });
 */
export const Select$ =
  <T extends Record<string, unknown>, R, K extends keyof T>(
    storeInstance: StoreWorker<T>
  ): ((
    key: K,
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue?: R | undefined
  ) => Observable<R | undefined>) =>
  <R, K extends keyof T>(
    key: K,
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue: R | undefined = undefined
  ): Observable<R | undefined> =>
    storeInstance.select$(key, filterCallback, comparerCallback, notSetValue);

/**
 * A generic function that retrieves a value from the store instance.
 * The value is retrieved based on the provided key path.
 * The value is returned as an observable.
 * The observable emits the value associated with the key path whenever the value changes.
 * If the value does not exist, the observable emits undefined.
 * If a filter callback is provided, the observable emits the value only if the filter callback returns true.
 * If a comparer callback is provided, the observable emits the value only if the comparer callback returns true.
 * If a notSetValue is provided, the observable emits the notSetValue if the value does not exist.
 * If a notSetValue is not provided, the observable emits undefined if the value does not exist.
 * If a notSetValue is provided, the observable emits the notSetValue if the filter callback returns false.
 * If a notSetValue is not provided, the observable emits undefined if the filter callback returns false.
 * If a notSetValue is provided, the observable emits the notSetValue if the comparer callback returns false.
 *
 * @template T - The type of the store instance, which extends a record of string keys to unknown values.
 * @template R - The type of the value to be retrieved from the store instance.
 * @param {StoreWorker<T>} storeInstance - The instance of the store to retrieve the value from.
 * @returns {(searchKeyPath: string | (keyof T)[], filterCallback?: (data: R) => boolean, comparerCallback?: (prev: R, curr: R) => boolean, notSetValue?: R | undefined) => Observable<R | undefined>} - A function that takes a key path, an optional filter callback, an optional comparer callback, and an optional notSetValue, and returns an observable that emits the value associated with the key path whenever the value changes, or undefined if the value does not exist.
 * @example
 *  const store = new StoreWorker({ key: { nestedKey: 'value' } });
 *  const selectIn = SelectIn(store);
 *  selectIn('key.nestedKey').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => 'value'
 *  });
 *  selectIn('nonExistentKey').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => undefined
 *  });
 *  selectIn('key.nonExistentNestedKey').subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => undefined
 *  });
 *  selectIn(['key', 'nestedKey']).subscribe((value: string | undefined) => {
 *   console.log(value);
 *   // => 'value'
 *  });
 */
export const SelectIn$ =
  <T extends Record<string, unknown>, R>(
    storeInstance: StoreWorker<T>
  ): ((
    searchKeyPath: string | (keyof T)[],
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue?: R | undefined
  ) => Observable<R | undefined>) =>
  <R>(
    searchKeyPath: string | (keyof T)[],
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue: R | undefined = undefined
  ): Observable<R | undefined> =>
    storeInstance.selectIn$(
      searchKeyPath,
      filterCallback,
      comparerCallback,
      notSetValue
    );
