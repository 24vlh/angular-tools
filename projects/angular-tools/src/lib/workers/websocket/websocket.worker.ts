import { Inject, Optional } from '@angular/core';
import {
  WebSocketSubject,
  WebSocketSubjectConfig
} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {
  WebsocketEventObserver,
  WebsocketExponentialBackoffOptions
} from './websocket.type';
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
  Subject,
  Subscription
} from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { InstanceOfType, OfObjectType, OfStringType } from '@24vlh/ts-assert';
import { ExponentiallyBackoff } from '../../helpers';

/**
 * Class representing a Websocket worker.
 *
 * @template M - The type of messages that the websocket will handle.
 */
export class WebsocketWorker<M> {
  private websocketConnection!: WebSocketSubject<M>;
  private websocketSubscription: Subscription | null = null;
  private messagesSubject: Subject<M> = new Subject<M>();
  private messages$: Observable<M> = this.messagesSubject.asObservable();

  /**
   * Create a WebsocketWorker.
   *
   * @param {string | WebSocketSubjectConfig<M>} urlOrWebSocketSubjectConfig - The URL or WebSocketSubjectConfig to use for the websocket connection.
   * @param {WebsocketExponentialBackoffOptions | null} exponentialBackoffOptions - The options for exponential backoff.
   * @param {WebsocketEventObserver | null} openEventObserver - The observer for open events.
   * @param {WebsocketEventObserver | null} closeEventObserver - The observer for close events.
   */
  constructor(
    @Inject(WEBSOCKET_URL_OR_OPTIONS)
    private urlOrWebSocketSubjectConfig: string | WebSocketSubjectConfig<M>,
    @Inject(WEBSOCKET_EXPONENTIAL_BACKOFF_OPTIONS)
    @Optional()
    private exponentialBackoffOptions: WebsocketExponentialBackoffOptions | null = null,
    @Inject(WEBSOCKET_OPEN_HANDLER)
    @Optional()
    private openEventObserver: WebsocketEventObserver | null = null,
    @Inject(WEBSOCKET_CLOSE_HANDLER)
    @Optional()
    private closeEventObserver: WebsocketEventObserver | null = null
  ) {
    this.connect();
  }

  /**
   * Get the WebSocketSubject for the websocket connection.
   *
   * @template M - The type of the message.
   * @return {WebSocketSubject<M>} The WebSocketSubject for the websocket connection.
   */
  get WebsocketConnection(): WebSocketSubject<M> {
    return this.websocketConnection;
  }

  /**
   * Get the Subscription for the websocket connection.
   *
   * @return {Subscription | null} The Subscription for the websocket connection.
   */
  get WebsocketSubscription(): Subscription | null {
    return this.websocketSubscription;
  }

  /**
   * Get the Subject for the messages.
   *
   * @template M - The type of the message.
   * @return {Subject<M>} The Subject for the messages.
   */
  get MessagesSubject(): Subject<M> {
    return this.messagesSubject;
  }

  /**
   * Check if the websocket connection is disconnected.
   *
   * @return {boolean} True if the websocket connection is disconnected, false otherwise.
   */
  get isDisconnected(): boolean {
    return this.WebsocketConnection.closed;
  }

  /**
   * Get the Observable for the messages.
   *
   * @template M - The type of the message.
   * @return {Observable<M>} The Observable for the messages.
   */
  get Messages$(): Observable<M> {
    return this.messages$;
  }

  /**
   * Get the URL or WebSocketSubjectConfig for the websocket connection.
   *
   * @template M - The type of the message.
   * @return {string | WebSocketSubjectConfig<M>} The URL or WebSocketSubjectConfig for the websocket connection.
   * @throws {Error} If the WebSocketSubjectConfig is not an object.
   */
  get UrlOrWebSocketSubjectConfig(): string | WebSocketSubjectConfig<M> {
    if (OfStringType(this.urlOrWebSocketSubjectConfig)) {
      return this.urlOrWebSocketSubjectConfig;
    }

    if (!OfObjectType(this.urlOrWebSocketSubjectConfig)) {
      throw new Error('Invalid WebSocketSubjectConfig. Object expected.');
    }

    const closeObserver = this.urlOrWebSocketSubjectConfig.closeObserver;

    const openObserver = this.urlOrWebSocketSubjectConfig.openObserver;

    this.urlOrWebSocketSubjectConfig = {
      ...this.urlOrWebSocketSubjectConfig,
      closeObserver: {
        next: (event: CloseEvent): void => {
          this.closeEventObserver?.(event);
          closeObserver?.next?.(event);
        }
      },
      openObserver: {
        next: (event: Event): void => {
          this.openEventObserver?.(event);
          openObserver?.next?.(event);
        }
      }
    };

    return this.urlOrWebSocketSubjectConfig;
  }

