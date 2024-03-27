import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { fromEvent, of, Subscription } from 'rxjs';
import { CustomEventWorker } from './custom-event.worker';
import { InjectionToken, Provider } from '@angular/core';
import { CUSTOM_EVENT_PROVIDER_FACTORY } from './custom-event.provider';
import { CustomEventApi } from './custom-event.api';

describe('CustomEventWorker', (): void => {
  const customEventWorkerInjectionToken: InjectionToken<
    CustomEventWorker<string>
  > = new InjectionToken<CustomEventWorker<string>>('CUSTOM_EVENT_WORKER');
  const customEventWindowObjectInjectionToken: InjectionToken<
    typeof globalThis
  > = new InjectionToken<typeof globalThis>('CUSTOM_EVENT_WINDOW_OBJECT');
  const providers: Provider[] = CUSTOM_EVENT_PROVIDER_FACTORY<string>(
    customEventWorkerInjectionToken,
    {
      replySubjectBufferSize: 1,
      windowObjectInjectionToken: customEventWindowObjectInjectionToken,
      windowObject: globalThis as Window & typeof globalThis
    }
  );

  let customEventWorker: CustomEventWorker<string>;
  let nextSpy: jasmine.Spy;
  let dispatchEventSpy: jasmine.Spy;
  let subscription: Subscription | null = null;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [...providers]
    }).compileComponents();
    customEventWorker = TestBed.inject(customEventWorkerInjectionToken);

    nextSpy = spyOn(
      customEventWorker.customEventStream,
      'next'
    ).and.callThrough();
    dispatchEventSpy = spyOn(
      customEventWorker,
      'DispatchCustomEvent'
    ).and.callThrough();
    spyOn(fromEvent, 'call' as never).and.callFake((() =>
      of(new CustomEventApi('testType', 'testData'))) as never);
    spyOn(customEventWorker.customEventStream$, 'pipe').and.returnValue(
      of('testData')
    );

    subscription = null;
  });

  afterEach((): void => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should be created', (): void => {
    expect(customEventWorker).toBeTruthy();
  });

  it('dispatches data to customEventStream and window when dispatch is called with eventInitDict', (): void => {
    const testData = 'testData';
    const testEventInitDict = {
      bubbles: true,
      cancelable: false
    };

    customEventWorker.dispatch(testData, testEventInitDict);

    expect(nextSpy).toHaveBeenCalledWith(testData);
    expect(dispatchEventSpy).toHaveBeenCalledWith(testData, testEventInitDict);
  });

  it('dispatches data to customEventStream and window when dispatch is called without eventInitDict', (): void => {
    const testData = 'testData';

    customEventWorker.dispatch(testData);

    expect(nextSpy).toHaveBeenCalledWith(testData);
    expect(dispatchEventSpy).toHaveBeenCalledWith(testData, undefined);
  });

  it('should return an observable that emits the correct values when listen$ is called', (done: DoneFn): void => {
    const testData = 'testData';

    subscription = customEventWorker
      .listen$()
      .subscribe((data: string): void => {
        expect(data).toEqual(testData);
        done();
      });

    customEventWorker.dispatch(testData);
  });

  it('should not emit duplicate consecutive values when listen$ is called', fakeAsync((
    done: DoneFn
  ): void => {
    const testData: string[] = ['testData1', 'testData2', 'testData3'];

    let emissions = 0;
    subscription = customEventWorker
      .listen$()
      .subscribe((data: string): void => {
        expect(data).toEqual(testData[emissions]);
        emissions++;
        if (emissions > 3) {
          fail('Should not emit duplicate consecutive values');
        }
        if (emissions === 3) {
          done();
        }
      });

    tick(1);
    customEventWorker.dispatch(testData[0]);
    tick(1);
    customEventWorker.dispatch(testData[0]);
    tick(1);
    customEventWorker.dispatch(testData[1]);
    tick(1);
    customEventWorker.dispatch(testData[1]);
    tick(1);
    customEventWorker.dispatch(testData[2]);
  }));

  it('should not emit duplicate consecutive values when listen$ is called with comparerCallback', fakeAsync((
    done: DoneFn
  ): void => {
    const testData: string[] = ['testData1', 'testData2'];

    let emissions = 0;
    subscription = customEventWorker
      .listen$(
        undefined,
        (prev: string, curr: string): boolean => prev === curr
      )
      .subscribe((data: string): void => {
        expect(data).toEqual(testData[emissions]);
        emissions++;
        if (emissions > 2) {
          fail('Should not emit duplicate consecutive values');
        }
        if (emissions === 2) {
          done();
        }
      });

    tick(1);
    customEventWorker.dispatch(testData[0]);
    tick(1);
    customEventWorker.dispatch(testData[0]);
    tick(1);
    customEventWorker.dispatch(testData[1]);
  }));

  it('should filter the data based on the filterCallback when listen$ is called', fakeAsync((
    done: DoneFn
  ): void => {
    const testData = 'testData';

    subscription = customEventWorker
      .listen$((data: string): boolean => data === testData)
      .subscribe((data: string): void => {
        expect(data).toEqual(testData);
        done();
      });

    tick(1);
    customEventWorker.dispatch('otherData');
    tick(1);
    customEventWorker.dispatch(testData);
  }));
});
