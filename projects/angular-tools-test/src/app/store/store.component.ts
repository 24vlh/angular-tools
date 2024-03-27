import { Component } from '@angular/core';
import {
  STORE_PROVIDER_FACTORY,
  StoreWorker
} from '../../../../angular-tools/src/lib/workers';
import { Store } from './store.interface';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-store',
  standalone: true,
  providers: [
    STORE_PROVIDER_FACTORY<Store>(
      { name: null, value: null, object: null },
      StoreWorker
    )
  ],
  imports: [JsonPipe, AsyncPipe],
  templateUrl: './store.component.html'
})
export class StoreComponent {
  content: Store | null = null;

  constructor(public store: StoreWorker<Store>) {
    this.content = store.state;
  }

  replaceState(): void {
    this.store.resetWithState({
      name: 'John Doe',
      value: 'Hello World',
      object: { key: 'value' }
    });
  }

  replaceName(): void {
    this.store.set<'name'>('name', 'John Doe');
  }

  state(): void {
    this.content = this.store.state;
  }
}
