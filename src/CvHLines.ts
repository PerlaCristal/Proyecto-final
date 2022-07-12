// CvHLines.java: Used in the file HLines.java.
import { Obj3D } from './Obj3D.js';
import { Point2D } from './Point2D.js';
import { Dimension } from './Dimension.js';

import { Polygon3D } from './Polygon3D.js';
import { Point3D } from './Point3D.js';
import { Tria } from './Tria.js'
import { Tools2D} from './Tools2D.js'

export class CvHLines{ // extends Canvas3D
  private maxX: number; maxY: number; centerX: number; centerY: number;
  private obj: Obj3D ;
  private imgCenter: Point2D;
  private g: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private nTria: number; nVertices: number;
  private tr:Array<Tria>;
  private refPol: number[];
  private connect:number[][];
  private nConnect:number[];
  private chunkSize = 4;
  private hLimit:number;
  //private Vector polyList;
  private polyList:Array<Polygon3D> 
  private maxScreenRange: number;
  
  constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.g = g;
    this.canvas = canvas;
  }

  getObj(): Obj3D { return this.obj; }
  setObj(obj: Obj3D ):void {this.obj = obj;}

  paint( ): void{ 
    if (this.obj == undefined) return;
    let polyList:Array<Polygon3D> = this.obj.getPolyList();
    if (polyList == undefined) return;
    let nFaces: number = polyList.length;
    if (nFaces == 0) return;
    let xe:number, ye:number, ze:number;
    let dim: Dimension = new Dimension(this.canvas.width, this.canvas.height);
    this.canvas.width=this.canvas.width;
    this.maxX = dim.width - 1; this.maxY = dim.height - 1;
    this.centerX = this.maxX/2; this.centerY = this.maxY/2;
      // ze-axis towards eye, so ze-coordinates of
      // object points are all negative. Since screen
      // coordinates x and y are used to interpolate for
      // the z-direction, we have to deal with 1/z instead
      // of z. With negative z, a small value of 1/z means
      // a small value of |z| for a nearby point.

      // obj is a java object that contains all data,
      // with w, e and vScr parallel (with vertex numbers
      // as index values):
      // - Vector w (with Point3D elements)
      // - Array e (with Point3D elements)
      // - Array vScr (with Point2D elements)
      // - Vector polyList (with Polygon3D elements)

      // Every Polygon3D value contains:
      // - Array 'nrs' for vertex numbers (n elements)
      // - Values a, b, c, h for the plane ax+by+cz=h.
      // - Array t (with n-2 elements of type Tria)

      // Every Tria value consists of the three vertex
      // numbers A, B and C.
      this.maxScreenRange = this.obj.eyeAndScreen(dim);
      this.imgCenter = this.obj.getImgCenter();
      this.obj.planeCoeff(); // Compute a, b, c and h.

      this.hLimit = -1e-6 * this.obj.getRho();
      this.buildLineSet();

      // Construct an array of triangles in
      // each polygon and count the total number 
      // of triangles.
      this.nTria = 0;
      for (let j=0; j<nFaces; j++){
        //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
        let pol: Polygon3D = polyList[j];
        if (pol.getNrs().length > 2 && pol.getH() <= this.hLimit){
          pol.triangulate(this.obj);
            this.nTria += pol.getT().length;
        }
      }
      this.tr = new Array(this.nTria); // Triangles of all polygons
      this.refPol = new Array(this.nTria); // tr[i] belongs to refPol[i]
      let iTria = 0;

      for (let j=0; j<nFaces; j++){
        //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
        let pol: Polygon3D = polyList[j];
        let t:Array<Tria> = pol.getT(); // Triangles of one polygon
        if (pol.getNrs().length > 2 && pol.getH() <= this.hLimit){
          for (let i=0; i<t.length; i++){
              let tri:Tria = t[i];
              this.tr[iTria] = tri;
              this.refPol[iTria++] = j;
          }
        }
      }
    
      let e: Point3D[] = this.obj.getE();
      let vScr: Point2D[]  = this.obj.getVScr();
      //Point3D[] e = obj.getE();
      //Point2D[] vScr = obj.getVScr();
      for (let i=0; i<this.nVertices; i++){
        for (let j=0; j<this.nConnect[i]; j++){
          let jj = this.connect[i][j];
          this.lineSegment(this.g, e[i], e[jj], vScr[i], vScr[jj], i, jj, 0);
        }
      }
      //hpgl = null;
  }
  

  buildLineSet():void{
     // Build the array
      // 'connect' of int arrays, where
      // connect[i] is the array of all
      // vertex numbers j, such that connect[i][j] is
      // an edge of the 3D object.
      this.polyList = this.obj.getPolyList(); 
      this.nVertices = this.obj.getVScr().length;
      this.connect = new Array(this.nVertices);
      this.nConnect =[];
      for (let i=0; i<this.nVertices; i++)
      this.nConnect[i] = 0;
      let nFaces = this.polyList.length;  //SEFUNDA REFERENCIA A POLYLIST

    for (let j = 0; j < nFaces; j++){
      //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
        let pol: Polygon3D = this.polyList[j]; //TERCERA REFERENCIA A POLYLIST
        let nrs:number[] = pol.getNrs();
        let n = nrs.length;
        if (n > 2 && pol.getH() > 0) continue;
        let ii = Math.abs(nrs[n-1]);
        for (let k = 0; k < n; k++) {
          let jj = nrs[k];
          if (jj < 0)
            jj = -jj; // abs
          else {
            let i1 = Math.min(ii, jj), j1 = Math.max(ii, jj),
                nCon = this.nConnect[i1];
              // Look if j1 is already present:
            let l:number;
            for (l=0; l<nCon; l++) if (this.connect[i1][l] == j1) break;
            if (l == nCon){ // Not found:
              if (nCon % this.chunkSize == 0) {
                let temp:number[] = new Array(nCon + this.chunkSize);
                for (l=0; l<nCon; l++) temp[l] = this.connect[i1][l];
                    this.connect[i1] = temp;
              }
              this.connect[i1][this.nConnect[i1]++] = j1;
              }
            }
            ii = jj;
          }
        }
  }
  
  iX(x: number): number{return Math.round(this.centerX + x - this.imgCenter.x);}
  iY(y: number): number{ return Math.round(this.centerY - y + this.imgCenter.y); }
    /*int iX(float x){return Math.round(centerX + x - imgCenter.x);}
    int iY(float y){return Math.round(centerY - y + imgCenter.y);}*/

  toString( t: number):string{
    // From screen device units (pixels) to HP-GL units (0-10000) :
      let i = Math.round(5000 + t * 9000/this.maxScreenRange); 
      let s:string = "";
      let n = 1000;
    for (let j = 3; j >= 0; j--){
      s += i / n;
      i %= n;
      n /= 10;
      }
      return s;
  }
  
  drawLine(g: CanvasRenderingContext2D, px1: number, py1: number, px2: number, py2: number): void{
    let x1 = this.iX(px1), y1 = this.iY(py1), x2 = this.iX(px2), y2 = this.iY(py2);
      if (x1 != x2 || y1 != y2) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.closePath();
        g.stroke();
      }
      //console.log("coord:",pScr.x, pScr.y, qScr.x, qScr.y )
    }

    lineSegment(g: CanvasRenderingContext2D,  p:Point3D, q:Point3D,
      pScr:Point2D, qScr:Point2D, iP:number, iQ:number, iStart:number):void{
      let u1 = qScr.x - pScr.x, u2 = qScr.y - pScr.y;
      let minPQx = Math.min(pScr.x, qScr.x);
      let maxPQx = Math.max(pScr.x, qScr.x);
      let minPQy = Math.min(pScr.y, qScr.y);
      let maxPQy = Math.max(pScr.y, qScr.y);
      let zP = p.z, zQ = q.z;    // p and q give eye-coordinates
      let minPQz = Math.min(zP, zQ);
      let e: Point3D[] = this.obj.getE();
      let vScr: Point2D[]  = this.obj.getVScr();
       //Point3D[] e = obj.getE();
       //Point2D[] vScr = obj.getVScr();
      for (let i = iStart; i < this.nTria; i++) {
          let t:Tria = this.tr[i];
          let iA = t.iA, iB = t.iB, iC = t.iC;
          let aScr:Point2D = vScr[iA], bScr:Point2D = vScr[iB], cScr:Point2D = vScr[iC];

          // 1. Minimax test for x and y screen coordinates:
          if (maxPQx <= aScr.x && maxPQx <= bScr.x && maxPQx <= cScr.x
           || minPQx >= aScr.x && minPQx >= bScr.x && minPQx >= cScr.x 
           || maxPQy <= aScr.y && maxPQy <= bScr.y && maxPQy <= cScr.y
           || minPQy >= aScr.y && minPQy >= bScr.y && minPQy >= cScr.y)
              continue; // This triangle does not obscure PQ.

           // 2. Test if PQ is an edge of ABC:
          if ((iP == iA || iP == iB || iP == iC) &&
              (iQ == iA || iQ == iB || iQ == iC))
              continue;  // This triangle does not obscure PQ.

           // 3. Test if PQ is clearly nearer than ABC:
          let zA = e[iA].z, zB = e[iB].z, zC = e[iC].z;
          if (minPQz >= zA && minPQz >= zB && minPQz >= zC)
              continue; // This triangle does not obscure PQ.

           // 4. Do P and Q (in 2D) lie in a half plane defined
           //    by line AB, on the side other than that of C?
           //    Similar for the edges BC and CA.
           let eps = 0.1; // Relative to numbers of pixels
          if (Tools2D.area2(aScr, bScr, pScr) < eps &&
              Tools2D.area2(aScr, bScr, qScr) < eps ||
              Tools2D.area2(bScr, cScr, pScr) < eps &&
              Tools2D.area2(bScr, cScr, qScr) < eps ||
              Tools2D.area2(cScr, aScr, pScr) < eps &&
              Tools2D.area2(cScr, aScr, qScr) < eps)
              continue;   // This triangle does not obscure PQ.

           // 5. Test (2D) if A, B and C lie on the same side
           //    of the infinite line through P and Q:
          let pqa = Tools2D.area2(pScr, qScr, aScr);
          let pqb = Tools2D.area2(pScr, qScr, bScr);
          let pqc = Tools2D.area2(pScr, qScr, cScr);

          if (pqa < +eps && pqb < +eps && pqc < +eps ||
              pqa > -eps && pqb > -eps && pqc > -eps)
              continue; // This triangle does not obscure PQ.

           // 6. Test if neither P nor Q lies behind the
           //    infinite plane through A, B and C:
          let iPol = this.refPol[i];
          //Polygon3D pol = (Polygon3D)polyList.elementAt(iPol);
        
          let pol: Polygon3D = this.polyList[iPol];   ////REFERENCIA A POLYLIST GLOBAL
        
          let a = pol.getA(), b = pol.getB(), c = pol.getC(),
              h = pol.getH(), eps1 = 1e-5 * Math.abs(h),
              hP = a * p.x + b * p.y + c * p.z, 
              hQ = a * q.x + b * q.y + c * q.z;
          if (hP > h - eps1 && hQ > h - eps1)
              continue; // This triangle does not obscure PQ.

           // 7. Test if both P and Q behind triangle ABC:
          let pInside:boolean =Tools2D.insideTriangle(aScr, bScr, cScr, pScr);
          let qInside:boolean =Tools2D.insideTriangle(aScr, bScr, cScr, qScr);
          if (pInside && qInside)
              return; // This triangle obscures PQ.

           // 8. If P nearer than ABC and inside, PQ visible;
           //    the same for Q:
          let h1 = h + eps1;
          if (hP > h1 && pInside || hQ > h1 && qInside)
              continue; // This triangle does not obscure PQ.

           // 9. Compute the intersections I and J of PQ
           // with ABC in 2D.
           // If, in 3D, such an intersection lies in front of
           // ABC, this triangle does not obscure PQ.
           // Otherwise, the intersections lie behind ABC and
           // this triangle obscures part of PQ:
          let lambdaMin = 1.0, lambdaMax = 0.0;
          for (let ii=0; ii<3; ii++){
            let v1 = bScr.x - aScr.x, v2 = bScr.y - aScr.y,
                w1 = aScr.x - pScr.x, w2 = aScr.y - pScr.y,
                denom = u2 * v1 - u1 * v2;
            if (denom != 0){
               let mu = (u1 * w2 - u2 * w1)/denom;
                 // mu = 0 gives A and mu = 1 gives B.
                if (mu > -0.0001 && mu < 1.0001){
                  let lambda = (v1 * w2 - v2 * w1)/denom;
                    // lambda = PI/PQ
                    // (I is point of intersection)
                  if (lambda > -0.0001 && lambda < 1.0001){
                    if (pInside != qInside &&
                      lambda > 0.0001 && lambda < 0.9999){
                        lambdaMin = lambdaMax = lambda;
                        break;
                          // Only one point of intersection
                    } 
                    if (lambda < lambdaMin) lambdaMin = lambda;
                    if (lambda > lambdaMax) lambdaMax = lambda;
                  }
                }
            }
            let temp:Point2D = aScr; aScr = bScr;
            bScr = cScr; cScr = temp;
          }
          let d = this.obj.getD();
          if (!pInside && lambdaMin > 0.001){
            let iScrx = pScr.x + lambdaMin * u1,
                iScry = pScr.y + lambdaMin * u2;
               // Back from screen to eye coordinates:
            let zI = 1/(lambdaMin/zQ + (1 - lambdaMin)/zP),
                xI = -zI * iScrx / d, yI = -zI * iScry / d;
            if (a * xI + b * yI + c * zI > h1)
                  continue; // This triangle does not obscure PQ.

            let iScr:Point2D  = new Point2D(iScrx, iScry);
            if (Tools2D.distance2(iScr, pScr) >= 1.0)
                  this.lineSegment(g, p, new Point3D(xI, yI, zI), pScr, iScr, iP, -1, i + 1);

          }
          if (!qInside && lambdaMax < 0.999){
            let jScrx = pScr.x + lambdaMax * u1,
                jScry = pScr.y + lambdaMax * u2;
            let zJ = 1/(lambdaMax/zQ + (1 - lambdaMax)/zP),
                xJ = -zJ * jScrx / d, yJ = -zJ * jScry / d;
            if (a * xJ + b * yJ + c * zJ > h1)
                  continue; // This triangle does not obscure PQ.
            let jScr:Point2D = new Point2D(jScrx, jScry);
            if (Tools2D.distance2(jScr, qScr) >= 1.0)
                  this.lineSegment(g, q, new Point3D(xJ, yJ, zJ), qScr, jScr, iQ, -1, i + 1);
            }
            return;
                // if no continue-statement has been executed
          }
          this.drawLine(g, pScr.x, pScr.y, qScr.x, qScr.y);
          
             // No triangle obscures PQ.
    }
}
