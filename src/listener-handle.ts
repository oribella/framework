import { Gesture } from './gesture';
import { Listener } from './listener';
import { Options } from './utils';

export class ListenerHandle<T extends typeof Gesture> {
  constructor(public Type: T, public element: Element, public listener: Partial<Listener<& Options>>) { }
}
