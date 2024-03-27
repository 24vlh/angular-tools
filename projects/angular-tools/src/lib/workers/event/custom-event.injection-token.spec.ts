import { CUSTOM_EVENT_STREAM_REPLAY_SUBJECT } from './custom-event.injection-token';
import { ReplaySubject, Subscription } from 'rxjs';
import { InjectionToken } from '@angular/core';

describe('CUSTOM_EVENT_STREAM_REPLAY_SUBJECT', (): void => {
  let subscription: Subscription | null = null;

  beforeEach((): void => {
    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should be an instance of InjectionToken', (): void => {
    expect(CUSTOM_EVENT_STREAM_REPLAY_SUBJECT).toBeInstanceOf(InjectionToken);
  });

  it('should have a proper description', (): void => {
    expect(CUSTOM_EVENT_STREAM_REPLAY_SUBJECT.toString()).toBe(
      'InjectionToken CUSTOM_EVENT_STREAM_REPLAY_SUBJECT'
    );
  });

  it('should emit values when next is called', (done: DoneFn): void => {
    const replaySubject: ReplaySubject<unknown> = new ReplaySubject<unknown>();
    new InjectionToken<ReplaySubject<unknown>>(
      'CUSTOM_EVENT_STREAM_REPLAY_SUBJECT',
      {
        providedIn: 'root',
        factory: () => replaySubject
      }
    );

    const testValue = 'testValue';
    replaySubject.next(testValue);

    subscription = replaySubject.subscribe((value): void => {
      expect(value).toBe(testValue);
      done();
    });
  });

  it('should complete when complete is called', (done: DoneFn): void => {
    const replaySubject: ReplaySubject<unknown> = new ReplaySubject<unknown>();
    new InjectionToken<ReplaySubject<unknown>>(
      'CUSTOM_EVENT_STREAM_REPLAY_SUBJECT',
      {
        providedIn: 'root',
        factory: () => replaySubject
      }
    );

    replaySubject.complete();

    subscription = replaySubject.subscribe({
      complete: (): void => {
        done();
      }
    });
  });

  it('should throw an error when error is called', (done: DoneFn): void => {
    const replaySubject: ReplaySubject<unknown> = new ReplaySubject<unknown>();
    new InjectionToken<ReplaySubject<unknown>>(
      'CUSTOM_EVENT_STREAM_REPLAY_SUBJECT',
      {
        providedIn: 'root',
        factory: () => replaySubject
      }
    );

    const testError: Error = new Error('testError');
    replaySubject.error(testError);

    subscription = replaySubject.subscribe({
      error: (err): void => {
        expect(err).toBe(testError);
        done();
      }
    });
  });
});
