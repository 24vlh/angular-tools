import { SubscriptionLike } from 'rxjs';
import { NotEmptyArray, OfObjectType } from '@24vlh/ts-assert';
import { Injectable } from '@angular/core';

/**
 * `SubscriptionWorker` is a service class that manages subscriptions.
 * It provides methods to add, map, and unsubscribe from subscriptions.
 * It also provides methods to manage mapped subscriptions.
 */
@Injectable()
export class SubscriptionWorker {
  private subs = new Set<SubscriptionLike>();
  private mappedSubs = new Map<string, SubscriptionLike>();

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
    if (this.unmanagedSubscription(sub)) {
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
      subs.forEach((sub) => {
        if (this.unmanagedSubscription(sub)) {
          this.subs.add(sub);
        }
      });
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
    this.subs.forEach((sub) => this.unsubscribeOne(sub));
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
    if (this.unmappedSubscription(sub)) {
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
    const sub = this.mappedSubs.get(key);
    if (sub) {
      this.unsubscribeOne(sub);
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
    this.mappedSubs.forEach((sub) => this.unsubscribeOne(sub));
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
  private unmanagedSubscription(sub: unknown): sub is SubscriptionLike {
    return (
      this.ofSubscriptionLikeType(sub) &&
      !this.subs.has(sub as SubscriptionLike)
    );
  }

  /**
   * Checks if the provided subscription is of type SubscriptionLike.
   *
   * @param {unknown} sub - The subscription to be checked.
   * @returns {sub is SubscriptionLike} - Returns true if the subscription is of type SubscriptionLike, false otherwise.
   * @example
   *  subscriptionWorker.OfSubscriptionLikeType(sub);
   *  // => Returns true if the subscription is of type SubscriptionLike.
   */
  private ofSubscriptionLikeType(sub: unknown): sub is SubscriptionLike {
    return (
      OfObjectType<SubscriptionLike>(sub) &&
      typeof (sub as SubscriptionLike).unsubscribe === 'function'
    );
  }

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
  private unmappedSubscription(sub: unknown): boolean {
    return (
      this.ofSubscriptionLikeType(sub) &&
      !Array.from(this.mappedSubs.values()).includes(sub as SubscriptionLike)
    );
  }

  /**
   * Unsubscribe from a subscription.
   *
   * @param {SubscriptionLike} sub - The subscription to be unsubscribed.
   * @returns {void}
   * @example
   *  subscriptionWorker.Unsubscribe(sub);
   *  // => Unsubscribes from the subscription.
   */
  private unsubscribeOne(sub: SubscriptionLike): void {
    try {
      sub.unsubscribe();
    } catch (error) {
      console.error(`Failed to unsubscribe: ${String(error)}`);
    }
  }
}
