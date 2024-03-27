import { CUSTOM_EVENT_PROVIDER_FACTORY } from './custom-event.provider';
import { CustomEventWorker } from './custom-event.worker';
import { InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('CUSTOM_EVENT_PROVIDER_FACTORY', (): void => {
  const customEventWorkerInjectionToken: InjectionToken<
    CustomEventWorker<string>
  > = new InjectionToken<CustomEventWorker<string>>('CUSTOM_EVENT_WORKER');
  const customEventWindowObjectInjectionToken: InjectionToken<
    Window & typeof globalThis
  > = new InjectionToken<Window & typeof globalThis>(
    'CUSTOM_EVENT_WINDOW_OBJECT'
  );
  const providers: Provider[] = CUSTOM_EVENT_PROVIDER_FACTORY<string>(
    customEventWorkerInjectionToken,
    {
      replySubjectBufferSize: 1,
      windowObjectInjectionToken: customEventWindowObjectInjectionToken,
      windowObject: globalThis as Window & typeof globalThis
    }
  );
  let workerProvider: CustomEventWorker<string>;
  let windowObj: Window & typeof globalThis;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [...providers]
    }).compileComponents();
    workerProvider = TestBed.inject(customEventWorkerInjectionToken);
    windowObj = TestBed.inject(customEventWindowObjectInjectionToken);
  });

  it('should return an array of providers', (): void => {
    expect(providers).toBeInstanceOf(Array);
    expect(providers.length).toBe(2);
  });

  it('should create a new CustomEventWorker', (): void => {
    expect(workerProvider).toBeDefined();
    expect(workerProvider).toBeInstanceOf(CustomEventWorker);
  });

  it('should create a window provider', (): void => {
    expect(windowObj).toBeDefined();
    expect(windowObj).toBe(globalThis as Window & typeof globalThis);
  });

  it('should provide the global object when injecting CUSTOM_EVENT_WINDOW_OBJECT', (): void => {
    const windowObj = TestBed.inject(customEventWindowObjectInjectionToken);
    expect(windowObj).toBe(globalThis as Window & typeof globalThis);
  });
});
