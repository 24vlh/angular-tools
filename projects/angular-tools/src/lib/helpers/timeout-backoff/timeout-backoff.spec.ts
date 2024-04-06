import { TimeoutBackoff } from './timeout-backoff';

describe('TimeoutBackoff', (): void => {
  let retryCallback: jasmine.Spy;
  let errorCallback: jasmine.Spy;
  let timeoutBackoff: (reset?: boolean) => void;

  beforeEach(() => {
    jasmine.clock().install();
    retryCallback = jasmine.createSpy('retryCallback');
    errorCallback = jasmine.createSpy('errorCallback');
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should call retryCallback after initialDelay', (): void => {
    timeoutBackoff = TimeoutBackoff(retryCallback, errorCallback, 1, 10, 100);
    timeoutBackoff();
    jasmine.clock().tick(10);
    jasmine.clock().tick(10);
    expect(retryCallback).toHaveBeenCalledTimes(1);
  });

  it('should exponentially increase delay between retries', (): void => {
    timeoutBackoff = TimeoutBackoff(retryCallback, errorCallback, 2, 10, 100);
    timeoutBackoff();
    jasmine.clock().tick(10);
    timeoutBackoff();
    jasmine.clock().tick(20);
    jasmine.clock().tick(20);
    expect(retryCallback).toHaveBeenCalledTimes(2);
  });

  it('should not exceed maxDelay between retries', (): void => {
    timeoutBackoff = TimeoutBackoff(retryCallback, errorCallback, 3, 10, 100);
    timeoutBackoff();
    jasmine.clock().tick(10);
    timeoutBackoff();
    jasmine.clock().tick(20);
    timeoutBackoff();
    jasmine.clock().tick(40);
    timeoutBackoff();
    jasmine.clock().tick(80);
    expect(retryCallback).toHaveBeenCalledTimes(3);
  });

  it('should call errorCallback after maxRetries', (): void => {
    timeoutBackoff = TimeoutBackoff(retryCallback, errorCallback, 4, 10, 100);
    timeoutBackoff();
    jasmine.clock().tick(10);
    timeoutBackoff();
    jasmine.clock().tick(20);
    timeoutBackoff();
    jasmine.clock().tick(40);
    timeoutBackoff();
    jasmine.clock().tick(80);
    timeoutBackoff();
    jasmine.clock().tick(10);
    expect(errorCallback).toHaveBeenCalledTimes(1);
  });

  it('should reset retries when reset is true', (): void => {
    timeoutBackoff = TimeoutBackoff(retryCallback, errorCallback, 2, 10, 100);
    timeoutBackoff();
    jasmine.clock().tick(10);
    timeoutBackoff();
    jasmine.clock().tick(20);
    timeoutBackoff(true);
    jasmine.clock().tick(10);
    jasmine.clock().tick(10);
    expect(retryCallback).toHaveBeenCalledTimes(2);
  });
});
