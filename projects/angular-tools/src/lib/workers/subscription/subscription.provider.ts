import { FactoryProvider } from '@angular/core';
import { SubscriptionWorker } from './subscription.worker';

/**
 * Factory function to create a provider for the subscription worker
 *
 * @returns {FactoryProvider} - The created provider.
 * @example
 *  providers: [SUBSCRIPTION_WORKER_PROVIDER]
 *  // => Provides the subscription worker.
 */
export const SUBSCRIPTION_WORKER_PROVIDER: FactoryProvider = {
  provide: SubscriptionWorker,
  useFactory: () => {
    return new SubscriptionWorker();
  }
};
