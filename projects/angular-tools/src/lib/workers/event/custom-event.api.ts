/**
 * Class representing a custom event API.
 *
 * @template T - The type of the data associated with the event.
 * @extends Event
 * @example
 *  new CustomEventApi('type', data);
 *  // => Creates a new custom event API with the provided type and data.
 *  // => The custom event API is an instance of the Event class.
 */
export class CustomEventApi<T> extends Event {
  /**
   * The data associated with the event.
   *
   * @type {T}
   */
  public readonly data: T;

  /**
   * Creates a new custom event API.
   *
   * @param {string} type - The type of the event.
   * @param {T} data - The data associated with the event.
   * @param {CustomEventInit} [eventInitDict] - The custom event initialization dictionary.
   * @example
   *  new CustomEventApi('type', data);
   *  // => Creates a new custom event API with the provided type and data.
   *  // => The custom event API is an instance of the Event class.
   */
  constructor(type: string, data: T, eventInitDict?: CustomEventInit) {
    super(type, eventInitDict);
    this.data = data;
  }
}
