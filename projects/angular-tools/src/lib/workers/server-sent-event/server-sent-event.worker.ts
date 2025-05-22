import {
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  ReplaySubject
} from 'rxjs';
import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import {
  SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS,
  SERVER_SENT_EVENT_URL,
  SERVER_SENT_EVENT_WITH_CREDENTIALS
} from './server-sent-event.injection-token';
import { ServerSentEvent } from './server-sent-event.interface';
import { NotInstanceOfType } from '@24vlh/ts-assert';
import { TimeoutBackoff, TimeoutBackoffConfigs } from '../../helpers';

/**
 * Injectable service for handling Server-Sent Events (SSE).
 * Provides methods to connect, disconnect, reconnect, and listen to SSE messages.
 *
 * @typeParam M - The message data type.
 */
@Injectable()
export class ServerSentEventWorker<M> {
  private readonly sseEventSourceInitDic: EventSourceInit | undefined =
    undefined;
  private sseEventSource!: EventSource | undefined;
  private sseEventSubject!: ReplaySubject<
    ServerSentEvent<M, MessageEvent<string>>
  >;
  private sseMessages$!: Observable<ServerSentEvent<M, MessageEvent<string>>>;
  private isSubjectClosed = false;
  private customEventListeners: {
    type: string;
    listener: (event: MessageEvent<string>) => void;
  }[] = [];
  private readonly timeoutBackoff: (reset?: boolean) => void;

  /**
   * Creates a new instance of ServerSentEventWorker.
   *
   * @param url The URL of the SSE server.
   * @param withCredentials Whether to include credentials in the request.
   * @param timeoutBackoffConfigs Configuration for the timeout backoff strategy.
   * @param ngZone Angular's execution context.
   */
  constructor(
    @Inject(SERVER_SENT_EVENT_URL) private url: string,
    @Inject(SERVER_SENT_EVENT_WITH_CREDENTIALS)
    @Optional()
    withCredentials: boolean | undefined = undefined,
    @Inject(SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS)
    @Optional()
    private timeoutBackoffConfigs: TimeoutBackoffConfigs = {},
    private ngZone: NgZone
  ) {
    if (withCredentials) {
      this.sseEventSourceInitDic = { withCredentials };
    }
    this.timeoutBackoff = TimeoutBackoff(
      (): void => {
        this.reconnect();
      },
      (): void => {
        this.disconnect();
        this.sseEventSubject.complete();
      },
      this.timeoutBackoffConfigs.maxRetries,
      this.timeoutBackoffConfigs.initialDelay,
      this.timeoutBackoffConfigs.maxDelay
    );
    this.connect();
  }

  /**
   * Indicates whether the connection to the SSE server is disconnected.
   *
   * @returns `true` if disconnected, otherwise `false`.
   * @example
   *  sse.isDisconnected;
   *  // => true if the SSE connection is disconnected.
   */
  get isDisconnected(): boolean {
    return (
      !this.eventSource ||
      NotInstanceOfType(this.eventSource, EventSource) ||
      this.eventSource.readyState === EventSource.CLOSED
    );
  }

  /**
   * Returns the underlying EventSource instance.
   *
   * @returns The EventSource object.
   * @example
   *  sse.eventSource;
   *  // => The EventSource instance.
   */
  get eventSource(): EventSource | undefined {
    return this.sseEventSource;
  }

  /**
   * Returns the ReplaySubject for server-sent events.
   *
   * @returns The ReplaySubject instance.
   * @example
   *  sse.eventSubject;
   *  // => The ReplaySubject for server-sent events.
   */
  get eventSubject(): ReplaySubject<ServerSentEvent<M, MessageEvent<string>>> {
    return this.sseEventSubject;
  }

  /**
   * Returns the Observable of server-sent events.
   *
   * @returns The Observable instance.
   * @example
   *  sse.messages$;
   *  // => The Observable of server-sent events.
   */
  get messages$(): Observable<ServerSentEvent<M, MessageEvent<string>>> {
    return this.sseMessages$;
  }

  /**
   * Connects to the SSE server.
   *
   * @returns void
   * @example
   *  sse.connect();
   *  // => Connects to the SSE server.
   */
  connect(): void {
    if (
      this.sseEventSource &&
      this.sseEventSource.readyState !== EventSource.CLOSED
    ) {
      console.warn('SSE connection already open.');
      return;
    }

    // Reset subject and closed flag on new connection
    this.isSubjectClosed = false;
    this.sseEventSubject = new ReplaySubject<
      ServerSentEvent<M, MessageEvent<string>>
    >(1);
    this.sseMessages$ = this.sseEventSubject.asObservable();

    this.sseEventSource = new EventSource(this.url, this.sseEventSourceInitDic);

    this.sseEventSource.onmessage = (event: MessageEvent<string>): void => {
      this.ngZone.run((): void => {
        if (this.isSubjectClosed) return;
        try {
          this.eventSubject.next({
            event,
            data: JSON.parse(event.data) as M
          });
        } catch (error) {
          this.eventSubject.error(
            new Error(`Failed to parse SSE data: ${(error as Error).message}`)
          );
        }
      });
    };

    this.sseEventSource.onerror = (): void => {
      // Try to distinguish fatal errors (e.g., readyState === CLOSED)
      if (
        this.sseEventSource &&
        this.sseEventSource.readyState === EventSource.CLOSED
      ) {
        this.timeoutBackoff(false); // fatal, will complete subject
      } else {
        this.timeoutBackoff();
      }
    };

    this.sseEventSource.onopen = (): void => {
      this.timeoutBackoff(true);
    };

    // Register custom event listeners
    this.customEventListeners.forEach(({ type, listener }) => {
      if (this.sseEventSource) {
        this.sseEventSource.addEventListener(type, listener as EventListener);
      }
    });
  }

