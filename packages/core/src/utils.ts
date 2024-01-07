import { MinimalStore } from './types';

export const isStore = <T, S extends MinimalStore<T>>(value: T | S): value is S => {
  return typeof value === 'object'
    && value !== null
    && 'get' in value
    && 'subscribe' in value
    && typeof value.get === 'function'
    && typeof value.subscribe === 'function';
}
