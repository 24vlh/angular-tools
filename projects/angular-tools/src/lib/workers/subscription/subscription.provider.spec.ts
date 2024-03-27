import { TestBed } from '@angular/core/testing';
import { SubscriptionWorker } from './subscription.worker';
import { SUBSCRIPTION_WORKER_PROVIDER } from './subscription.provider';

describe('SubscriptionProvider', (): void => {
  it('should provide an instance of SubscriptionWorker', (): void => {
    TestBed.configureTestingModule({
      providers: [SUBSCRIPTION_WORKER_PROVIDER]
    });

    expect(TestBed.inject(SubscriptionWorker)).toBeInstanceOf(
      SubscriptionWorker
    );
  });

  it('should provide a new instance of SubscriptionWorker for each injection', (): void => {
    TestBed.configureTestingModule({
      providers: [SUBSCRIPTION_WORKER_PROVIDER]
    });
    const subscriptionWorker: SubscriptionWorker =
      TestBed.inject(SubscriptionWorker);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [SUBSCRIPTION_WORKER_PROVIDER]
    });
    expect(subscriptionWorker).not.toBe(TestBed.inject(SubscriptionWorker));
  });
});
