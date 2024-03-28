import { InjectionToken } from '@angular/core';

/**
 * InjectionToken for the type of custom event.
 * This InjectionToken is used to provide the type of custom event in the application.
 * The type of the custom event is a string.
 */
export interface CustomEventProviderFactoryConfigs {
  replySubjectBufferSize: number;
  windowObjectInjectionToken: InjectionToken<Window & typeof globalThis>;
  windowObject: Window & typeof globalThis;
}
