import {
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

/**
 * `IntersectionObserverDirective` is a directive that implements the Intersection Observer API.
 * It emits an event each time the host element intersects with the viewport.
 *
 * @export
 * @class IntersectionObserverDirective
 * @implements {OnInit}
 * @implements {OnDestroy}
 * @example
 *  <div vlhIntersectionObserver (intersection)="onIntersection($event)"></div>
 *  // => The IntersectionObserverDirective is applied to the div element.
 *  // => The onIntersection method is called each time the div element intersects with the viewport.
 *  // => The event object is passed to the onIntersection method.
 *  // => The event object contains information about the intersection.
 *  // => The IntersectionObserverDirective is a standalone directive.
 *  // => The IntersectionObserverDirective is used to implement the Intersection Observer API.
 *  // => The IntersectionObserverDirective emits an event each time the host element intersects with the viewport.
 */
@Directive({
  selector: '[vlhIntersectionObserver]',
  standalone: true
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Output() intersection: EventEmitter<IntersectionObserverEntry> =
    new EventEmitter<IntersectionObserverEntry>();
  public observer?: IntersectionObserver;

  /**
   * @param {ElementRef<HTMLElement>} el - A wrapper around a native element inside a View.
   */
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
          if (entry.isIntersecting) {
            this.intersection.emit(entry);
          }
        });
      }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
