// Polygon3D.java: Polygon in 3D, represented by vertex numbers
//                 referring to coordinates stored in an Obj3D object.
import { Tria } from './Tria.js';
import { Obj3D } from './Obj3D.js';
import { Point2D } from './Point2D.js';
import { Tools2D } from './Tools2D.js';

export class Polygon3D{
  private nrs:number[];
  private a: number; b: number; c: number; h: number;;
  private t: Tria[];
  
  ///CHECAR QUE ARGUEMNTO SE ESTA  PASANDS
  constructor(vnrs:Array<number>) {
    let n = vnrs.length;
    this.nrs = new Array(n);
    for (let i=0; i<n; i++)
        this.nrs[i] = vnrs[i];
  }

  getNrs():number[]{return this.nrs;}
  getA():number{return this.a;}
  getB():number{return this.b;}
  getC():number{return this.c;}
  getH(): number{ return this.h; }
  
  setAbch(a: number, b: number, c: number, h: number): void{
    this.a = a; this.b = b; this.c = c; this.h = h;
  }

  getT():Tria[] {return this.t;}

  triangulate(obj: Obj3D ):void{
   // Successive vertex numbers (CCW) in vector nrs.
   // Resulting triangles will be put in array t.
    let n = this.nrs.length;          // n > 2 is required
    let next: number[] = new Array(n);



//checar inicializacion del arreglo  USO DE NEW ARRAY O NO

    this.t = new Array(n - 2);
    let vScr: Point2D[] = obj.getVScr();
    let iA:number=0, iB:number, iC:number; let j:number=n-1;
    for (let i = 0; i < n; i++){
      next[j] = i; j = i;
    }
    for (let k=0; k<n-2; k++){   // Find a suitable triangle, consisting of two edges
        // and an internal diagonal:
        let a:Point2D , b:Point2D , c:Point2D;
        let found: boolean = false;
        let count = 0, nA = -1, nB = 0, nC = 0, nj:number;
        while (!found && ++count < n) {
          iB = next[iA]; iC = next[iB];
          nA = Math.abs(this.nrs[iA]); a = vScr[nA];
          nB = Math.abs(this.nrs[iB]); b = vScr[nB];
          nC = Math.abs(this.nrs[iC]); c = vScr[nC];
          if (Tools2D.area2(a, b, c) >= 0){  // Edges AB and BC; diagonal AC.
              // Test to see if no vertex (other than A,
              // B, C) lies within triangle ABC:
              j = next[iC]; nj = Math.abs(this.nrs[j]);
              while (j != iA &&
                    (nj == nA  ||   nj == nB  ||   nj == nC  ||
                  !Tools2D.insideTriangle(a, b, c, vScr[nj]))) {
                    j
                    = next[j]; nj = Math.abs(this.nrs[j]);
              }
              if (j == iA){   // Triangle found:
                this.t[k] = new Tria(nA, nB, nC);
                next[iA] = iC;
                found = true;
              }
          }
          iA = next[iA];
        }
        if (count == n)
        {   // Degenerated polygon, possibly with all
           // vertices on one line.
          if (nA >= 0) {
            this.t[k] = new Tria(nA, nB, nC);
          }
          else {
            console.log("Nonsimple polygon");
              
          }
        }
    }
  }
}