  /**
   * Reconnects to the SSE server.
   *
   * @returns void
   * @example
   *  sse.reconnect();
   *  // => Reconnects to the SSE server.
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  /**
   * Disconnects from the SSE server.
   *
   * @returns void
   * @example
   *  sse.disconnect();
   *  // => Disconnects from the SSE server.
   */
  disconnect(): void {
    this.ngZone.run((): void => {
      if (
        this.sseEventSource &&
        this.sseEventSource.readyState !== EventSource.CLOSED
      ) {
        this.sseEventSource.close();
      } else {
        console.warn('EventSource is already closed.');
      }
      this.sseEventSource = undefined;
    });
  }

  /**
   * Cleans up the resources used by the SSE worker.
   * Call this method when the worker is no longer needed to release resources.
   */
  cleanOnDestroy(): void {
    this.disconnect();
    this.completeSubject();
  }

  /**
   * Listens to specific messages from the SSE server.
   *
   * @param operators The operators to apply to the messages.
   * @returns An Observable of the filtered messages.
   * @example
   *  sse.listen$();
   *  // => An Observable of the server-sent events.
   */
  listen$<R>(
    ...operators: (
      | OperatorFunction<ServerSentEvent<M, MessageEvent<string>>, R>
      | MonoTypeOperatorFunction<ServerSentEvent<M, MessageEvent<string>>>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<ServerSentEvent<M, MessageEvent<string>> | R> {
    return this.sseMessages$.pipe(...(operators as []));
  }

  /**
   * Picks specific messages from the SSE server.
   *
   * @param filterCallback The filter function to apply to the messages.
   * @param operators The operators to apply to the filtered messages.
   * @returns An Observable of the picked messages.
   * @example
   *  sse.pickMessage((data) => data.event.type === 'message');
   *  // => An Observable of the picked messages.
   */
  pickMessage<R>(
    filterCallback: (data: ServerSentEvent<M, MessageEvent<string>>) => boolean,
    ...operators: (
      | OperatorFunction<ServerSentEvent<M, MessageEvent<string>>, R>
      | MonoTypeOperatorFunction<ServerSentEvent<M, MessageEvent<string>>>
      | MonoTypeOperatorFunction<R>
    )[]
  ): Observable<ServerSentEvent<M, MessageEvent<string>> | R> {
    return this.sseMessages$.pipe(filter(filterCallback), ...(operators as []));
  }

  /**
   * Picks and maps specific messages from the SSE server.
   *
   * @param filterCallback The filter function to apply to the messages.
   * @param mapCallback The map function to apply to the filtered messages.
   * @returns An Observable of the mapped messages.
   * @example
   *  sse.pickAndMapMessage((data) => data.event.type === 'message', (data) => data.data);
   *  // => An Observable of the mapped messages.
   */
  pickAndMapMessage<R>(
    filterCallback: (data: ServerSentEvent<M, MessageEvent<string>>) => boolean,
    mapCallback: (data: ServerSentEvent<M, MessageEvent<string>>) => R
  ): Observable<R> {
    return this.sseMessages$.pipe(filter(filterCallback), map(mapCallback));
  }

  /**
   * Adds a custom event listener for a specific SSE event type.
   * Call before connect() or after disconnect() to ensure registration.
   */
  addEventListener(
    type: string,
    listener: (event: MessageEvent<string>) => void
  ): void {
    this.customEventListeners.push({ type, listener });
    if (this.sseEventSource) {
      this.sseEventSource.addEventListener(type, listener as EventListener);
    }
  }

  /**
   * Removes a custom event listener for a specific SSE event type.
   */
  removeEventListener(
    type: string,
    listener: (event: MessageEvent<string>) => void
  ): void {
    this.customEventListeners = this.customEventListeners.filter(
      (l) => l.type !== type || l.listener !== listener
    );
    if (this.sseEventSource) {
      this.sseEventSource.removeEventListener(type, listener as EventListener);
    }
  }

  /**
   * Manually resets the backoff timer.
   */
  resetBackoff(): void {
    this.timeoutBackoff(true);
  }

  /**
   * Adds a custom event listener to the SSE server.
   * @private
   */
  private completeSubject(): void {
    if (!this.isSubjectClosed) {
      this.sseEventSubject.complete();
      this.isSubjectClosed = true;
    }
  }
}
