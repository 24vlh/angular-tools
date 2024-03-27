import { Routes } from '@angular/router';
import { WsComponent } from './ws/ws.component';
import { SseComponent } from './sse/sse.component';
import { StoreComponent } from './store/store.component';

export const routes: Routes = [
  {
    path: 'ws',
    loadComponent: () => WsComponent
  },
  {
    path: 'sse',
    component: SseComponent
  },
  {
    path: 'store',
    component: StoreComponent
  }
];
