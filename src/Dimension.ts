export class Dimension{
  private _width: number;
  private _height: number;

  constructor(w: number, h: number) {
    this._width = w;
    this._height = h;
  }

  get width(): number{
    return this._width;
  }
  
  get height(): number{
    return this._height;
  }
}