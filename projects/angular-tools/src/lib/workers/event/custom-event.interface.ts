import { InjectionToken } from '@angular/core';

export interface CustomEventProviderFactoryConfigs {
  replySubjectBufferSize: number;
  windowObjectInjectionToken: InjectionToken<Window & typeof globalThis>;
  windowObject: Window & typeof globalThis;
}
