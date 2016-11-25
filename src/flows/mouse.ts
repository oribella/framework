import {Flow, StartConfig, UpdateConfig, EndConfig, CancelConfig} from '../flow';
import {Point} from '../point';

export class MouseFlow extends Flow {
  constructor(element: Element) {
    super({
      element: element,
      start: new StartConfig('mousedown'),
      update: new UpdateConfig('mousemove'),
      end: new EndConfig('mouseup'),
      cancel: new CancelConfig('dragstart', 'contextmenu')
    });
  }
  setPointers(event: MouseEvent) {
    switch (event.type) {
      case "mousedown":
      case "mousemove":
        const page = new Point(event.pageX, event.pageY);
        const client = new Point(event.clientX, event.clientY);
        this.allPointers.set('1', { page: page, client: client });
        this.currentPointers.set('1', { page: page, client: client });
        break;
      default:
        this.allPointers.clear();
        break;
    }
  }
}
