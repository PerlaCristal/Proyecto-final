import { Obj3D } from './Obj3D.js';

export abstract class Canvas3D extends HTMLCanvasElement{
  abstract getObj():Obj3D ;
  abstract setObj(obj: Obj3D): void;
  abstract paint( g: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
}