import { TestBed } from '@angular/core/testing';
import { WebsocketWorker } from './websocket.worker';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { webSocket } from 'rxjs/webSocket';
import { WEBSOCKET_PROVIDERS_ARRAY } from './websocket.helper';

describe('WebsocketWorker', (): void => {
  let websocketWorker: WebsocketWorker<unknown>;
  const WEBSOCKET_URL = 'ws://localhost:8080';
  const websocketConnectionProperty = 'websocketConnection';

  describe('WebsocketWorker with override provider', (): void => {
    it('should call openObserver when webSocketConfig is an object with openObserver', (done: DoneFn): void => {
      const openObserver = {
        next: jasmine.createSpy('next')
      };
      const expectedValue = {
        url: WEBSOCKET_URL,
        openObserver
      };
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(expectedValue)]
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
      const configs = websocketWorker.webSocketConfig;
      (configs as WebSocketSubjectConfig<unknown>)?.openObserver?.next(
        new Event('open')
      );
      expect(openObserver.next).toHaveBeenCalled();
      websocketWorker.disconnect();
      done();
    });

    it('should throw an error when webSocketConfig is neither a string nor an object', (done: DoneFn): void => {
      const invalidValue = 123;
      const errorMessage = 'Invalid WebSocketSubjectConfig. Object expected.';
      TestBed.configureTestingModule({
        providers: [
          ...WEBSOCKET_PROVIDERS_ARRAY(invalidValue as unknown as string)
        ]
      });

      expect((): void => {
        websocketWorker = TestBed.inject(WebsocketWorker);
      }).toThrowError(errorMessage);
      done();
    });

    it('should throw error when webSocketConfig is not an object', (done: DoneFn): void => {
      const invalidValue: unknown[] = [1];
      const errorMessage = 'Invalid WebSocketSubjectConfig. Object expected.';
      try {
        TestBed.configureTestingModule({
          providers: [
            ...WEBSOCKET_PROVIDERS_ARRAY(invalidValue as unknown as string)
          ]
        });
        websocketWorker = TestBed.inject(WebsocketWorker);
      } catch (error: unknown) {
        expect((error as Error).message).toBe(errorMessage);
      }
      done();
    });

    it('should return the correct value when WebsocketConnection$ is called', (done: DoneFn): void => {
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(WEBSOCKET_URL)]
      });
      const expectedValue: WebSocketSubject<unknown> =
        webSocket<unknown>(WEBSOCKET_URL);
      TestBed.overrideProvider(WebsocketWorker, {
        useFactory: () => {
          const websocketWorker: WebsocketWorker<unknown> =
            new WebsocketWorker<unknown>();
          spyOnProperty(
            websocketWorker,
            websocketConnectionProperty,
            'get'
          ).and.returnValue(expectedValue);
          return websocketWorker;
        }
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
      const actualValue: WebSocketSubject<unknown> | undefined =
        websocketWorker.websocketConnection;
      expect(actualValue).toBe(expectedValue);
      websocketWorker.disconnect();
      done();
    });

    it('should return a Subscription object when WebsocketSubscription$ is called after connect', (done: DoneFn): void => {
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(WEBSOCKET_URL)]
      });
      const expectedValue: WebSocketSubject<unknown> =
        webSocket<unknown>(WEBSOCKET_URL);
      TestBed.overrideProvider(WebsocketWorker, {
        useFactory: () => {
          const websocketWorker: WebsocketWorker<unknown> =
            new WebsocketWorker<unknown>();
          spyOnProperty(
            websocketWorker,
            websocketConnectionProperty,
            'get'
          ).and.returnValue(expectedValue);
          return websocketWorker;
        }
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
      websocketWorker.connect();
      expect(websocketWorker.websocketSubscription).toBeTruthy();
      expect(websocketWorker.websocketSubscription).toBeInstanceOf(
        Subscription
      );
      websocketWorker.disconnect();
      done();
    });

    it('should return the correct Subject when MessagesConnection$ is accessed', (done: DoneFn): void => {
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(WEBSOCKET_URL)]
      });
      const expectedValue: ReplaySubject<unknown> = new ReplaySubject<unknown>();
      TestBed.overrideProvider(WebsocketWorker, {
        useFactory: () => {
          const websocketWorker: WebsocketWorker<unknown> =
            new WebsocketWorker<unknown>();
          spyOnProperty(
            websocketWorker,
            'messagesSubject',
            'get'
          ).and.returnValue(expectedValue);
          return websocketWorker;
        }
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
      const actualValue: ReplaySubject<unknown> = websocketWorker.messagesSubject;
      expect(actualValue).toBe(expectedValue);
      websocketWorker.disconnect();
      done();
    });

    it('should close a connection when disconnect is called', (done: DoneFn): void => {
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(WEBSOCKET_URL)]
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
      const websocketSpy: jasmine.Spy<() => void> = spyOn(
        websocketWorker,
        'disconnect'
      ).and.callThrough();
      websocketWorker.disconnect();
      expect(websocketSpy).toHaveBeenCalled();
      done();
    });
  });

  describe('WebsocketWorker with default injector', (): void => {
    beforeEach((): void => {
      TestBed.configureTestingModule({
        providers: [...WEBSOCKET_PROVIDERS_ARRAY(WEBSOCKET_URL)]
      });
      websocketWorker = TestBed.inject(WebsocketWorker);
    });

    afterEach((): void => {
      websocketWorker.disconnect();
    });

    it('should be created', (): void => {
      expect(websocketWorker).toBeTruthy();
    });

    it('should return the correct value when isDisconnected is called', (done: DoneFn): void => {
      spyOnProperty(
        websocketWorker,
        websocketConnectionProperty,
        'get'
      ).and.returnValue({
        closed: true
      } as unknown as WebSocketSubject<unknown>);
      expect(websocketWorker.isDisconnected).toBe(true);
      done();
    });

    it('should establish a connection when connect is called', (done: DoneFn): void => {
      const websocketSpy: jasmine.Spy<() => void> = spyOn(
        websocketWorker,
        'connect'
      ).and.callThrough();
      websocketWorker.reconnect();
      expect(websocketSpy).toHaveBeenCalled();
      done();
    });

    it('should reconnect when reconnect is called', (done: DoneFn): void => {
      const websocketSpy: jasmine.Spy<() => void> = spyOn(
        websocketWorker,
        'reconnect'
      ).and.callThrough();
      websocketWorker.reconnect();
      expect(websocketSpy).toHaveBeenCalled();
      done();
    });

    it('should send a message when post is called', (done: DoneFn): void => {
      const message = { type: 'test', content: 'Hello, server!' };
      const websocketSpy: jasmine.Spy<(data: unknown) => void> = spyOn(
        websocketWorker,
        'send'
      ).and.callThrough();
      websocketWorker.send(message);
      expect(websocketSpy).toHaveBeenCalledWith(message);
      done();
    });

    it('should listen to messages when listen is called', (done: DoneFn): void => {
      const websocketSpy: jasmine.Spy<() => void> = spyOn(
        websocketWorker,
        'listen'
      ).and.callThrough();
      websocketWorker.listen();
      expect(websocketSpy).toHaveBeenCalled();
      done();
    });

    it('should pick messages when pickMessage is called', (done: DoneFn): void => {
      const filterCallback = (): boolean => true;
      const websocketSpy: jasmine.Spy<
        (filterCallback: (data: unknown) => boolean) => Observable<unknown>
      > = spyOn(websocketWorker, 'pickMessage').and.callThrough();
      websocketWorker.pickMessage(filterCallback);
      expect(websocketSpy).toHaveBeenCalledWith(filterCallback);
      done();
    });

    it('should pick and map messages when pickAndMapMessage is called', (done: DoneFn): void => {
      const filterCallback = (): boolean => true;
      const mapCallback = (data: unknown): unknown => data;
      const websocketSpy: jasmine.Spy<
        (
          filterCallback: (data: unknown) => boolean,
          mapCallback: (data: unknown) => unknown
        ) => Observable<unknown>
      > = spyOn(websocketWorker, 'pickAndMapMessage').and.callThrough();
      websocketWorker.pickAndMapMessage(filterCallback, mapCallback);
      expect(websocketSpy).toHaveBeenCalledWith(filterCallback, mapCallback);
      done();
    });

    it('should return the string when urlOrWebSocketSubjectConfig is a string', (): void => {
      const actualValue: string | WebSocketSubjectConfig<unknown> =
        websocketWorker.webSocketConfig;
      expect(actualValue).toBe(WEBSOCKET_URL);
    });
  });
});
