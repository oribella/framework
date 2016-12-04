import {Point} from './point';

export function getOwnPropertyDescriptors(src: {} = {}) {
  const descriptors: { [key: string]: any } = {};
  Object.keys(src).forEach((key: string) => descriptors[key] = Object.getOwnPropertyDescriptor(src, key));
  return descriptors;
}

export const GESTURE_STRATEGY_FLAG = {
  KEEP: 0,
  REMOVE_IF_POINTERS_GT: 1
};

export const STRATEGY_RETURN_FLAG = {
  CALL: 1,
  REMOVE: 2
};

export const RETURN_FLAG = {
  map(result: number|boolean) {
    switch (result) {
    case true:
      result = this.REMOVE_OTHERS;
      break;
    case false:
      result = this.REMOVE;
      break;
    case 1:
    case 2:
    case 4:
      break;
    default:
      result = 0;
    }

    return result;
  },
  IDLE: 0,
  START_EMITTED: 1,
  REMOVE: 2,
  REMOVE_OTHERS: 4,
  REMOVE_AND_CONTINUE: 8
};

export function isMouse(supports: any, evt: any) {
  if (supports.MSPointerEvent && evt.pointerType === evt.MSPOINTER_TYPE_MOUSE) { //IE10
    return true;
  }
  if (supports.PointerEvent && evt.pointerType === 'mouse') { //IE11
    return true;
  }
  if (evt.type.indexOf('mouse') !== -1) {
    return true;
  }
  return false;
}

export function isValidMouseButton(evt: MouseEvent, allowedBtn: Array<number>|number) {
  const btn = evt.button;
  const which = evt.which;
  let  actualBtn: number;

  actualBtn = (!which && btn !== undefined) ?
                (btn & 1 ? 1 : (btn & 2 ? 3 : (btn & 4 ? 2 : 0))) :
                which;
  return Array.isArray(allowedBtn) ? allowedBtn.some(function (val) {
    return actualBtn === val;
  }) : actualBtn === allowedBtn;
}

export type PointerMap = Map<string, Pointer>
export type Pointers = { all: PointerMap, changed: PointerMap }
export type Pointer = { page: Point, client: Point }