  /**
   * Send a message over the websocket connection.
   *
   * @template M - The type of the message.
   * @param {M} data - The message to send.
   */
  send(data: M): void {
    this.WebsocketConnection.next(data);
  }

  /**
   * Listen for messages over the websocket connection.
   *
   * @template M - The type of the message.
   * @template R - The type of the message to listen for.
   * @param {...(OperatorFunction<M, R> | MonoTypeOperatorFunction<M> | MonoTypeOperatorFunction<R>)[]} operators - The operators to use when listening for messages.
   * @return {Observable<M | R>} An Observable of the messages.
   */
  listen<R>(
    ...operators: (
      | OperatorFunction<M, R>
      | MonoTypeOperatorFunction<M>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<M | R> {
    return this.Messages$.pipe(...(operators as []));
  }

  /**
   * Pick a message from the websocket connection.
   *
   * @template M - The type of the message.
   * @template R - The type of the picked message.
   * @param {(data: M) => boolean} filterCallback - The callback to use when picking a message.
   * @param {...(OperatorFunction<M, R> | MonoTypeOperatorFunction<M> | MonoTypeOperatorFunction<R>)[]} operators - The operators to use when picking a message.
   * @return {Observable<M | R>} An Observable of the picked message.
   */
  pickMessage<R>(
    filterCallback: (data: M) => boolean,
    ...operators: (
      | OperatorFunction<M, R>
      | MonoTypeOperatorFunction<M>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<M | R> {
    return this.Messages$.pipe(filter(filterCallback), ...(operators as []));
  }

  /**
   * Pick and map a message from the websocket connection.
   *
   * @template M - The type of the message.
   * @template R - The type of the mapped message.
   * @param {(data: M) => boolean} filterCallback - The callback to use when picking a message.
   * @param {(data: M) => R} mapCallback - The callback to use when mapping the picked message.
   * @return {Observable<R>} An Observable of the mapped message.
   */
  pickAndMapMessage<R>(
    filterCallback: (data: M) => boolean,
    mapCallback: (data: M) => R
  ): Observable<R> {
    return this.Messages$.pipe(filter(filterCallback), map(mapCallback));
  }

  /**
   * Connect to the websocket.
   */
  connect(): void {
    const {
      maxRetryAttempts,
      initialDelay,
      maxDelay,
      disableAndUseConstantDelayOf
    } = this.exponentialBackoffOptions ?? {};

    this.websocketConnection = webSocket<M>(this.UrlOrWebSocketSubjectConfig);
    this.websocketSubscription = this.websocketConnection
      .pipe(
        ExponentiallyBackoff<M>(
          ...[
            maxRetryAttempts,
            initialDelay,
            maxDelay,
            disableAndUseConstantDelayOf
          ]
        )
      )
      .subscribe((data: M): void => {
        this.MessagesSubject.next(data);
      });
  }

  /**
   * Disconnect from the websocket.
   */
  disconnect(): void {
    if (InstanceOfType(this.WebsocketSubscription, Subscription)) {
      this.WebsocketSubscription.unsubscribe();
      this.websocketSubscription = null;
    } else {
      console.warn(
        'WebSocket connection already unsubscribed or not subscribed.'
      );
    }

    if (
      InstanceOfType(this.WebsocketConnection, WebSocketSubject) &&
      !this.WebsocketConnection.closed
    ) {
      this.WebsocketConnection.unsubscribe();
    } else {
      console.warn('WebSocket connection already closed.');
    }
  }

  /**
   * Reconnect to the websocket.
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
}
