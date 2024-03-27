import {
  DispatchCustomEvent,
  RegisterToCustomEvent
} from './custom-event.helper';
import { CustomEventApi } from './custom-event.api';

describe('CustomEventHelper', (): void => {
  let windowSpy: jasmine.SpyObj<Window>;
  let addEventListenerSpy: jasmine.Spy<Window['addEventListener']>;
  let dispatchEventSpy: jasmine.Spy<Window['dispatchEvent']>;

  beforeEach((): void => {
    windowSpy = jasmine.createSpyObj('window', [
      'dispatchEvent',
      'addEventListener'
    ]) as jasmine.SpyObj<Window>;

    addEventListenerSpy = windowSpy.addEventListener.and.callThrough();
    dispatchEventSpy = windowSpy.dispatchEvent.and.callThrough();
  });

  afterEach((): void => {
    addEventListenerSpy.calls.reset();
    dispatchEventSpy.calls.reset();
  });

  it('should dispatch a custom event with the provided data', (): void => {
    const type = 'testType';
    const data = 'testData';
    DispatchCustomEvent(windowSpy, type, data);

    expect(dispatchEventSpy).toHaveBeenCalledWith(jasmine.any(CustomEventApi));
  });

  it('should dispatch a custom event with the provided data and eventInitDict', (): void => {
    const type = 'testType';
    const data = 'testData';
    const eventInitDict = { bubbles: true, cancelable: false };
    DispatchCustomEvent(windowSpy, type, data, eventInitDict);

    expect(dispatchEventSpy).toHaveBeenCalledWith(jasmine.any(CustomEventApi));
  });

  it('should register a callback function to be executed when a custom event of the provided type is dispatched', (): void => {
    const type = 'testType';
    const callback: jasmine.Spy<jasmine.Func> = jasmine.createSpy(type);
    RegisterToCustomEvent(windowSpy, type, callback);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      type,
      jasmine.any(Function)
    );
  });

  it('should call the callback function with the correct data when a custom event is dispatched', (): void => {
    const eventTarget: EventTarget = new EventTarget();
    windowSpy.addEventListener.and.callFake(
      eventTarget.addEventListener.bind(eventTarget)
    );
    windowSpy.dispatchEvent.and.callFake(
      eventTarget.dispatchEvent.bind(eventTarget)
    );
    const type = 'testType';
    const data = 'testData';
    const callback: jasmine.Spy<jasmine.Func> = jasmine.createSpy(type);
    RegisterToCustomEvent(windowSpy, type, callback);
    DispatchCustomEvent(windowSpy, type, data);

    expect(callback).toHaveBeenCalledWith(data);
  });
});
