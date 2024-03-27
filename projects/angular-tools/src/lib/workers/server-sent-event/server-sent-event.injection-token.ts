import { InjectionToken } from '@angular/core';
import { TimeoutBackoffConfigs } from '../../helpers/timeout-backoff.interface';

export const SERVER_SENT_EVENT_URL: InjectionToken<string> =
  new InjectionToken<string>('SERVER_SENT_EVENT_URL');

export const SERVER_SENT_EVENT_WITH_CREDENTIALS: InjectionToken<boolean> =
  new InjectionToken<boolean>('SERVER_SENT_EVENT_WITH_CREDENTIALS');

export const SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS: InjectionToken<TimeoutBackoffConfigs> =
  new InjectionToken<TimeoutBackoffConfigs>(
    'SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS'
  );
