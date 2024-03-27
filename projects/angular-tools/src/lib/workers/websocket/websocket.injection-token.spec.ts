import { TestBed } from '@angular/core/testing';
import {
  WEBSOCKET_CLOSE_HANDLER,
  WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS,
  WEBSOCKET_OPEN_HANDLER,
  WEBSOCKET_URL_OR_OPTIONS
} from './websocket.injection-token';
import { WebSocketSubjectConfig } from 'rxjs/internal/observable/dom/WebSocketSubject';
import {
  WebsocketEventObserver,
  WebsocketExponentialBackoffOptions
} from './websocket.type';

describe('Websocket Injection Tokens', (): void => {
  const wsUrl = 'ws://localhost:8080';
  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS,
          useValue: { maxDelay: 1000, maxRetryAttempts: 10 }
        },
        { provide: WEBSOCKET_URL_OR_OPTIONS, useValue: wsUrl },
        { provide: WEBSOCKET_CLOSE_HANDLER, useValue: (): boolean => true },
        { provide: WEBSOCKET_OPEN_HANDLER, useValue: (): boolean => true }
      ]
    });
  });

  it('should provide exponential backoff options', (): void => {
    const options: WebsocketExponentialBackoffOptions = TestBed.inject(
      WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS
    );
    expect(options).toEqual({ maxDelay: 1000, maxRetryAttempts: 10 });
  });

  it('should provide websocket url or options', (): void => {
    const urlOrOptions: string | WebSocketSubjectConfig<unknown> =
      TestBed.inject(WEBSOCKET_URL_OR_OPTIONS);
    expect(urlOrOptions).toBe(wsUrl);
  });

  it('should provide websocket close handler', (): void => {
    const closeHandler: WebsocketEventObserver = TestBed.inject(
      WEBSOCKET_CLOSE_HANDLER
    );
    expect(typeof closeHandler).toBe('function');
  });

  it('should provide websocket open handler', (): void => {
    const openHandler: WebsocketEventObserver = TestBed.inject(
      WEBSOCKET_OPEN_HANDLER
    );
    expect(typeof openHandler).toBe('function');
  });

  it('should handle websocket options as object', (): void => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WEBSOCKET_URL_OR_OPTIONS,
          useValue: {
            url: wsUrl,
            protocol: 'wss'
          } as WebSocketSubjectConfig<unknown>
        }
      ]
    });
    const urlOrOptions: string | WebSocketSubjectConfig<unknown> =
      TestBed.inject(WEBSOCKET_URL_OR_OPTIONS);
    expect(urlOrOptions).toEqual({ url: wsUrl, protocol: 'wss' });
  });
});
