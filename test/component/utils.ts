export function dispatchEvent(
  document: Document,
  target: Element,
  type: string = 'mousedown',
  pageX: number = 100,
  pageY: number = 100,
  clientX: number = 100,
  clientY: number = 100,
  button: number = 1) {
  const evt = document.createEvent('MouseEvents');
  (evt as any).pageX = pageX;
  (evt as any).pageY = pageY;
  evt.initMouseEvent(type,
    true, true, document.defaultView, 0, 0, 0, clientX, clientY, false, false, false, false, button, null);
  target.dispatchEvent(evt);
  return evt;
}
