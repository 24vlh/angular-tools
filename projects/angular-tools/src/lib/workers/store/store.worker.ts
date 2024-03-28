import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  tap
} from 'rxjs';
import {
  EmptyArray,
  EmptyString,
  OfArrayType,
  OfFunctionType,
  OfObjectType,
  OfStringType
} from '@24vlh/ts-assert';
import { Map, MapOf } from 'immutable';
import { Inject } from '@angular/core';
import { STORE_WORKER_INITIAL_STATE } from './store.injection-token';

/**
 * Represents a class that manages the state of a store.
 *
 * @template T - The type of the state.
 */
export class StoreWorker<T extends Record<string, unknown>> {
  private readonly data$: Observable<T>;
  private state$: BehaviorSubject<T>;

  /**
   * Constructor for creating an instance of the class.
   *
   * @template T - The type of the state object.
   * @param initialState - The initial state of the instance.
   * @throws Error - If the initial state is not an object.
   */
  public constructor(
    @Inject(STORE_WORKER_INITIAL_STATE) private initialState: T
  ) {
    if (!OfObjectType(initialState)) {
      throw new Error('Invalid initial state. Object expected.');
    }

    this.state$ = new BehaviorSubject<T>(initialState);
    this.data$ = this.state$.asObservable().pipe(distinctUntilChanged());
  }

  /**
   * Retrieves the current state.
   *
   * @template T - The type of the state object.
   * @return {T} The current state object.
   * @throws Error - If the state is not an object.
   * @example
   *  const state: T = store.state;
   */
  public get state(): T {
    return this.map.toObject() as T;
  }

  /**
   * Maps the current state to an instance of MapOf<T>.
   *
   * @template T - The type of the state object.
   * @returns {MapOf<T>} - The current state mapped to an instance of MapOf<T>.
   * @example
   *  const mappedState: MapOf<T> = store.map;
   */
  public get map(): MapOf<T> {
    return Map(this.state$.getValue());
  }

  /**
   * Maps the current state of type T to a new instance of MapOf<T> and returns it as an Observable.
   *
   * @template T - The type of the state object.
   * @return {Observable<MapOf<T>>} - An Observable that emits a new instance of MapOf<T> mapped from the current state.
   * @example
   *  const map$: Observable<MapOf<T>> = store.map$;
   *  map$.subscribe(console.log);
   *  map$.pipe(map((map: MapOf<T>) => map.toObject())).subscribe(console.log);
   *  map$.pipe(map((map: MapOf<T>) => map.toObject())).subscribe((state: T) => console.log(state));
   */
  public get map$(): Observable<MapOf<T>> {
    return this.data$.pipe(map((state: T) => Map(state)));
  }

  /**
   * Retrieves the value corresponding to the given key from the state.
   * If the key does not exist in the state, it will return the optional `notSetValue`.
   *
   * @template R - The type of the value to retrieve
   * @template K - The type of the key
   * @param {K} key - The key to retrieve the value for
   * @param {R | undefined} [notSetValue=undefined] - Optional value
   * to return if the key does not exist in the state
   * @returns {R | undefined} The value associated with the key,
   * or the optional `notSetValue` if the key does not exist in the state
   * @throws Error if the key is an empty string
   * @throws Error if the key does not exist in the state
   * @example
   *  const value: R | undefined = store.get(key);
   *  const value: R | undefined = store.get(key, notSetValue);
   *  const value: R | undefined = store.get(key, undefined);
   *  const value: R | undefined = store.get(key, null);
   *  const value: R | undefined = store.get(key, 0);
   *  const value: R | undefined = store.get(key, ``);
   *  const value: R | undefined = store.get(key, {});
   *  const value: R | undefined = store.get(key, []);
   *  const value: R | undefined = store.get(key, false);
   *  const value: R | undefined = store.get(key, true);
   *  const value: R | undefined = store.get(key, new Date());
   */
  public get<R, K extends keyof T>(
    key: K,
    notSetValue: R | undefined = undefined
  ): R | undefined {
    if (!this.map.has(key)) {
      console.error(`Key ${String(key)} does not exist in the state.`);
    }
    return this.map.get<R | undefined>(key, notSetValue);
  }

