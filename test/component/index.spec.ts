// import {expect} from 'chai';
// import * as sinon from 'sinon';
// import {Oribella} from '../../src/oribella';
// // import {PointerData, RETURN_FLAG, GestureOptions} from '../../src/utils';
// import {DefaultGesture} from '../../src/default-gesture';
// // import {Point} from '../../src/point';
// import {jsdom} from 'jsdom';

// // class Tap extends DefaultGesture {
//   // public static options: TapOptions;
//   // private startPoint: Point = new Point(0, 0);

//   // public start(/*evt: Event, pointers: PointerData[]*/): number {
//     // this.startPoint = pointers[0].page;
//     // console.log(pointers); //tslint:disable-line
//     // const result = this.listener.start(evt, { pointers }, this.target);
//     // return RETURN_FLAG.map(result) + RETURN_FLAG.START_EMITTED;
//   // }
//   // public update(/*evt: Event, pointers: PointerData[]*/): number {
//     // const p = pointers[0].page;
//     // tslint:disable-next-line:no-empty
//     // if (p.distanceTo(this.startPoint) > this.listener.radiusThreshold) {

//     // }
//     // return 0;
// // }

// function dispatchEvent(
//   document: Document,
//   target: Element,
//   type: string = 'mousedown',
//   pageX: number = 100,
//   pageY: number = 100,
//   clientX: number = 100,
//   clientY: number = 100,
//   button: number = 1) {
//   const evt = document.createEvent('MouseEvents');
//   (evt as any).pageX = pageX;
//   (evt as any).pageY = pageY;
//   evt.initMouseEvent(type,
//   true, true, document.defaultView, 0, 0, 0, clientX, clientY, false, false, false, false, button, null);
//   target.dispatchEvent(evt);
//   return evt;
// }

// describe.skip('Scenario', () => {
//   let sandbox: Sinon.SinonSandbox;
//   let instance: Oribella;
//   let msPointerEnabled = false;
//   let pointerEnabled = false;
//   const html = `
//     <html>
//       <body>
//         <div>
//           <div></div>
//           <div>
//             <div class="target"></div>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;
//   let document: Document;
//   let target: Element | null;
//   let listener: any;

//   beforeEach(() => {
//     sandbox = sinon.sandbox.create();
//     document = jsdom(html);
//     const g = global as any;
//     g.window = {
//       ontouchstart: '',
//       document,
//       navigator: {
//         msPointerEnabled,
//         pointerEnabled
//       }
//     };
//     instance = new Oribella();
//     instance.registerDefaultFlowStrategy();
//     instance.registerGesture(Tap);
//     instance.activate();
//     listener = {
//       start: sandbox.spy()
//     };
//   });

//   afterEach(() => {
//     instance.deactivate();
//     sandbox.restore();
//   });

//   it('hepp', () => {
//     target = document.querySelector('.target');
//     if (!target) {
//       throw new Error(`target not found ${html}`);
//     }
//     instance.on(DefaultGesture, target, {});
//     const evt = dispatchEvent(document, target);
//     expect(listener.start).to.have.been.calledWithExactly(evt, {}, target);
//   });
// });
