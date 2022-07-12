import { Canvas3D } from './Canvas3D.js';
import { Obj3D } from './Obj3D.js';
import { Point2D } from './Point2D.js';
import { Dimension } from './Dimension.js';
import { Polygon3D } from './Polygon3D.js';
import { Point3D } from './Point3D.js';

export class CvWireframe{ // extends Canvas3D
  private maxX: number; maxY: number; centerX: number; centerY: number;
  private obj: Obj3D ;
  private imgCenter: Point2D;
  private g: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.g = g;
    this.canvas = canvas;
  }

  getObj(): Obj3D {return this.obj;}
  setObj(obj: Obj3D ):void {this.obj = obj;}
  iX(x: number): number{return Math.round(this.centerX + x - this.imgCenter.x);}
  iY(y: number): number{ return Math.round(this.centerY - y + this.imgCenter.y); }


  paint( ): void{ //g: CanvasRenderingContext2D, canvas: HTMLCanvasElement
    if (this.obj == undefined) return;
      
    let polyList:Array<Polygon3D> = this.obj.getPolyList();
    if (polyList ==undefined) return;
    
    let nFaces = polyList.length;
    
    if (nFaces == 0) return;
      
    let dim: Dimension = new Dimension(this.canvas.width, this.canvas.height);
    this.canvas.width=this.canvas.width;
    this.maxX = dim.width - 1; this.maxY = dim.height - 1;
    this.centerX = this.maxX/2; this.centerY = this.maxY/2;
      // ze-axis towards eye, so ze-coordinates of
      // object points are all negative.
      // obj is a java object that contains all data:
      // - Vector w       (world coordinates)
      // - Array e        (eye coordinates)
      // - Array vScr     (screen coordinates)
      // - Vector polyList (Polygon3D objects)

      // Every Polygon3D value contains:
      // - Array 'nrs' for vertex numbers
      // - Values a, b, c, h for the plane ax+by+cz=h.
      // (- Array t (with nrs.length-2 elements of type Tria))

      this.obj.eyeAndScreen(dim);
            // Computation of eye and screen coordinates.

      this.imgCenter = this.obj.getImgCenter();
      this.obj.planeCoeff();    // Compute a, b, c and h.
      let e: Point3D[] = this.obj.getE();
      let vScr: Point2D[]  = this.obj.getVScr();

      //g.setColor(Color.black);

    for (let j = 0; j < nFaces; j++){
      let pol: Polygon3D = polyList[j];
      let nrs: number[] = pol.getNrs();
      if (nrs.length < 3)
          continue;
      for (let iA = 0; iA < nrs.length; iA++) {
        let iB = (iA + 1) % nrs.length;
        let na = Math.abs(nrs[iA]), nb = Math.abs(nrs[iB]);
            // abs in view of minus signs discussed in Section 6.4.
        let a: Point2D = vScr[na], b = vScr[nb];
        this.drawLine(this.g, this.iX(a.x), this.iY(a.y), this.iX(b.x), this.iY(b.y));
        }
      }
  }

  drawLine(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void{
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.closePath();
    g.stroke();
  }
}