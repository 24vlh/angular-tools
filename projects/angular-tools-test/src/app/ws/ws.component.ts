import { Component } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  WEBSOCKET_PROVIDER_FACTORY,
  WebsocketWorker
} from '../../../../angular-tools/src/lib/workers';

@Component({
  selector: 'app-ws',
  standalone: true,
  providers: [
    WEBSOCKET_PROVIDER_FACTORY<Record<string, unknown>>('ws://localhost:8080')
  ],
  imports: [NgIf, NgForOf, NgClass],
  templateUrl: './ws.component.html'
})
export class WsComponent {
  items: Record<string, unknown>[] = [];
  subscription: Subscription | null = null;

  constructor(private ws: WebsocketWorker<Record<string, unknown>>) {}

  get connected(): boolean {
    return !this.ws.isDisconnected;
  }

  start(): void {
    if (this.ws.isDisconnected) {
      this.connect();
    }
    if (!this.subscription) {
      this.subscription = this.ws
        .listen<Record<string, unknown>>()
        .subscribe((data: Record<string, unknown>): void => {
          this.items.push(data);
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
    this.ws.connect();
  }

  disconnect(): void {
    this.stop();
    this.ws.disconnect();
  }
}
