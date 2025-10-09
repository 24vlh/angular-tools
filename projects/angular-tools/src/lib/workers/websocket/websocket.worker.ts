import { inject, Injectable } from '@angular/core';
import {
  WebSocketSubject,
  WebSocketSubjectConfig
} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {
  WEBSOCKET_CLOSE_HANDLER,
  WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS,
  WEBSOCKET_OPEN_HANDLER,
  WEBSOCKET_URL_OR_OPTIONS
} from './websocket.injection-token';
import {
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  ReplaySubject,
  Subject,
  Subscription
} from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { InstanceOfType, OfObjectType, OfStringType } from '@24vlh/ts-assert';
import { ExponentiallyBackoff } from '../../helpers';

/**
 * Class representing a WebSocket worker.
 *
 * @template M - The type of messages handled by the WebSocket connection.
 */
@Injectable()
export class WebsocketWorker<M> {
  private wsConnection!: WebSocketSubject<M> | undefined;
  private wsSubscription: Subscription | undefined = undefined;
  private wsMessagesSubject!: ReplaySubject<M>;
  private wsMessages$!: Observable<M>;
  private wsErrorSubject: Subject<unknown> = new Subject<unknown>();
  public wsErrors$: Observable<unknown> = this.wsErrorSubject.asObservable();

  private urlOrWebSocketSubjectConfig = inject(WEBSOCKET_URL_OR_OPTIONS);
  private exponentialBackoffOptions = inject(
    WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS,
    { optional: true }
  );
  private openEventObserver = inject(WEBSOCKET_OPEN_HANDLER, {
    optional: true
  });
  private closeEventObserver = inject(WEBSOCKET_CLOSE_HANDLER, {
    optional: true
  });
  private readonly queueBatchSize = 50;
  private readonly queueBatchDelayMs = 100;
  private messageQueue: M[] = [];
  private connectionStateSubject = new ReplaySubject<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'
  >(1);
  public connectionState$ = this.connectionStateSubject.asObservable();

  /**
   * Creates an instance of WebsocketWorker.
   */
  constructor() {
    this.connect();
  }

  /**
   * Returns the URL or WebSocketSubjectConfig used to configure the websocket connection.
   *
   * @returns {string | WebSocketSubjectConfig<M>} The URL or configuration object for the websocket connection.
   * @example
   *  const config = websocketWorker.createWebSocketConfig();
   *  // config is either a string URL or a WebSocketSubjectConfig object.
   */
  get webSocketConfig() {
    return this.createWebSocketConfig();
  }

  /**
   * Returns the WebSocketSubject for the websocket connection.
   *
   * @returns {WebSocketSubject<M> | undefined} The WebSocketSubject for the websocket connection.
   * @example
   *  websocketWorker.websocketConnection;
   *  // Returns the WebSocketSubject for the websocket connection.
   */
  get websocketConnection(): WebSocketSubject<M> | undefined {
    return this.wsConnection;
  }

  /**
   * Returns the Subscription for the websocket connection.
   *
   * @returns {Subscription | undefined} The Subscription for the websocket connection.
   * @example
   *  websocketWorker.websocketSubscription;
   *  // Returns the Subscription for the websocket connection.
   */
  get websocketSubscription(): Subscription | undefined {
    return this.wsSubscription;
  }

  /**
   * Returns the Subject that emits all messages from the websocket connection.
   *
   * @returns {ReplaySubject<M>} Subject for the messages.
   * @example
   *  websocketWorker.messagesSubject;
   *  // Returns the Subject for the messages.
   */
  get messagesSubject(): ReplaySubject<M> {
    return this.wsMessagesSubject;
  }

  /**
   * Returns whether the websocket connection is disconnected.
   *
   * @returns {boolean} True if the websocket connection is disconnected, otherwise false.
   * @example
   *  websocketWorker.isDisconnected;
   *  // Returns true if the websocket connection is disconnected.
   */
  get isDisconnected(): boolean {
    return (
      this.websocketConnection === undefined || this.websocketConnection.closed
    );
  }

  /**
   * Returns an observable that emits all messages from the websocket connection.
   *
   * @returns {Observable<M>} Observable of the messages.
   */
  get messages$(): Observable<M> {
    return this.wsMessages$;
  }

