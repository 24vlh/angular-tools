import { Component, OnDestroy } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
  HttpResponse
} from '@angular/common/http';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  HttpRequestFactory,
  HttpSubmitFactory
} from '../../../../angular-tools/src/lib/helpers';
import {
  SUBSCRIPTION_WORKER_PROVIDER,
  SubscriptionWorker
} from '../../../../angular-tools/src/lib/workers';

@Component({
  selector: 'app-http',
  standalone: true,
  providers: [SUBSCRIPTION_WORKER_PROVIDER],
  imports: [HttpClientModule, ReactiveFormsModule],
  templateUrl: './http.component.html'
})
export class HttpComponent implements OnDestroy {
  form = this.fb.group({
    title: new FormControl(''),
    file: new FormControl(null as FileList | null)
  });
  httpSubmitFactory = HttpSubmitFactory(this.http, {
    url: 'http://localhost',
    options: {
      headers: new HttpHeaders()
    }
  });
  httpRequestFactory = HttpRequestFactory(
    this.http,
    'http://localhost/upload',
    'POST'
  );

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private subSink: SubscriptionWorker
  ) {
    this.subSink.add(
      this.httpSubmitFactory.request$.subscribe((response) => {
        if (response instanceof HttpResponse) {
          console.log(response.body);
        }
      }),
      this.httpRequestFactory.request$.subscribe((response) => {
        if (response instanceof HttpResponse) {
          console.log(response.body);
        }
      })
    );
  }

  get data(): FormData {
    const formData: FormData = new FormData();

    Object.keys(this.form.value).forEach((key: string): void => {
      formData.append(key, this.form.get(key)?.value as string);
    });

    const files: FileList | null | undefined = this.form.get('file')?.value;

    if (files) {
      for (const file of Array.from(files)) {
        formData.append('file', file);
      }
    }

    return formData;
  }

  handle(event: Event): void {
    this.form.patchValue({ file: (event.target as HTMLInputElement).files });
  }

  post(): void {
    this.httpSubmitFactory.post(this.form.value);
  }

  put(): void {
    this.httpSubmitFactory.put(this.form.value);
  }

  patch(): void {
    this.httpSubmitFactory.patch(this.form.value);
  }

  upload(): void {
    this.httpRequestFactory.submit(this.data);
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
