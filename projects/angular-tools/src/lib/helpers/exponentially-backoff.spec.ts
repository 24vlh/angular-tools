import { map, Observable, of, Subscription } from 'rxjs';
import { ExponentiallyBackoff } from './exponentially-backoff';

describe('ExponentiallyBackoff', (): void => {
  let subscription: Subscription | null = null;

  beforeAll(function (): void {
    subscription = null;
  });

  afterAll(function (): void {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should use defaults', (done: DoneFn): void => {
    let attempts = 0;
    const source: Observable<string> = of('success').pipe(
      map((): string => {
        if (++attempts < 2) {
          throw 'error';
        } else {
          return 'success';
        }
      }),
      ExponentiallyBackoff()
    );

    subscription = source.subscribe((value: string): void => {
      expect(value).toBe('success');
      done();
    });
  });

  it('should retry the maximum number of times', (done: DoneFn): void => {
    let attempts = 0;
    const source: Observable<string> = of('success').pipe(
      map((): string => {
        if (++attempts < 4) {
          throw 'error';
        } else {
          return 'success';
        }
      }),
      ExponentiallyBackoff(3, 5)
    );

    subscription = source.subscribe((value: string): void => {
      expect(value).toBe('success');
      done();
    });
  });

  it('should use the initial delay for the first retry', (done: DoneFn): void => {
    let attempts = 0;
    const startTime: number = Date.now();
    const source: Observable<string> = of('success').pipe(
      map((): string => {
        if (++attempts < 3) {
          throw 'error';
        } else {
          return 'success';
        }
      }),
      ExponentiallyBackoff(2, 5)
    );

    subscription = source.subscribe((value: string): void => {
      expect(value).toBe('success');
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(5);
      done();
    });
  });

  it('should not exceed the maximum delay between retries', (done: DoneFn): void => {
    let attempts = 0;
    const startTime = Date.now();
    const source: Observable<string> = of('success').pipe(
      map((): string => {
        if (++attempts < 4) {
          throw 'error';
        } else {
          return 'success';
        }
      }),
      ExponentiallyBackoff(3, 5, 2 * 5)
    );

    subscription = source.subscribe((value: string): void => {
      expect(value).toBe('success');
      expect(Date.now() - startTime).toBeLessThanOrEqual(3 * 2 * 5 + 5);
      done();
    });
  });

  it('should use constant delay if provided', (done: DoneFn): void => {
    let attempts = 0;
    const startTime = Date.now();
    const source: Observable<string> = of('success').pipe(
      map((): string => {
        if (++attempts < 4) {
          throw 'error';
        } else {
          return 'success';
        }
      }),
      ExponentiallyBackoff(3, 5, 2 * 5, 2 * 5)
    );

    subscription = source.subscribe((value: string): void => {
      expect(value).toBe('success');
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(4 * 5);
      done();
    });
  });
});
