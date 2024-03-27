import { StoreWorker } from './store.worker';
import { Get, GetIn, Select$, SelectIn$ } from './store.helper';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { STORE_PROVIDER_FACTORY } from './store.provider';

describe('Store Helper Functions', (): void => {
  let storeInstance: StoreWorker<Record<string, unknown>>;
  const defaultState: Record<string, unknown> = {
    key: 'value',
    nested: { key: 'nestedValue' }
  };
  let subscription: Subscription | null = null;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [STORE_PROVIDER_FACTORY(defaultState, StoreWorker)]
    });
    storeInstance = TestBed.inject(StoreWorker);
    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('Get should retrieve value for existing key', (): void => {
    const getValue = Get(storeInstance);
    expect(getValue('key')).toBe('value');
  });

  it('Get should return undefined for non-existing key', (): void => {
    const getValue = Get(storeInstance);
    expect(getValue('nonExistentKey')).toBeUndefined();
  });

  it('GetIn should retrieve value for existing key path', (): void => {
    const getValue = GetIn(storeInstance);
    expect(getValue(['nested', 'key'])).toBe('nestedValue');
  });

  it('GetIn should return undefined for non-existing key path', (): void => {
    const getValue = GetIn(storeInstance);
    expect(getValue(['nested', 'nonExistentKey'])).toBeUndefined();
  });

  it('Select$ should emit value for existing key', (done: DoneFn): void => {
    const select = Select$(storeInstance);
    subscription = select('key').subscribe((value): void => {
      expect(value).toBe('value');
      done();
    });
  });

  it('Select$ should emit undefined for non-existing key', (done: DoneFn): void => {
    const select = Select$(storeInstance);
    subscription = select('nonExistentKey').subscribe((value): void => {
      expect(value).toBeUndefined();
      done();
    });
  });

  it('SelectIn$ should emit value for existing key path', (done: DoneFn): void => {
    const selectIn = SelectIn$(storeInstance);
    subscription = selectIn(['nested', 'key']).subscribe((value): void => {
      expect(value).toBe('nestedValue');
      done();
    });
  });

  it('SelectIn$ should emit undefined for non-existing key path', (done: DoneFn): void => {
    const selectIn = SelectIn$(storeInstance);
    subscription = selectIn(['nested', 'nonExistentKey']).subscribe(
      (value): void => {
        expect(value).toBeUndefined();
        done();
      }
    );
  });
});
