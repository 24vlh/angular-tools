import { FactoryProvider, InjectionToken } from '@angular/core';
import { StoreWorker } from './store.worker';
import { STORE_PROVIDER_FACTORY } from './store.provider';

interface TestDataMockType extends Record<string, unknown> {
  key: string;
}

describe('Store Providers', (): void => {
  let storeWorkerToken: InjectionToken<StoreWorker<TestDataMockType>>;
  let initialState: TestDataMockType;

  beforeEach((): void => {
    storeWorkerToken = new InjectionToken<StoreWorker<TestDataMockType>>(
      'storeWorkerToken'
    );
    initialState = { key: 'value' };
  });

  it('should provide StoreWorker with correct initial state', (): void => {
    const storeWorkerProvider: FactoryProvider =
      STORE_PROVIDER_FACTORY<TestDataMockType>(
        initialState,
        storeWorkerToken
      );
    expect(storeWorkerProvider).toBeDefined();
    expect(storeWorkerProvider.useFactory(initialState)).toBeInstanceOf(
      StoreWorker
    );
  });
});
