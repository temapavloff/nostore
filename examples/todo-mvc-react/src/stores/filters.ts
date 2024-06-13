import { createRecord } from '@nostore/core';

type Filters = {
  completion: 'all' | 'active' | 'completed',
};

const storeDataToUrl = (data: Filters) => {
  const usp = new URLSearchParams();
  if (data.completion !== 'all') {
    usp.set('completion', data.completion);
  }
  return usp;
}

const urlToStoreData = (usp: URLSearchParams): Filters => {
  return {
    completion: usp.get('completion') as Filters['completion'] || 'all',
  };
}

export const filters = createRecord(urlToStoreData(new URLSearchParams(window.location.search)));

filters.subscribe(newValue => {
  const url = new URL(window.location.href);
  url.search = String(storeDataToUrl(newValue));
  window.history.pushState({}, '', url);
}, true);

export const updateFilters = (f: Partial<Filters>) => {
  filters.set({ ...filters.get(), ...f });
};
