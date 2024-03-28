# Angular Tools

## IntersectionObserverDirective

`IntersectionObserverDirective` is a directive that implements the Intersection Observer API. It emits an event each
time the host element intersects with the viewport.

### Usage

To use the `IntersectionObserverDirective`, add the `vlhIntersectionObserver` attribute to an element in your template.
Bind a method to the `(intersection)` output event to handle the intersection event.

Here's an example:

```angular17html

<div vlhIntersectionObserver (intersection)="onIntersection($event)"></div>
```

## ExponentiallyBackoff Function

`ExponentiallyBackoff` is a function that implements exponential backoff in observables.

### Usage

This function takes four parameters:

- `maxRetryAttempts`: The maximum number of retry attempts. Default is 3.
- `initialDelay`: The initial delay in milliseconds before the first retry. Default is 1000.
- `maxDelay`: The maximum delay in milliseconds between retries. Default is 2 minutes.
- `disableAndUseConstantDelayOf`: If provided, disables exponential backoff and uses this constant delay instead.

It returns a function that takes an Observable and returns an Observable with retry logic applied.

Here's an example:

```typescript
ExponentiallyBackoff(10, 1000, 2 * 60 * 1000, 5000);
```

## TimeoutBackoff Function

`TimeoutBackoff` is a function that implements timeout backoff in observables.

### Usage

This function takes three parameters:

- `maxRetryAttempts`: The maximum number of retry attempts. Default is 3.
- `initialDelay`: The initial delay in milliseconds before the first retry. Default is 1000.
- `maxDelay`: The maximum delay in milliseconds between retries. Default is 2 minutes.

It returns a function that takes an Observable and returns an Observable with retry logic applied.

Here's an example:

```typescript
TimeoutBackoff(10, 1000, 2 * 60 * 1000);
```

## Service worker classes

- `CustomEventWorker` A class that helps create and listen to custom events.
- `PollingWorker` A class that helps create and manage polling tasks.
- `ServerSentEventWorker` A class that helps listen to server-sent events.
- `StoreWorker` A class that helps manage data flow using the Redux pattern.
- `SubscriptionWorker` A class that helps manage subscriptions to observables.
- `WebsocketWorker` A class that helps send/read messages to/from a websocket connections.

### Usage

When bootstrapping each class, it is best to use the provided `PROVIDER_FACTORY` helpers.

#### CustomEventWorker

````typescript
const workerInjectionToken = new InjectionToken<CustomEventWorker<T>>('worker');
providers: [
  CUSTOM_EVENT_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<CustomEventWorker<T>>('worker');
providers: [
  CUSTOM_EVENT_PROVIDER_FACTORY(workerInjectionToken, {
    replySubjectBufferSize: 1,
    windowObjectInjectionToken: CUSTOM_EVENT_WINDOW_OBJECT,
    windowObject: window
  }),
]
````

##### Example

````typescript
customEventWorker.DispatchCustomEvent(window, 'type', data);
````

````typescript
customEventWorker.DispatchCustomEvent(window, 'type', data);
````

````typescript
customEventWorker.dispatch(data);
````

````typescript
customEventWorker.dispatch(data, eventInitDict);
````

````typescript
customEventWorker.listen$();
````

````typescript
customEventWorker.listen$((data: T) => data.key === 'value');
````

````typescript
customEventWorker.listen$(
  (data: T) => data.key === 'value',
  (prev: T, curr: T) => prev.key === curr.key
);
````

````typescript
customEventWorker.listen$().pipe(
  filter((data: T) => data.key === 'value')
);
````

#### PollingWorker

````typescript
const workerInjectionToken = new InjectionToken<PollingWorker<T>>('worker');
providers: [
  POLLING_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<PollingWorker<T>>('worker');
providers: [
  POLLING_PROVIDER_FACTORY(workerInjectionToken, {
    windowObjectInjectionToken: POLLING_WINDOW_OBJECT,
    windowObject: window
  }),
]
````

##### Example

````typescript
pollingWorker.startPolling(url);
````

````typescript
pollingWorker.startPolling(url, 1000);
````

````typescript
pollingWorker.startPolling(url, 1000, (data: T) => data.key === 'value');
````

````typescript
pollingWorker.startPolling(
  url,
  1000,
  (data: T) => data.key === 'value',
  (prev: T, curr: T) => prev.key === curr.key
);
````

````typescript
pollingWorker.startPolling(url, 1000).pipe(
  filter((data: T) => data.key === 'value')
);
````

#### ServerSentEventWorker

````typescript
const workerInjectionToken = new InjectionToken<ServerSentEventWorker<T>>('worker');
providers: [
  SERVER_SENT_EVENT_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<ServerSentEventWorker<T>>('worker');
providers: [
  SERVER_SENT_EVENT_PROVIDER_FACTORY(workerInjectionToken, {
    windowObjectInjectionToken: SERVER_SENT_EVENT_WINDOW_OBJECT,
    windowObject: window
  }),
]
````

##### Example

````typescript
serverSentEventWorker.connect();
````

````typescript
serverSentEventWorker.listen$();
````

````typescript
serverSentEventWorker.listen$((data: T) => data.key === 'value');
````

````typescript
serverSentEventWorker.listen$(
  (data: T) => data.key === 'value',
  (prev: T, curr: T) => prev.key === curr.key
);
````

````typescript
serverSentEventWorker.listen$().pipe(
  filter((data: T) => data.key === 'value')
);
````

#### StoreWorker

````typescript
const workerInjectionToken = new InjectionToken<StoreWorker<T>>('worker');
providers: [
  STORE_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<StoreWorker<T>>('worker');
providers: [
  STORE_PROVIDER_FACTORY(workerInjectionToken, {
    windowObjectInjectionToken: STORE_WINDOW_OBJECT,
    windowObject: window
  }),
]
````

#### SubscriptionWorker

````typescript
const workerInjectionToken = new InjectionToken<SubscriptionWorker<T>>('worker');
providers: [
  SUBSCRIPTION_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<SubscriptionWorker<T>>('worker');
providers: [
  SUBSCRIPTION_PROVIDER_FACTORY(workerInjectionToken, {
    windowObjectInjectionToken: SUBSCRIPTION_WINDOW_OBJECT,
    windowObject: window
  }),
]
````

##### Example

````typescript
subscriptionWorker.add(subscriptionLike);
````

````typescript
subscriptionWorker.unsubscribe();
````

````typescript
subscriptionWorker.map('key', subscriptionLike);
````

````typescript
subscriptionWorker.unsubscribeMapped('key');
````

````typescript
subscriptionWorker.unsubscribeAllMapped();
````

#### WebsocketWorker

````typescript
const workerInjectionToken = new InjectionToken<WebsocketWorker<T>>('worker');
providers: [
  WEBSOCKET_PROVIDER_FACTORY(workerInjectionToken)
]
````

````typescript
const workerInjectionToken = new InjectionToken<WebsocketWorker<T>>('worker');
providers: [
  WEBSOCKET_PROVIDER_FACTORY(workerInjectionToken, {
    windowObjectInjectionToken: WEBSOCKET_WINDOW_OBJECT,
    windowObject: window
  }),
]
````
