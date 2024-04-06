import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { from, Subscription } from 'rxjs';
import { PollingWorker } from './polling.worker';
import { POLLING_WORKER_PROVIDER_FACTORY } from './polling.provider';

describe('PollingWorker', () => {
  let service: PollingWorker;
  let subscription: Subscription | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        POLLING_WORKER_PROVIDER_FACTORY(PollingWorker),
        {
          provide: HttpClient,
          useValue: {
            get: () => from(['test1', 'test2', 'test3'])
          }
        }
      ]
    });

    service = TestBed.inject(PollingWorker);
  });

  it('should be created', (): void => {
    expect(service).toBeTruthy();
  });

  it('should perform polling and return data', (done: DoneFn): void => {
    jasmine.clock().install();
    const url = 'https://api.example.com/data';
    let emissions = 0;

    subscription = service.poll$(url, 50).subscribe((data): void => {
      ++emissions;
      expect(data).toBe(`test${emissions}`);
      if (emissions === 3 && subscription) {
        expect(data).toBe('test3');
        subscription.unsubscribe();
        done();
      }
    });

    jasmine.clock().tick(50);
    jasmine.clock().tick(50);
    jasmine.clock().uninstall();
    expect(emissions).toBe(3);
  });

  it('should bootstrap a polling session and return a PollingManager', (done: DoneFn): void => {
    jasmine.clock().install();
    const url = 'https://api.example.com/data';
    let emissions = 0;

    const pollingManager = service.bootstrapSession(url, 50, {
      callback: (data): void => {
        ++emissions;
        expect(data).toBe(`test${emissions}`);
        if (emissions === 3) {
          expect(data).toBe('test3');
          pollingManager.stop();
          done();
        }
      }
    });

    jasmine.clock().tick(50);
    jasmine.clock().tick(50);
    jasmine.clock().uninstall();
    expect(emissions).toBe(3);
  });
});