  /**
   * Sends a message over the websocket connection.
   *
   * @param data The message to send.
   * @returns {void}
   * @example
   *  websocketWorker.send({ message: 'Hello, World!' });
   *  // Sends the message to the server over the websocket connection.
   */
  send(data: M): void {
    try {
      if (this.websocketConnection && !this.websocketConnection.closed) {
        this.websocketConnection.next(data);
      } else {
        this.messageQueue.push(data);
      }
    } catch (e) {
      this.wsErrorSubject.next(e);
      console.error('WebSocket send failed:', e);
    }
  }

  /**
   * Sends an authentication payload over the websocket connection.
   *
   * @template A - The type of the authentication payload.
   * @param {A} authPayload - The authentication payload to send.
   * @returns {void}
   * @example
   *  websocketWorker.authenticate({ token: 'my-auth-token' });
   *  // Sends the authentication payload to the server over the websocket connection.
   */
  authenticate<A>(authPayload: A): void {
    this.send(authPayload as unknown as M);
  }

  /**
   * Returns an observable of messages from the websocket connection, with optional RxJS operators applied.
   *
   * @template R - The type of the transformed messages.
   * @template M - The type of messages handled by the WebSocket connection.
   * @param operators Optional RxJS operators to transform the messages.
   * @returns {Observable<M | R>} Observable of the messages (optionally transformed).
   * @example
   *  websocketWorker.listen();
   *  // Emits all messages from the websocket connection.
   */
  listen<R>(
    ...operators: (
      | OperatorFunction<M, R>
      | MonoTypeOperatorFunction<M>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<M | R> {
    return this.messages$.pipe(...(operators as []));
  }

  /**
   * Returns an observable that emits messages matching the filter from the websocket connection, with optional operators applied.
   *
   * @template R - The type of the transformed messages.
   * @template M - The type of messages handled by the WebSocket connection.
   * @param filterCallback A function to filter messages.
   * @param operators Optional RxJS operators to transform the filtered messages.
   * @returns {Observable<M | R>} Observable of the filtered (and optionally transformed) messages.
   * @example
   *  websocketWorker.pickMessage(
   *    data => data.type === 'message'
   *  );
   *  // Emits messages of type 'message'.
   */
  pickMessage<R>(
    filterCallback: (data: M) => boolean,
    ...operators: (
      | OperatorFunction<M, R>
      | MonoTypeOperatorFunction<M>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<M | R> {
    return this.messages$.pipe(filter(filterCallback), ...(operators as []));
  }

  /**
   * Returns an observable that emits mapped messages matching the filter from the websocket connection.
   *
   * @template R - The type of the mapped messages.
   * @param filterCallback A function to filter messages.
   * @param mapCallback A function to map the filtered message.
   * @returns {Observable<R>} Observable of the mapped message.
   * @example
   *  websocketWorker.pickAndMapMessage(
   *    data => data.type === 'message',
   *    data => data.data
   *  );
   *  // Emits the mapped message data for messages of type 'message'.
   */
  pickAndMapMessage<R>(
    filterCallback: (data: M) => boolean,
    mapCallback: (data: M) => R
  ): Observable<R> {
    return this.messages$.pipe(filter(filterCallback), map(mapCallback));
  }

  /**
   * Establishes a websocket connection if not already connected.
   *
   * @returns {void}
   * @example
   *  websocketWorker.connect();
   *  // The websocket connection is established if not already connected.
   */
  connect(): void {
    this.connectionStateSubject.next('connecting');
    if (this.websocketSubscription && !this.websocketSubscription.closed) {
      this.connectionStateSubject.next('connected');
      return; // Already connected
    }

    // Reset the subject and observable for a fresh connection
    this.wsMessagesSubject = new ReplaySubject<M>(1);
    this.wsMessages$ = this.wsMessagesSubject.asObservable();

    const {
      maxRetryAttempts,
      initialDelay,
      maxDelay,
      disableAndUseConstantDelayOf
    } = this.exponentialBackoffOptions ?? {};

    this.wsConnection = webSocket<M>(this.createWebSocketConfig());
    this.wsSubscription = this.websocketConnection
      ?.pipe(
        ExponentiallyBackoff<M>(
          ...[
            maxRetryAttempts,
            initialDelay,
            maxDelay,
            disableAndUseConstantDelayOf
          ]
        )
      )
      .subscribe({
        next: (data: M) => {
          this.connectionStateSubject.next('connected');
          this.messagesSubject.next(data);
        },
        error: (err: unknown) => {
          this.connectionStateSubject.next('error');
          this.wsErrorSubject.next({ type: 'connection', error: err });
        },
        complete: () => {
          this.connectionStateSubject.next('disconnected');
        }
      });

    void this.flushQueue();
  }

  /**
   * Disconnects from the websocket by unsubscribing and closing the connection if open.
   *
   * @returns {void}
   * @example
   *  websocketWorker.disconnect();
   *  // The websocket connection is closed and unsubscribed.
   */
  disconnect(): void {
    try {
      if (InstanceOfType(this.websocketSubscription, Subscription)) {
        this.websocketSubscription.unsubscribe();
        this.wsSubscription = undefined;
      } else {
        console.warn(
          'WebSocket connection already unsubscribed or not subscribed.'
        );
      }
    } catch (e) {
      this.wsErrorSubject.next(e);
      console.error('WebSocket subscription unsubscribe failed:', e);
    }

    try {
      if (
        InstanceOfType(this.websocketConnection, WebSocketSubject) &&
        !this.websocketConnection.closed
      ) {
        this.websocketConnection.unsubscribe();
        this.wsConnection = undefined;
      } else {
        console.warn('WebSocket connection already closed.');
      }
    } catch (e) {
      this.wsErrorSubject.next(e);
      console.error('WebSocket connection close failed:', e);
    }

    if (!this.wsMessagesSubject.closed) {
      this.wsMessagesSubject.complete();
    }

    this.connectionStateSubject.next('disconnected');
  }

  /**
   * Reconnects to the websocket by closing the current connection (if any) and establishing a new one.
   *
   * @returns {void}
   * @example
   *  websocketWorker.reconnect();
   *  // The websocket connection is closed and then re-established.
   */
  reconnect(): void {
    this.connectionStateSubject.next('reconnecting');
    this.disconnect();
    this.connect();
  }

  /**
   * Flushes the message queue by sending messages in batches with a delay between batches.
   *
   * @returns {Promise<void>} A promise that resolves when the queue is flushed.
   * @example
   *  await websocketWorker.flushQueue();
   *  // All queued messages are sent over the websocket connection.
   * @private
   */
  private async flushQueue(): Promise<void> {
    while (
      this.messageQueue.length &&
      this.websocketConnection &&
      !this.websocketConnection.closed
    ) {
      const batch = this.messageQueue.splice(0, this.queueBatchSize);
      for (const msg of batch) {
        this.websocketConnection.next(msg);
      }
      if (this.messageQueue.length) {
        await new Promise((res) => setTimeout(res, this.queueBatchDelayMs));
      }
    }
  }

  /**
   * Returns the URL or WebSocketSubjectConfig used to configure the websocket connection.
   *
   * @returns {string | WebSocketSubjectConfig<M>} The URL or configuration object for the websocket connection.
   * @throws {Error} If the provided config is not a valid object.
   * @example
   *  const config = websocketWorker.webSocketConfig;
   *  // config is either a string URL or a WebSocketSubjectConfig object.
   */
  private createWebSocketConfig(): string | WebSocketSubjectConfig<M> {
    if (OfStringType(this.urlOrWebSocketSubjectConfig)) {
      return this.urlOrWebSocketSubjectConfig;
    }
    if (!OfObjectType(this.urlOrWebSocketSubjectConfig)) {
      throw new Error('Invalid WebSocketSubjectConfig. Object expected.');
    }
    const config = { ...this.urlOrWebSocketSubjectConfig };
    const closeObserver = config.closeObserver;
    const openObserver = config.openObserver;
    config.closeObserver = {
      next: (event: CloseEvent): void => {
        this.closeEventObserver?.(event);
        closeObserver?.next?.(event);
      }
    };
    config.openObserver = {
      next: (event: Event): void => {
        this.openEventObserver?.(event);
        openObserver?.next?.(event);
      }
    };
    return config as WebSocketSubjectConfig<M>;
  }
}
