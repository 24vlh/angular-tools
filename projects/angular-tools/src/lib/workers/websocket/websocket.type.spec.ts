import { WebsocketExponentialBackoffOptions } from './websocket.type';

describe('WebsocketExponentialBackoffOptions', () => {
  it('should have default values when not provided', () => {
    const options: WebsocketExponentialBackoffOptions = {};
    expect(options.maxRetryAttempts).toBeUndefined();
    expect(options.initialDelay).toBeUndefined();
    expect(options.maxDelay).toBeUndefined();
    expect(options.disableAndUseConstantDelayOf).toBeUndefined();
  });

  it('should hold the provided values', () => {
    const options: WebsocketExponentialBackoffOptions = {
      maxRetryAttempts: 5,
      initialDelay: 2000,
      maxDelay: 40000,
      disableAndUseConstantDelayOf: 5000
    };
    expect(options.maxRetryAttempts).toBe(5);
    expect(options.initialDelay).toBe(2000);
    expect(options.maxDelay).toBe(40000);
    expect(options.disableAndUseConstantDelayOf).toBe(5000);
  });
});