  /**
   * Retrieves the value at the specified search key path from the state.
   * If the search key path does not exist in the state, it will return the optional `notSetValue`.
   *
   * @template T - The type of the state object.
   * @template R - The type of the value to retrieve.
   * @param {string | (keyof T)[]} searchKeyPath - The path of the property to search for.
   * An array or a string separated by periods (e.g., 'property1.3.property2').
   * @param {R | undefined} [notSetValue=undefined] - The value to return
   * if the search key path does not exist. Defaults to undefined.
   * @returns {R | undefined} The value at the search key path,
   * or the optional `notSetValue` if the path does not exist in the state.
   * @throws {Error} - If the search key path is an empty string.
   * @throws {Error} - If the search key path does not exist in the state.
   * @example
   *  const value: R | undefined = store.getIn('property1.3.property2');
   *  const value: R | undefined = store.getIn('property1.3.property2', notSetValue);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], undefined);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], null);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], 0);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], ``);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], {});
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], []);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], false);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], true);
   *  const value: R | undefined = store.getIn(['property1', 3, 'property2'], new Date());
   */
  public getIn<R>(
    searchKeyPath: string | (keyof T)[],
    notSetValue: R | undefined = undefined
  ): R | undefined {
    searchKeyPath = this.PrepSearchKeyPath(searchKeyPath);

    if (!this.map.hasIn(searchKeyPath)) {
      console.error(
        `Search key path ${String(searchKeyPath)} does not exist in the state.`
      );
    }

    return this.map.getIn(searchKeyPath, notSetValue);
  }

  /**
   * Retrieves the value corresponding to the given key from the data stream.
   * If the key does not exist in the state, it will return the optional `notSetValue`.
   *
   * @template R - The type of the value to retrieve.
   * @template K - The type of the key.
   * @param {K} key - The key to retrieve the value for.
   * @param {(data: R) => boolean} [filterCallback] - Optional callback function to filter the data stream.
   * @param {(prev: R, curr: R) => boolean} [comparerCallback] - Optional callback function to compare the previous and current values.
   * @param {R | undefined} [notSetValue=undefined] - Optional value
   * to return if the key does not exist in the state.
   * @returns {Observable<R | undefined>} - An Observable that emits the value associated with the key,
   * or the optional `notSetValue` if the key does not exist in the state.
   * @example
   *  const value$: Observable<R | undefined> = store.select$(key).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, notSetValue).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, undefined).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, null).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, 0).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, ``).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, {}).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, []).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, false).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, true).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.select$(key, new Date()).subscribe(console.log);
   */
  public select$<R, K extends keyof T>(
    key: K,
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue: R | undefined = undefined
  ): Observable<R | undefined> {
    return this.map$.pipe(
      map((mappedState: MapOf<T>) => {
        if (!mappedState.has(key)) {
          console.error(`Key ${String(key)} does not exist in the state.`);
        }

        return mappedState.get<R | undefined>(key, notSetValue);
      }),
      filter(
        OfFunctionType<() => boolean>(filterCallback)
          ? filterCallback
          : (): boolean => true
      ),
      distinctUntilChanged<R | undefined>(
        OfFunctionType<(prev: R | undefined, curr: R | undefined) => boolean>(
          comparerCallback
        )
          ? comparerCallback
          : (prev: R | undefined, curr: R | undefined): boolean =>
              JSON.stringify(prev) === JSON.stringify(curr)
      )
    );
  }

