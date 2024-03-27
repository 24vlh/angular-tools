import { CustomEventApi } from './custom-event.api';

/**
 * Dispatches a custom event with the provided data.
 *
 * @template T - The type of the data associated with the event.
 * @param {Window} windowObject - The window object where the event will be dispatched.
 * @param {string} type - The type of the event.
 * @param {T} data - The data associated with the event.
 * @param {CustomEventInit} [eventInitDict] - The custom event initialization dictionary.
 * @returns {void}
 * @example
 *  DispatchCustomEvent(window, 'type', data);
 *  DispatchCustomEvent(window, 'type', data, eventInitDict);
 *  // => Dispatches a custom event with the provided data and event initialization dictionary.
 *  // => The event is dispatched to the window object.
 *  // => If the event initialization dictionary is not provided, it defaults to the CustomEventInit dictionary.
 *  // => If the event initialization dictionary is not of type CustomEventInit, it catches the error and logs it.
 */
export const DispatchCustomEvent = <T>(
  windowObject: Window,
  type: string,
  data: T,
  eventInitDict?: CustomEventInit
): void => {
  windowObject.dispatchEvent(new CustomEventApi(type, data, eventInitDict));
};

/**
 * Registers a callback function to be executed when a custom event of the provided type is dispatched.
 *
 * @template T - The type of the data associated with the event.
 * @param {Window} windowObject - The window object where the event will be listened.
 * @param {string} type - The type of the event.
 * @param {(data: T) => void} callback - The callback function to be executed when the event is dispatched.
 * @returns {void}
 * @example
 *  RegisterToCustomEvent(window, 'type', (data) => console.log(data));
 *  // => Registers a callback function to be executed when a custom event of the provided type is dispatched.
 *  // => The callback function logs the data associated with the event.
 *  // => If the callback function is not provided, it catches the error and logs it.
 */
export const RegisterToCustomEvent = <T>(
  windowObject: Window,
  type: string,
  callback: (data: T) => void
): void => {
  windowObject.addEventListener(type, (event: Event): void => {
    callback((event as CustomEventApi<T>).data);
  });
};
