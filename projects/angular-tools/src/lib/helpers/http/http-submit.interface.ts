import { HttpEvent, HttpRequest } from '@angular/common/http';

export interface HttpSubmitConfig<T> {
  url: string;
  onlyHttpResponses?: boolean;
  filterCallback?: (event: HttpEvent<unknown>) => boolean;
  options?: Partial<HttpRequest<T>>;
  retryCount?: number;
  postUrl?: string;
  postOptions?: Partial<HttpRequest<T>>;
  putUrl?: string;
  putOptions?: Partial<HttpRequest<T>>;
  patchUrl?: string;
  patchOptions?: Partial<HttpRequest<T>>;
}
