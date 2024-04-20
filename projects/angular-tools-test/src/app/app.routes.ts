import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ws',
    loadComponent: () => import('./ws/ws.component').then((m) => m.WsComponent)
  },
  {
    path: 'sse',
    loadComponent: () =>
      import('./sse/sse.component').then((m) => m.SseComponent)
  },
  {
    path: 'store',
    loadComponent: () =>
      import('./store/store.component').then((m) => m.StoreComponent)
  },
  {
    path: 'http',
    loadComponent: () =>
      import('./http/http.component').then((m) => m.HttpComponent)
  }
];
