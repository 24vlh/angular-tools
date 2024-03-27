import { InjectionToken } from '@angular/core';
import {
  WebsocketEventObserver,
  WebsocketExponentialBackoffOptions
} from './websocket.type';
import { WebSocketSubjectConfig } from 'rxjs/internal/observable/dom/WebSocketSubject';

/**
 * The `WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS` injection token is used to provide the configuration options for
 * an exponential backoff strategy in a WebSocket connection.
 */
export const WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS: InjectionToken<WebsocketExponentialBackoffOptions> =
  new InjectionToken<WebsocketExponentialBackoffOptions>(
    'WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS'
  );

/**
 * The `WEBSOCKET_URL_OR_OPTIONS` injection token is used to provide the WebSocket server URL or configuration options.
 * This can either be a string representing the URL of the WebSocket server,
 * or a `WebSocketSubjectConfig` object that configures the WebSocket connection.
 *
 * @type {InjectionToken<string | WebSocketSubjectConfig<unknown>>}
 */
export const WEBSOCKET_URL_OR_OPTIONS: InjectionToken<
  string | WebSocketSubjectConfig<unknown>
> = new InjectionToken<string | WebSocketSubjectConfig<unknown>>(
  'WEBSOCKET_URL_OR_OPTIONS'
);

/**
 * The `WEBSOCKET_CLOSE_HANDLER` injection token is used to provide a callback function that is executed when the WebSocket connection is closed.
 * This can be used to perform cleanup operations or to notify other parts of the application that the connection has been closed.
 *
 * @type {InjectionToken<WebsocketEventObserver>}
 */
export const WEBSOCKET_CLOSE_HANDLER: InjectionToken<WebsocketEventObserver> =
  new InjectionToken<WebsocketEventObserver>('WEBSOCKET_CLOSE_HANDLER');

/**
 * The `WEBSOCKET_OPEN_HANDLER` injection token is used to provide a callback function that is executed when the WebSocket connection is opened.
 * This can be used to perform initialization operations or to notify other parts of the application that the connection has been opened.
 *
 * @type {InjectionToken<WebsocketEventObserver>}
 */
export const WEBSOCKET_OPEN_HANDLER: InjectionToken<WebsocketEventObserver> =
  new InjectionToken<WebsocketEventObserver>('WEBSOCKET_OPEN_HANDLER');
