import { of, Subscription, SubscriptionLike } from 'rxjs';
import { SubscriptionWorker } from './subscription.worker';
import { TestBed } from '@angular/core/testing';
import { SUBSCRIPTION_WORKER_PROVIDER } from './subscription.provider';

describe('SubscriptionWorker', (): void => {
  let subscriptionWorker: SubscriptionWorker;
  let subscription: Subscription | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SUBSCRIPTION_WORKER_PROVIDER]
    });
    subscriptionWorker = TestBed.inject(SubscriptionWorker);
    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should add a subscription by calling sink', (done: DoneFn): void => {
    subscription = of(1).subscribe();
    subscriptionWorker.sink = subscription;
    expect(subscriptionWorker.subscriptions).toContain(subscription);
    done();
  });

  it('should add a subscription by calling add', (done: DoneFn): void => {
    subscription = of(1).subscribe();
    subscriptionWorker.add(subscription);
    expect(subscriptionWorker.subscriptions).toContain(subscription);
    done();
  });

  it('should not add a subscription that is not of type SubscriptionLike', (): void => {
    const sub: SubscriptionLike = {} as unknown as SubscriptionLike;
    subscriptionWorker.add(sub);
    expect(subscriptionWorker.subscriptions).not.toContain(sub);
  });

  it('should unsubscribe from all subscriptions', (done: DoneFn): void => {
    const sub1: SubscriptionLike = of(1).subscribe();
    const spy1: jasmine.Spy<() => void> = spyOn(
      sub1,
      'unsubscribe'
    ).and.callThrough();
    const sub2: SubscriptionLike = of(1).subscribe();
    const spy2: jasmine.Spy<() => void> = spyOn(
      sub2,
      'unsubscribe'
    ).and.callThrough();
    subscriptionWorker.add(sub1, sub2);
    subscriptionWorker.unsubscribe();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(subscriptionWorker.subscriptions).toHaveSize(0);
    done();
  });

  it('should map a subscription', (done: DoneFn): void => {
    const sub: SubscriptionLike = of(1).subscribe();
    subscriptionWorker.map('key', sub);
    expect(subscriptionWorker.mappedSubscriptions.get('key')).toBe(sub);
    subscriptionWorker.unsubscribeAllMapped();
    done();
  });

  it('should not map a subscription that is not of type SubscriptionLike', (): void => {
    const sub: SubscriptionLike = {} as unknown as SubscriptionLike;
    subscriptionWorker.map('key', sub);
    expect(subscriptionWorker.mappedSubscriptions.get('key')).not.toBe(sub);
  });

  it('should unsubscribe from a mapped subscription', (done: DoneFn): void => {
    const sub: SubscriptionLike = of(1).subscribe();
    const spy: jasmine.Spy<() => void> = spyOn(
      sub,
      'unsubscribe'
    ).and.callThrough();
    subscriptionWorker.map('key', sub);
    subscriptionWorker.unsubscribeMapped('key');
    expect(spy).toHaveBeenCalled();
    expect(subscriptionWorker.mappedSubscriptions.get('key')).toBeUndefined();
    done();
  });

  it('should unsubscribe from all mapped subscriptions', (done: DoneFn): void => {
    const sub1: SubscriptionLike = of(1).subscribe();
    const spy1: jasmine.Spy<() => void> = spyOn(
      sub1,
      'unsubscribe'
    ).and.callThrough();
    const sub2: SubscriptionLike = of(1).subscribe();
    const spy2: jasmine.Spy<() => void> = spyOn(
      sub2,
      'unsubscribe'
    ).and.callThrough();
    subscriptionWorker.map('key1', sub1);
    subscriptionWorker.map('key2', sub2);
    subscriptionWorker.unsubscribeAllMapped();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(subscriptionWorker.mappedSubscriptions.size).toBe(0);
    done();
  });

  it('should log an error when unsubscribe fails', (): void => {
    const sub: SubscriptionLike = of(1).subscribe({
      error: (): void => {
        throw new Error('Test error');
      }
    });

    const consoleErrorSpy = spyOn(console, 'error').and.callThrough();

    subscriptionWorker.add(sub);
    try {
      subscriptionWorker.unsubscribe();
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to unsubscribe: ${String(error)}`
      );
    }
  });
});
