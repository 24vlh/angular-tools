import {
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  Subject
} from 'rxjs';
import { Inject, NgZone, Optional } from '@angular/core';
import {
  SERVER_SENT_EVENT_TIMEOUT_BACKOFF_CONFIGS,
  SERVER_SENT_EVENT_URL,
  SERVER_SENT_EVENT_WITH_CREDENTIALS
} from './server-sent-event.injection-token';
import { ServerSentEvent } from './server-sent-event.interface';
import { NotInstanceOfType } from '@24vlh/ts-assert';
import { TimeoutBackoff } from '../../helpers';
import { TimeoutBackoffConfigs } from '../../helpers/timeout-backoff.interface';

/**
 * Injectable service for handling Server-Sent Events (SSE).
 * This service provides methods to connect, disconnect, and reconnect to the SSE server.
 * It also provides methods to listen to specific messages from the server.
 *
 * @template M - The type of the messages.
 */
export class ServerSentEventWorker<M> {
  private readonly eventSourceInitDic: EventSourceInit | undefined = undefined;
  private eventSource!: EventSource;
  private eventSubject: Subject<ServerSentEvent<M, MessageEvent<string>>> =
    new Subject<ServerSentEvent<M, MessageEvent<string>>>();
  private messages$: Observable<ServerSentEvent<M, MessageEvent<string>>> =
    this.eventSubject.asObservable();
  private timeoutBackoff: (reset?: boolean) => void = TimeoutBackoff(
    (): void => {
      this.reconnect();
    },
    (): void => {
      this.disconnect();
      this.eventSubject.complete();
    },
    this.timeoutBackoffConfigs.maxRetries,
    this.timeoutBackoffConfigs.initialDelay,
    this.timeoutBackoffConfigs.maxDelay
  );

  /**
   * Constructs a new ServerSentEventWorker.
   *
   * @param url - The URL of the SSE server.
   * @param withCredentials - Whether to include credentials in the request.
   * @param timeoutBackoffConfigs - Configuration for the timeout backoff strategy.
   * @param ngZone - Angular's execution context.
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
      this.eventSourceInitDic = { withCredentials };
    }
    this.connect();
  }

  /**
   * Checks if the connection to the SSE server is disconnected.
   *
   * @returns true if disconnected, false otherwise.
   * @example
   *  sse.isDisconnected;
   *  // => Returns true if the connection to the SSE server is disconnected.
   */
  get isDisconnected(): boolean {
    return (
      NotInstanceOfType(this.eventSource, EventSource) ||
      this.eventSource.readyState === EventSource.CLOSED
    );
  }

  /**
   * Returns the EventSource object.
   *
   * @returns the EventSource object.
   * @example
   *  sse.EventSource;
   *  // => Returns the EventSource object.
   */
  get EventSource(): EventSource | undefined {
    return this.eventSource;
  }

  /**
   * Returns the Subject for the server-sent events.
   *
   * @returns the Subject for the server-sent events.
   * @example
   *  sse.EventSubject;
   *  // => Returns the Subject for the server-sent events.
   */
  get EventSubject(): Subject<ServerSentEvent<M, MessageEvent<string>>> {
    return this.eventSubject;
  }

  /**
   * Returns the Observable for the server-sent events.
   *
   * @returns the Observable for the server-sent events.
   * @example
   *  sse.Messages$;
   *  // => Returns the Observable for the server-sent events.
   */
  get Messages$(): Observable<ServerSentEvent<M, MessageEvent<string>>> {
    return this.messages$;
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
    this.eventSource = new EventSource(this.url, this.eventSourceInitDic);

    this.eventSource.onmessage = (event: MessageEvent<string>): void => {
      this.ngZone.run((): void => {
        this.eventSubject.next({
          event,
          data: JSON.parse(event.data) as M
        });
      });
    };

    this.eventSource.onerror = (): void => {
      this.timeoutBackoff();
    };

    this.eventSource.onopen = (): void => {
      this.timeoutBackoff(true);
    };
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
        this.eventSource &&
        this.eventSource.readyState !== EventSource.CLOSED
      ) {
        this.eventSource.close();
      } else {
        console.warn('EventSource is already closed.');
      }
    });
  }

  /**
   * Listens to specific messages from the SSE server.
   *
   * @param operators - The operators to apply to the messages.
   * @returns an Observable of the filtered messages.
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
    return this.Messages$.pipe(...(operators as []));
  }

  /**
   * Picks specific messages from the SSE server.
   *
   * @param filterCallback - The filter function to apply to the messages.
   * @param operators - The operators to apply to the filtered messages.
   * @returns an Observable of the picked messages.
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
    return this.Messages$.pipe(filter(filterCallback), ...(operators as []));
  }

  /**
   * Picks and maps specific messages from the SSE server.
   *
   * @param filterCallback - The filter function to apply to the messages.
   * @param mapCallback - The map function to apply to the filtered messages.
   * @returns an Observable of the mapped messages.
   * @example
   *  sse.pickAndMapMessage((data) => data.event.type === 'message', (data) => data.data);
   */
  pickAndMapMessage<R>(
    filterCallback: (data: ServerSentEvent<M, MessageEvent<string>>) => boolean,
    mapCallback: (data: ServerSentEvent<M, MessageEvent<string>>) => R
  ): Observable<R> {
    return this.Messages$.pipe(filter(filterCallback), map(mapCallback));
  }
}
