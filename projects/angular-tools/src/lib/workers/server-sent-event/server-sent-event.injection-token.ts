import { InjectionToken } from '@angular/core';
import { TimeoutBackoffConfigs } from '../../helpers/timeout-backoff.interface';

/**
 * InjectionToken for the server-sent event URL.
 * This InjectionToken is used to provide the server-sent event URL in the application.
 * The server-sent event URL is a string.
 *
 * @type {InjectionToken<string>}
 */
export const SERVER_SENT_EVENT_URL: InjectionToken<string> =
  new InjectionToken<string>('SERVER_SENT_EVENT_URL');

/**
 * InjectionToken for the server-sent event with credentials.
 * This InjectionToken is used to provide the server-sent event with credentials in the application.
 * The server-sent event with credentials is a boolean.
 *
 * @type {InjectionToken<boolean>}
 */
export const SERVER_SENT_EVENT_WITH_CREDENTIALS: InjectionToken<boolean> =
  new InjectionToken<boolean>('SERVER_SENT_EVENT_WITH_CREDENTIALS');

/**
 * InjectionToken for the server-sent event timeout backoff configs.
 * This InjectionToken is used to provide the server-sent event timeout backoff configs in the application.
 * The server-sent event timeout backoff configs are of type TimeoutBackoffConfigs.
 *
 * @type {InjectionToken<TimeoutBackoffConfigs>}
 */
export const SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS: InjectionToken<TimeoutBackoffConfigs> =
  new InjectionToken<TimeoutBackoffConfigs>(
    'SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS'
  );
