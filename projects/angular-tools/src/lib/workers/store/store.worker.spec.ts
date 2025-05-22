import { TestBed } from '@angular/core/testing';
import { StoreWorker } from './store.worker';
import { Map, MapOf } from 'immutable';
import { of, Subscription } from 'rxjs';
import { STORE_PROVIDER_FACTORY } from './store.provider';

describe('StoreWorker', (): void => {
  let service: StoreWorker<Record<string, unknown>>;
  const defaultState: Record<string, unknown> = { key: 'value' };
  let subscription: Subscription | null = null;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [STORE_PROVIDER_FACTORY(defaultState, StoreWorker)]
    });
    service = TestBed.inject(StoreWorker);
    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should be created', (): void => {
    expect(service).toBeTruthy();
  });

  it('should throw error when initial state is not an object', (): void => {
    expect(
      () => new StoreWorker(null as unknown as Record<string, unknown>)
    ).toThrowError('[constructor] Invalid initial state. Object expected.');
  });

  it('should return current state', (): void => {
    expect(service.state).toEqual(defaultState);
  });

  it('should return current state as MapOf', (): void => {
    expect(service.map).toEqual(Map(defaultState));
  });

  it('should return current state as Observable MapOf', (done: DoneFn): void => {
    subscription = service.map$.subscribe(
      (map: MapOf<Record<string, unknown>>): void => {
        expect(map).toEqual(Map(defaultState));
        done();
      }
    );
  });

  it('should throw error when updating non-existing key', (): void => {
    expect(() => service.set('nonExistingKey', 'value')).toThrowError(
      '[set] Key nonExistingKey does not exist in the state.'
    );
  });

  it('should throw error when updating non-existing key path', (): void => {
    expect(() => service.setIn('nonExistingKeyPath', 'value')).toThrowError(
      '[setIn] Search key path nonExistingKeyPath does not exist in the state.'
    );
  });

  it('should return value for existing key', (): void => {
    const key = 'key';
    const value = 'value';
    service.set(key, value);
    expect(service.get(key)).toEqual(value);
  });

  it('should return undefined for non-existing key', (): void => {
    const key = 'nonExistingKey';
    expect(service.get(key)).toBeUndefined();
  });

  it('should return notSetValue for non-existing key when notSetValue is provided', (): void => {
    const key = 'nonExistingKey';
    const notSetValue = 'notSetValue';
    expect(service.get(key, notSetValue)).toEqual(notSetValue);
  });

  it('should return undefined for non-existing key path', (): void => {
    const keyPath: string[] = ['nonExistingKey1', 'nonExistingKey2'];
    expect(service.getIn(keyPath)).toBeUndefined();
  });

  it('should return notSetValue for non-existing key path when notSetValue is provided', (): void => {
    const keyPath: string[] = ['nonExistingKey1', 'nonExistingKey2'];
    const notSetValue = 'notSetValue';
    expect(service.getIn(keyPath, notSetValue)).toEqual(notSetValue);
  });

  it('should return value for existing key from data stream', (done: DoneFn): void => {
    const key = 'key';
    const value = 'value';
    service.set(key, value);
    subscription = service.select$(key).subscribe((val): void => {
      expect(val).toEqual(value);
      done();
    });
  });

  it('should return value for existing key from data stream with filterCallback', (done: DoneFn): void => {
    const key = 'key';
    const value = 'value';
    service.set(key, value);
    subscription = service
      .select$(key, { filterCallback: (): boolean => true })
      .subscribe((val): void => {
        expect(val).toEqual(value);
        done();
      });
  });

  it('should return value for existing key from data stream with comparerCallback', (done: DoneFn): void => {
    const key = 'key';
    const value = 'value';
    service.set(key, value);
    subscription = service
      .select$(key, { comparerCallback: (): boolean => false })
      .subscribe((val): void => {
        expect(val).toEqual(value);
        done();
      });
  });

  it('should return undefined for non-existing key from data stream', (done: DoneFn): void => {
    const key = 'nonExistingKey';
    subscription = service.select$(key).subscribe((val): void => {
      expect(val).toBeUndefined();
      done();
    });
  });

  it('should return notSetValue for non-existing key from data stream when notSetValue is provided', (done: DoneFn): void => {
    const key = 'nonExistingKey';
    const notSetValue = 'notSetValue';
    subscription = service
      .select$(key, { notSetValue })
      .subscribe((val: string | undefined): void => {
        expect(val).toEqual(notSetValue);
        done();
      });
  });

  it('should return value for existing key path from data stream', (done: DoneFn): void => {
    const keyPath: string[] = ['key'];
    const value = 'newValue';
    service.setIn(keyPath, value);
    subscription = service.selectIn$(keyPath).subscribe((val): void => {
      expect(val).toEqual(value);
      done();
    });
  });

  it('should return value for existing key path from data stream with filterCallback', (done: DoneFn): void => {
    const keyPath: string[] = ['key'];
    const value = 'newValue';
    service.setIn(keyPath, value);
    subscription = service
      .selectIn$(keyPath, { filterCallback: (): boolean => true })
      .subscribe((val): void => {
        expect(val).toEqual(value);
        done();
      });
  });

  it('should return value for existing key path from data stream with comparerCallback', (done: DoneFn): void => {
    const keyPath: string[] = ['key'];
    const value = 'newValue';
    service.setIn(keyPath, value);
    subscription = service
      .selectIn$(keyPath, { comparerCallback: (): boolean => true })
      .subscribe((val): void => {
        expect(val).toEqual(value);
        done();
      });
  });

  it('should return undefined for non-existing key path from data stream', (done: DoneFn): void => {
    const keyPath: string[] = ['nonExistingKey1', 'nonExistingKey2'];
    subscription = service.selectIn$(keyPath).subscribe((val): void => {
      expect(val).toBeUndefined();
      done();
    });
  });

  it('should return notSetValue for non-existing key path from data stream when notSetValue is provided', (done: DoneFn): void => {
    const keyPath: string[] = ['nonExistingKey1', 'nonExistingKey2'];
    const notSetValue = 'notSetValue';
    subscription = service
      .selectIn$(keyPath, { notSetValue })
      .subscribe((val: string | undefined): void => {
        expect(val).toEqual(notSetValue);
        done();
      });
  });

  it('should update value for existing key', (): void => {
    const key = 'key';
    const newValue = 'newValue';
    service.set(key, newValue);
    expect(service.get(key)).toEqual(newValue);
  });

  it('should update value for empty key', (): void => {
    const newValue = 'newValue';
    try {
      service.set('', newValue);
    } catch (e) {
      expect().nothing();
    }
  });

  it('should throw error when updating non-existing key', (): void => {
    const key = 'nonExistingKey';
    const value = 'value';
    expect(() => service.set(key, value)).toThrowError(
      `[set] Key ${key} does not exist in the state.`
    );
  });

  it('should update value for existing key path', (): void => {
    const keyPath: string[] = ['key'];
    const newValue = 'newValue';
    service.setIn(keyPath, newValue);
    expect(service.getIn(keyPath)).toEqual(newValue);
  });

  it('should update value for empty key path', (): void => {
    const newValue = 'newValue';
    try {
      service.setIn([], newValue);
    } catch (e) {
      expect().nothing();
    }
  });

  it('should throw error when updating non-existing key path', (): void => {
    const keyPath: string[] = ['nonExistingKey1', 'nonExistingKey2'];
    const value = 'value';
    expect(() => service.setIn(keyPath, value)).toThrowError(
      `[setIn] Search key path nonExistingKey1,nonExistingKey2 does not exist in the state.`
    );
  });

  it('should update value for existing key using _update$()', (done: DoneFn): void => {
    const key = 'key';
    const newValue = 'newValue';
    subscription = of(newValue)
      .pipe(service._update$(key))
      .subscribe((): void => {
        expect(service.get(key)).toEqual(newValue);
        done();
      });
  });

  it('should throw error when updating non-existing key using _update$()', (done: DoneFn): void => {
    const key = 'nonExistingKey';
    const value = 'value';
    subscription = of(value)
      .pipe(service._update$(key))
      .subscribe({
        error: (err: Error): void => {
          expect(err.message).toEqual(
            `[set] Key ${key} does not exist in the state.`
          );
          done();
        }
      });
  });

  it('should update value for existing key path using _updateIn$()', (done: DoneFn): void => {
    const keyPath = 'key';
    const newValue = 'newValue';
    subscription = of(newValue)
      .pipe(service._updateIn$(keyPath))
      .subscribe((): void => {
        expect(service.getIn(keyPath)).toEqual(newValue);
        done();
      });
  });

  it('should throw error when updating non-existing key path using _updateIn$()', (done: DoneFn): void => {
    const keyPath = 'nonExistingKey1.nonExistingKey2';
    const value = 'value';
    subscription = of(value)
      .pipe(service._updateIn$(keyPath))
      .subscribe({
        error: (err: Error): void => {
          expect(err.message).toEqual(
            `[setIn] Search key path nonExistingKey1,nonExistingKey2 does not exist in the state.`
          );
          done();
        }
      });
  });

  it('should reset to initial state', (): void => {
    const key = 'key';
    const newValue = 'newValue2';
    service.set(key, newValue);
    expect(service.state).toEqual({ key: 'newValue2' });
    service.reset();
    expect(service.state).toEqual(defaultState);
  });

  it('should reset to provided state with resetWithState()', (): void => {
    const key = 'key';
    const newValue = 'newValue2';
    const newState = { key: 'newStateValue' };
    service.set(key, newValue);
    expect(service.state).toEqual({ key: 'newValue2' });
    service.resetWithState(newState);
    expect(service.state).toEqual(newState);
  });
});
