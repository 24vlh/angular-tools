import {
  BootstrapPollingSession,
  PollFactory,
  StartPolling
} from './polling.helper';
import { from, Observable, of, Subscription, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PollingConfigs, PollingManager } from './polling.type';

describe('Polling Helper', (): void => {
  let httpGetCall: Observable<string>;
  let configs: Omit<PollingConfigs<string>, 'httpOptions'>;
  let subscription: Subscription | null = null;

  beforeEach((): void => {
    httpGetCall = of('test').pipe(delay(50));
    configs = {
      comparerCallback: jasmine
        .createSpy('comparerCallback')
        .and.returnValue(
          (prev: string, curr: string): boolean => prev === curr
        ),
      callback: jasmine.createSpy('callback').and.callThrough()
    };
    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  describe('StartPolling I', (): void => {
    it('should poll at correct intervals', (done: DoneFn): void => {
      jasmine.clock().install();
      const interval = 100;
      let emissions = 0;

      httpGetCall = from(['test1', 'test2', 'test3']).pipe(delay(interval));
      subscription = StartPolling(httpGetCall, interval).subscribe(
        (value: string): void => {
          emissions++;
          if (emissions === 3) {
            expect(value).toBe('test3');
            done();
          }
        }
      );

      jasmine.clock().tick(interval * 3);
      jasmine.clock().uninstall();
    });
  });

  describe('StartPolling II', (): void => {
    it('should use default configs', (done: DoneFn): void => {
      httpGetCall = from(['test1', 'test2']).pipe(delay(50));
      let emissions = 0;
      subscription = StartPolling(httpGetCall, 50).subscribe(
        (value: string): void => {
          if (++emissions === 2) {
            expect(value).toBe('test2');
            done();
          }
        }
      );
    });

    it('should use provided comparer when comparerCallback is defined and a function', (done: DoneFn): void => {
      httpGetCall = from(['test1', 'test2']).pipe(delay(50));
      subscription = StartPolling(httpGetCall, 50, configs)
        .pipe(delay(50))
        .subscribe((value: string): void => {
          expect(configs.comparerCallback).toHaveBeenCalled();
          expect(value).toBe('test1');
          done();
        });
    });

    it('should use default comparer when comparerCallback is undefined', (done: DoneFn): void => {
      configs.comparerCallback = undefined;
      subscription = StartPolling(httpGetCall, 50, configs).subscribe(
        (value: string): void => {
          expect(value).toBe('test');
          done();
        }
      );
    });

    it('should use filterCallback when it is defined and a function', (done: DoneFn): void => {
      configs.filterCallback = jasmine
        .createSpy('filterCallback')
        .and.returnValue((data: string): boolean => data === 'test');
      subscription = StartPolling(httpGetCall, 50, configs)
        .pipe(delay(50))
        .subscribe((value: string): void => {
          expect(configs.filterCallback).toHaveBeenCalled();
          expect(value).toBe('test');
          done();
        });
    });

    it('should return true when filterCallback is undefined', (done: DoneFn): void => {
      configs.filterCallback = undefined;
      subscription = StartPolling(httpGetCall, 50, configs).subscribe(
        (value: string): void => {
          expect(value).toBe('test');
          done();
        }
      );
    });

    it('should call the callback with the emitted value', (done: DoneFn): void => {
      subscription = StartPolling(httpGetCall, 50, configs)
        .pipe(delay(50))
        .subscribe((): void => {
          expect(configs.callback).toHaveBeenCalledWith('test');
          done();
        });
    });

    it('should emit values at regular intervals', (done: DoneFn): void => {
      configs.comparerCallback = (): boolean => false;
      let emissions = 0;
      subscription = StartPolling(httpGetCall, 100, configs).subscribe(
        (value: string): void => {
          ++emissions;
          expect(value).toEqual('test');
          if (emissions > 3) {
            fail('Should not emit duplicate consecutive values');
          }
          if (emissions === 2) {
            done();
          }
        }
      );
    });

    it('should not emit duplicate values', (done: DoneFn): void => {
      let emissions = 0;
      subscription = StartPolling(
        httpGetCall.pipe(
          tap((): void => {
            ++emissions;
            if (emissions > 1) {
              done();
            }
          })
        ),
        150,
        configs
      ).subscribe((value: string): void => {
        expect(value).toEqual('test');
        if (emissions > 1) {
          fail('Should not emit duplicate consecutive values');
        }
      });
    });
  });

  describe('PollFactory', (): void => {
    it('should return a function that starts polling', (done: DoneFn): void => {
      const poll = PollFactory(50, configs);
      subscription = poll(httpGetCall).subscribe((value: string): void => {
        expect(value).toEqual('test');
        done();
      });
    });

    it('should return a function that starts polling with correct interval and configs', (done: DoneFn): void => {
      const poll = PollFactory(50, configs);
      subscription = poll(httpGetCall).subscribe((value: string): void => {
        expect(value).toEqual('test');
        done();
      });
    });
  });

  describe('BootstrapPollingSession', (): void => {
    it('should stop the polling when stop is called', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      pollingManager.stop();
      expect(pollingManager.pollingSubscription.closed).toBeTrue();
      done();
    });

    it('should not stop the polling if it is already stopped', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      pollingManager.stop();
      // todo : check if the subscription is closed with a spy
      pollingManager.stop();
      expect(pollingManager.pollingSubscription.closed).toBeTrue();
      done();
    });

    it('should resume the polling when resume is called after stop', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      pollingManager.stop();
      pollingManager.resume();
      expect(pollingManager.pollingSubscription.closed).toBeFalse();
      done();
    });

    it('should not resume the polling if it is already active', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      // todo : check if the subscription is not closed with a spy
      pollingManager.resume();
      expect(pollingManager.pollingSubscription.closed).toBeFalse();
      done();
    });

    it('should restart the polling when restart is called after stop', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      // todo : check if the subscription is not closed with a spy
      pollingManager.restart();
      expect(pollingManager.pollingSubscription.closed).toBeFalse();
      done();
    });

    it('should return the correct observable when pollingObservable$ is called', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      pollingManager.stop();
      subscription = pollingManager.pollingSubscription;
      pollingManager.pollingObservable$
        .pipe(
          tap((value: string): void => {
            expect(value).toEqual('test');
            done();
          })
        )
        .subscribe();
    });

    it('should return a polling manager with a subscription', (done: DoneFn): void => {
      const pollingManager: PollingManager<string> = BootstrapPollingSession(
        httpGetCall,
        50,
        configs
      );
      subscription = pollingManager.pollingSubscription;
      expect(pollingManager.pollingSubscription).toBeDefined();
      done();
    });
  });
});
