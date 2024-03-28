import { SubscriptionLike } from 'rxjs';
import { NotEmptyArray, OfObjectType } from '@24vlh/ts-assert';

/**
 * `SubscriptionWorker` is a service class that manages subscriptions.
 * It provides methods to add, map, and unsubscribe from subscriptions.
 * It also provides methods to manage mapped subscriptions.
 */
export class SubscriptionWorker {
  private subs: Set<SubscriptionLike> = new Set<SubscriptionLike>();
  private mappedSubs: Map<string, SubscriptionLike> = new Map<
    string,
    SubscriptionLike
  >();

  /**
   * Get subscriptions.
   *
   * @returns {IterableIterator<SubscriptionLike>} - The subscriptions.
   * @example
   *  subscriptionWorker.subscriptions;
   *  // => Returns the subscriptions.
   */
  get subscriptions(): IterableIterator<SubscriptionLike> {
    return this.subs.values();
  }

  /**
   * Get mapped subscriptions.
   *
   * @returns {Map<string, SubscriptionLike>} - The mapped subscriptions.
   * @example
   *  subscriptionWorker.mappedSubscriptions;
   *  // => Returns the mapped subscriptions.
   */
  get mappedSubscriptions(): Map<string, SubscriptionLike> {
    return this.mappedSubs;
  }

  /**
   * Set a subscription.
   *
   * @param {SubscriptionLike} sub - The subscription to be set.
   * @example
   *  subscriptionWorker.sink = sub;
   *  // => Sets the subscription to the subs array.
   */
  set sink(sub: SubscriptionLike) {
    if (this.UnmanagedSubscription(sub)) {
      this.subs.add(sub);
    }
  }

  /**
   * Add subscriptions.
   *
   * @param {...SubscriptionLike[]} subs - The subscriptions to be added.
   * @returns {void}
   * @example
   *  subscriptionWorker.add(sub1, sub2);
   *  // => Adds the subscriptions to the subs array.
   */
  add(...subs: SubscriptionLike[]): void {
    if (NotEmptyArray(subs)) {
      this.subs = new Set([
        ...this.subs,
        ...subs.filter((sub: SubscriptionLike) => {
          return this.UnmanagedSubscription(sub);
        })
      ]);
    }
  }

  /**
   * Unsubscribe from all subscriptions.
   *
   * @returns {void}
   * @example
   *  subscriptionWorker.unsubscribe();
   *  // => Unsubscribes from all subscriptions.
   */
  unsubscribe(): void {
    this.subs.forEach((sub: SubscriptionLike): void => {
      this.Unsubscribe(sub);
    });
    this.subs.clear();
  }

  /**
   * Map a subscription.
   *
   * @param {string} key - The key to map the subscription.
   * @param {SubscriptionLike} sub - The subscription to be mapped.
   * @returns {void}
   * @example
   *  subscriptionWorker.map('key', sub);
   *  // => Maps the subscription to the mappedSubs map.
   */
  map(key: string, sub: SubscriptionLike): void {
    if (this.UnmappedSubscription(sub)) {
      this.mappedSubs.set(key, sub);
    }
  }

  /**
   * Unsubscribe from a mapped subscription.
   *
   * @param {string} key - The key of the mapped subscription.
   * @returns {void}
   * @example
   *  subscriptionWorker.unsubscribeMapped('key');
   *  // => Unsubscribes from the mapped subscription.
   */
  unsubscribeMapped(key: string): void {
    const sub: SubscriptionLike | undefined = this.mappedSubs.get(key);
    if (sub) {
      this.Unsubscribe(sub);
      this.mappedSubs.delete(key);
    }
  }

  /**
   * Unsubscribe from all mapped subscriptions.
   *
   * @returns {void}
   * @example
   *  subscriptionWorker.unsubscribeAllMapped();
   *  // => Unsubscribes from all mapped subscriptions.
   */
  unsubscribeAllMapped(): void {
    this.mappedSubs.forEach((sub: SubscriptionLike): void => {
      this.Unsubscribe(sub);
    });
    this.mappedSubs.clear();
  }

  /**
   * Checks if the provided subscription is not managed.
   * A subscription is considered not managed if it is of type SubscriptionLike and is not included in the subs set.
   *
   * @param {unknown} sub - The subscription to be checked.
   * @returns {sub is SubscriptionLike} - Returns true if the subscription is not managed, false otherwise.
   * @example
   *  subscriptionWorker.UnmanagedSubscription(sub);
   *  // => Returns true if the subscription is not managed.
   */
  UnmanagedSubscription = (sub: unknown): sub is SubscriptionLike => {
    return this.OfSubscriptionLikeType(sub) && !this.subs.has(sub);
  };

  /**
   * Checks if the provided subscription is of type SubscriptionLike.
   *
   * @param {unknown} sub - The subscription to be checked.
   * @returns {sub is SubscriptionLike} - Returns true if the subscription is of type SubscriptionLike, false otherwise.
   * @example
   *  subscriptionWorker.OfSubscriptionLikeType(sub);
   *  // => Returns true if the subscription is of type SubscriptionLike.
   */
  OfSubscriptionLikeType = (sub: unknown): sub is SubscriptionLike => {
    return (
      OfObjectType<SubscriptionLike>(sub) &&
      typeof sub.unsubscribe === 'function'
    );
  };

  /**
   * Checks if the provided subscription is not mapped.
   * A subscription is considered not mapped if it is of type SubscriptionLike and is not included in the mappedSubs map.
   *
   * @param {unknown} sub - The subscription to be checked.
   * @returns {boolean} - Returns true if the subscription is not mapped, false otherwise.
   * @example
   *  subscriptionWorker.UnmappedSubscription(sub);
   *  // => Returns true if the subscription is not mapped.
   */
  UnmappedSubscription = (sub: unknown): boolean => {
    return (
      this.OfSubscriptionLikeType(sub) &&
      Array.from(this.mappedSubs.values()).every(
        (mappedSub: SubscriptionLike): boolean => {
          return mappedSub !== sub;
        }
      )
    );
  };

  /**
   * Unsubscribe from a subscription.
   *
   * @param {SubscriptionLike} sub - The subscription to be unsubscribed.
   * @returns {void}
   * @example
   *  subscriptionWorkerUnsubscribe(sub);
   *  // => Unsubscribes from the subscription.
   */
  Unsubscribe = (sub: SubscriptionLike): void => {
    try {
      sub.unsubscribe();
    } catch (error: unknown) {
      console.error(`Failed to unsubscribe: ${String(error)}`);
    }
  };
}
