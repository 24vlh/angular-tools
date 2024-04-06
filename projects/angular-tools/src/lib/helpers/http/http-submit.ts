import {
  distinctUntilChanged,
  filter,
  merge,
  Observable,
  retry,
  Subject,
  switchMap
} from 'rxjs';
import {
  HttpClient,
  HttpEvent,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { HttpSubmitConfig } from './http-submit.interface';
import { EmptyString, OfTrueType, OfUndefinedType } from '@24vlh/ts-assert';

export const HttpRequestFactory = <T>(
  http: HttpClient,
  url: string,
  type: 'POST' | 'PUT' | 'PATCH',
  options?: HttpRequest<T>,
  retryCount = 3,
  onlyHttpResponses?: boolean
) => {
  if (EmptyString(url)) {
    throw new Error('URL is required');
  }

  const subject: Subject<T> = new Subject<T>();
  const observable: Observable<T> = subject.asObservable();

  const filterCallback =
    OfUndefinedType(onlyHttpResponses) || OfTrueType(onlyHttpResponses)
      ? (event: HttpEvent<unknown>): boolean => event instanceof HttpResponse
      : (): boolean => true;

  return {
    submit: (data: T) => subject.next(data),
    request$: observable.pipe(
      distinctUntilChanged(),
      switchMap((data: T) => {
        const req: HttpRequest<T> = new HttpRequest<T>(
          type,
          url,
          data,
          options
        );
        return http.request(req).pipe(retry(retryCount));
      }),
      filter(filterCallback)
    )
  };
};

export const HttpSubmitFactory = <T>(
  http: HttpClient,
  configs: HttpSubmitConfig<T>
) => {
  if (EmptyString(configs.url)) {
    throw new Error('URL is required');
  }

  configs.filterCallback =
    OfUndefinedType(configs.onlyHttpResponses) ||
    OfTrueType(configs.onlyHttpResponses)
      ? (event: HttpEvent<unknown>): boolean => event instanceof HttpResponse
      : (): boolean => true;

  const postSubject: Subject<T> = new Subject<T>();
  const putSubject: Subject<T> = new Subject<T>();
  const patchSubject: Subject<T> = new Subject<T>();

  const postObservable: Observable<T> = postSubject.asObservable();
  const putObservable: Observable<T> = putSubject.asObservable();
  const patchObservable: Observable<T> = patchSubject.asObservable();

  return {
    post: (data: T) => postSubject.next(data),
    put: (data: T) => putSubject.next(data),
    patch: (data: T) => patchSubject.next(data),
    request$: merge(
      postObservable.pipe(
        distinctUntilChanged(),
        switchMap((data: T) => {
          const req: HttpRequest<T> = new HttpRequest<T>(
            'POST',
            configs.postUrl ?? configs.url,
            data,
            configs.postOptions ?? configs.options ?? {}
          );
          return http.request(req).pipe(retry(configs.retryCount ?? 3));
        })
      ),
      putObservable.pipe(
        distinctUntilChanged(),
        switchMap((data: T) => {
          const req: HttpRequest<T> = new HttpRequest<T>(
            'PUT',
            configs.putUrl ?? configs.url,
            data,
            configs.putOptions ?? configs.options ?? {}
          );
          return http.request(req).pipe(retry(configs.retryCount ?? 3));
        })
      ),
      patchObservable.pipe(
        distinctUntilChanged(),
        switchMap((data: T) => {
          const req: HttpRequest<T> = new HttpRequest<T>(
            'PATCH',
            configs.patchUrl ?? configs.url,
            data,
            configs.patchOptions ?? configs.options ?? {}
          );
          return http.request(req).pipe(retry(configs.retryCount ?? 3));
        })
      )
    ).pipe(filter(configs.filterCallback))
  };
};
