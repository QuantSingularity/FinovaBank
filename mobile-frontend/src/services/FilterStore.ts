/**
 * FilterStore
 *
 * Solves the React Navigation limitation where functions cannot be passed
 * as route params (they are not serialisable).
 *
 * Usage:
 *   // In the caller screen, before navigating:
 *   const key = FilterStore.register((filter) => { ... });
 *   navigation.navigate('TransactionFilters', { filterKey: key, currentFilter });
 *
 *   // In TransactionFiltersScreen, on apply:
 *   FilterStore.call(filterKey, appliedFilter);
 */

type FilterCallback = (filter: {
  startDate: string;
  endDate: string;
  type?: string;
}) => void;

const _store = new Map<string, FilterCallback>();
let _counter = 0;

export const FilterStore = {
  register(cb: FilterCallback): string {
    const key = `filter_${++_counter}_${Date.now()}`;
    _store.set(key, cb);
    return key;
  },

  call(
    key: string,
    filter: { startDate: string; endDate: string; type?: string }
  ) {
    const cb = _store.get(key);
    if (cb) {
      cb(filter);
      _store.delete(key);
    }
  },

  unregister(key: string) {
    _store.delete(key);
  },
};