  /**
   * Retrieves the value at the specified search key path from the data stream.
   * If the search key path does not exist in the state, it will return the optional `notSetValue`.
   *
   * @template T - The type of the state object.
   * @template R - The type of the value to retrieve.
   * @param {string | (keyof T)[]} searchKeyPath - The path of the property to search for.
   * An array or a string separated by periods (e.g., 'property1.3.property2').
   * @param {(data: R) => boolean} [filterCallback] - Optional callback function to filter the data stream.
   * @param {(prev: R, curr: R) => boolean} [comparerCallback] - Optional callback function to compare the previous and current values.
   * @param {R | undefined} [notSetValue=undefined] - The value to return
   * if the search key path does not exist. Defaults to undefined.
   * @returns {Observable<R | undefined>} - An Observable that emits the value at the search key path,
   * or the optional `notSetValue` if the path does not exist in the state.
   * @example
   *  const value$: Observable<R | undefined> = store.selectIn$('property1.3.property2').subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$('property1.3.property2', notSetValue).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], undefined).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], null).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], 0).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], ``).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], {}).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], []).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], false).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], true).subscribe(console.log);
   *  const value$: Observable<R | undefined> = store.selectIn$(['property1', 3, 'property2'], new Date()).subscribe(console.log);
   */
  public selectIn$<R>(
    searchKeyPath: string | (keyof T)[],
    filterCallback?: (data: R) => boolean,
    comparerCallback?: (prev: R, curr: R) => boolean,
    notSetValue: R | undefined = undefined
  ): Observable<R | undefined> {
    return this.map$.pipe(
      map((mappedState: MapOf<T>) => {
        searchKeyPath = this.PrepSearchKeyPath(searchKeyPath);

        if (!mappedState.hasIn(searchKeyPath)) {
          console.error(
            `Search key path ${String(searchKeyPath)} does not exist in the state.`
          );
        }

        return mappedState.getIn(searchKeyPath, notSetValue);
      }),
      filter(
        OfFunctionType<() => boolean>(filterCallback)
          ? filterCallback
          : (): boolean => true
      ),
      distinctUntilChanged<R | undefined>(
        OfFunctionType<(prev: R | undefined, curr: R | undefined) => boolean>(
          comparerCallback
        )
          ? comparerCallback
          : (prev: R | undefined, curr: R | undefined): boolean =>
              JSON.stringify(prev) === JSON.stringify(curr)
      )
    );
  }

  /**
   * Updates the value of the given key in the state.
   *
   * @template T - The type of the state object.
   * @template K - The type of the key.
   * @param {K} key - The key to update the value for.
   * @param {T[K]} value - The new value to set for the key.
   * @throws Error if the key is an empty string.
   * @throws Error if the key does not exist in the state.
   * @returns {void}
   * @example
   *  store.set('property1', value);
   */
  public set<K extends keyof T>(key: K, value: T[K]): void {
    if (EmptyString(key)) {
      throw new Error('Invalid key. Non-empty string expected.');
    }

    if (!this.map.has(key)) {
      throw new Error(`Key ${String(key)} does not exist in the state.`);
    }

    this.state$.next(this.map.set(key, value).toObject() as T);
  }

  /**
   * Updates the value at the specified search key path in the state.
   *
   * @param {string | (keyof T)[]} searchKeyPath - The path of the property to update.
   * An array or a string separated by periods (e.g., 'property1.3.property2').
   * @param {unknown} value - The new value to set at the search key path.
   * @throws {Error} - If the search key path is an empty string or an empty array.
   * @throws {Error} - If the search key path does not exist in the state.
   * @returns {void}
   * @example
   *  store.setIn('property1.3.property2', value);
   *  store.setIn(['property1', 3, 'property2'], value);
   */
  public setIn(searchKeyPath: string | (keyof T)[], value: unknown): void {
    searchKeyPath = this.PrepSearchKeyPath(searchKeyPath);

    if (EmptyArray(searchKeyPath)) {
      throw new Error(
        'Invalid search key path. Non-empty array or string expected.'
      );
    }

    if (!this.map.hasIn(searchKeyPath)) {
      throw new Error(
        `Search key path ${String(searchKeyPath)} does not exist in the state.`
      );
    }

    this.state$.next(this.map.setIn(searchKeyPath, value).toObject() as T);
  }

