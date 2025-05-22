export interface SelectOptions<R> {
  filterCallback?: (data: R) => boolean;
  comparerCallback?: (prev: R, curr: R) => boolean;
  notSetValue?: R;
}
