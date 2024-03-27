import { Component } from '@angular/core';
import {
  SERVER_EVENT_SENT_PROVIDER_FACTORY,
  ServerSentEvent,
  ServerSentEventWorker
} from '../../../../angular-tools/src/lib/workers';
import { map, Subscription } from 'rxjs';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { SseRecord } from './see.interface';
import { LOGO_BASE64 } from '../app.constant';

@Component({
  selector: 'app-sse',
  standalone: true,
  providers: [
    SERVER_EVENT_SENT_PROVIDER_FACTORY(
      'http://localhost:3000/events',
      undefined,
      ServerSentEventWorker
    )
  ],
  imports: [NgIf, NgForOf, NgClass],
  templateUrl: './sse.component.html'
})
export class SseComponent {
  items: SseRecord[] = [];
  subscription: Subscription | null = null;
  protected readonly logoBase64: string = LOGO_BASE64;

  constructor(private sse: ServerSentEventWorker<SseRecord>) {}

  get connected(): boolean {
    return !this.sse.isDisconnected;
  }

  start(): void {
    if (this.sse.isDisconnected) {
      this.connect();
    }

    if (!this.subscription) {
      this.subscription = this.sse
        .listen$<ServerSentEvent<SseRecord, MessageEvent<string>>>()
        .pipe(
          map(
            (
              event: ServerSentEvent<SseRecord, MessageEvent<string>>
            ): SseRecord => event.data
          )
        )
        .subscribe((record: SseRecord): void => {
          this.items.push(record);
        });
    }
  }

  stop(): void {
    if (this.subscription) {
      this.items = [];
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  connect(): void {
    this.sse.connect();
  }

  disconnect(): void {
    this.stop();
    this.sse.disconnect();
  }
}