  /**
   * Applies a tap operation to update a specific key of an object.
   * Returns a MonoTypeOperatorFunction.
   *
   * @template T - The type of the state object.
   * @template K - The type of the key.
   * @param {K} key - The key to update the value for.
   * @returns {MonoTypeOperatorFunction<T[K]>} - The operator function that performs the tap update operation.
   * @example
   *  const update$: MonoTypeOperatorFunction<T[K]> = store._update$('property1');
   *  const update$: MonoTypeOperatorFunction<T[K]> = store._update$('property1').subscribe(console.log);
   *  const update$: MonoTypeOperatorFunction<T[K]> = store._update$('property1').pipe(map((data: T[K]) => data)).subscribe(console.log);
   *  this.http.get('url').pipe(map((data: T) => data), update$).subscribe();
   */
  public _update$<K extends keyof T>(key: K): MonoTypeOperatorFunction<T[K]> {
    return tap((data: T[K]): void => {
      this.set(key, data);
    });
  }

  /**
   * Applies a tap operation to update a specific key path of an object.
   * Returns a MonoTypeOperatorFunction.
   *
   * @template R - The type of the value to update.
   * @param {string} searchKeyPath - The key path to update the value for.
   * @returns {MonoTypeOperatorFunction<R>} - The operator function that performs the tap update operation.
   * @throws {Error} - If the search key path is an empty string or an empty array.
   * @throws {Error} - If the search key path does not exist in the state.
   * @example
   *  const updateIn$: MonoTypeOperatorFunction<R> = store._updateIn$('property1.3.property2');
   *  const updateIn$: MonoTypeOperatorFunction<R> = store._updateIn$(['property1', 3, 'property2']);
   *  this.http.get('url').pipe(map((data: R) => data), updateIn$).subscribe();
   */
  public _updateIn$<R>(searchKeyPath: string): MonoTypeOperatorFunction<R> {
    return tap((data: R): void => {
      this.setIn(searchKeyPath, data);
    });
  }

  /**
   * Resets the store to its initial state.
   *
   * @returns {void}
   * @example
   *  store.reset();
   */
  public reset(): void {
    this.state$.next(this.initialState);
  }

  /**
   * Resets the store to the specified state.
   *
   * @param {T} state - The state to reset the store to.
   * @returns {void}
   * @example
   *  store.resetWithState(state);
   */
  public resetWithState(state: T): void {
    this.state$.next(state);
  }

  /**
   * Prepares the search key path for the getIn and updateIn methods.
   * If the search key path is a string, it splits the string into an array of keys.
   * If the search key path is not an array, it sets the search key path to an empty array.
   *
   * @private
   * @param {string | (keyof T)[]} searchKeyPath - The path of the property to search for.
   * An array or a string separated by periods (e.g., 'property1.3.property2').
   * @returns {(keyof T)[]} - The prepared search key path as an array of keys.
   * @example
   *  const searchKeyPath: (keyof T)[] = this.PrepSearchKeyPath('property1.3.property2');
   *  const searchKeyPath: (keyof T)[] = this.PrepSearchKeyPath(['property1', 3, 'property2']);
   *  const searchKeyPath: (keyof T)[] = this.PrepSearchKeyPath([]);
   *  const searchKeyPath: (keyof T)[] = this.PrepSearchKeyPath('');
   *  const searchKeyPath: (keyof T)[] = this.PrepSearchKeyPath({});
   */
  private PrepSearchKeyPath(searchKeyPath: string | (keyof T)[]): (keyof T)[] {
    return OfStringType(searchKeyPath)
      ? searchKeyPath.split('.')
      : !OfArrayType(searchKeyPath)
        ? []
        : searchKeyPath;
  }
}
