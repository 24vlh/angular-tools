import { InjectionToken } from '@angular/core';
import { STORE_WORKER_INITIAL_STATE } from './store.injection-token';

describe('Store Injection Token', (): void => {
  it('should create an instance', (): void => {
    expect(STORE_WORKER_INITIAL_STATE).toBeInstanceOf(InjectionToken);
  });

  it('should have correct token name', (): void => {
    expect(STORE_WORKER_INITIAL_STATE.toString()).toBe(
      'InjectionToken STORE_WORKER_INITIAL_STATE'
    );
  });

  it('should not be null', (): void => {
    expect(STORE_WORKER_INITIAL_STATE).not.toBeNull();
  });

  it('should not be undefined', (): void => {
    expect(STORE_WORKER_INITIAL_STATE).not.toBeUndefined();
  });
});
