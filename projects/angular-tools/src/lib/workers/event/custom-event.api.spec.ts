import { CustomEventApi } from './custom-event.api';

describe('CustomEventApi', (): void => {
  it('should create a new custom event with the provided type and data', (): void => {
    const type = 'testType';
    const data = 'testData';
    const event: CustomEventApi<string> = new CustomEventApi<string>(
      type,
      data
    );

    expect(event.type).toBe(type);
    expect(event.data).toBe(data);
  });

  it('should create a new custom event with the provided type, data, and eventInitDict', (): void => {
    const type = 'testType';
    const data = 'testData';
    const eventInitDict = { bubbles: true, cancelable: false };
    const event: CustomEventApi<string> = new CustomEventApi<string>(
      type,
      data,
      eventInitDict
    );

    expect(event.type).toBe(type);
    expect(event.data).toBe(data);
    expect(event.bubbles).toBe(eventInitDict.bubbles);
    expect(event.cancelable).toBe(eventInitDict.cancelable);
  });

  it('should create a new custom event with default eventInitDict if not provided', (): void => {
    const type = 'testType';
    const data = 'testData';
    const event: CustomEventApi<string> = new CustomEventApi<string>(
      type,
      data
    );

    expect(event.type).toBe(type);
    expect(event.data).toBe(data);
    expect(event.bubbles).toBe(false);
    expect(event.cancelable).toBe(false);
  });
});
