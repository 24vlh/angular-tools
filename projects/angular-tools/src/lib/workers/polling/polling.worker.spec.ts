import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { from, Subscription } from 'rxjs';
import { PollingWorker } from './polling.worker';

describe('PollingWorker', () => {
  let service: PollingWorker;
  let subscription: Subscription | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PollingWorker,
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
});
