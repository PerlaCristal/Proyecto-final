var Tools2D = /** @class */ (function () {
    function Tools2D() {
    }
    Tools2D.area2 = function (a, b, c) {
        return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    };
    Tools2D.insideTriangle = function (a, b, c, p) {
        return (Tools2D.area2(a, b, p) >= 0 &&
            Tools2D.area2(b, c, p) >= 0 &&
            Tools2D.area2(c, a, p) >= 0);
    };
    /*static triangulate(p: Point2D[], tr: Triangle[] ): void {
        // p contains all n polygon vertices in CCW order.
        // The resulting triangles will be stored in array tr.
        // This array tr must have length n - 2.
      let n = p.length, j = n - 1, iA=0, iB:number, iC:number;
      let next: number[] = new Array(n);
      for (let i = 0; i < n; i++){
        next[j] = i;
        j = i;
      }
      for (let k=0; k<n-2; k++){  // Find a suitable triangle, consisting of two edges
           // and an internal diagonal:
        let a:Point2D, b:Point2D, c:Point2D;
        let triaFound: boolean = false;
        let nA = -1, nB = 0, nC = 0, nj:number;
        let count = 0;
        while (!triaFound && ++count < n) {
          iB = next[iA]; iC = next[iB];
          a = p[iA]; b = p[iB]; c = p[iC];
          if (Tools2D.area2(a, b, c) >= 0){  // Edges AB and BC; diagonal AC.
                 // Test to see if no other polygon vertex
                 // lies within triangle ABC:
              j = next[iC];
              while (j != iA &&
                (nj == nA  ||   nj == nB  ||   nj == nC  ||
                !Tools2D.insideTriangle(a, b, c, vScr[nj])))
             {  j = next[j]; nj = Math.abs(this.nrs[j]);
             }
  
                 if (j == iA)
                 {  // Triangle ABC contains no other vertex:
                    tr[k] = new Triangle(a, b, c);
                    next[iA] = iC;
                    triaFound = true;
                 }
              }
              iA = next[iA];
           }
           if (count == n)
           {  System.out.println("Not a simple polygon" +
                " or vertex sequence not counter-clockwise.");
              System.exit(1);
           }
        }
     }*/
    Tools2D.distance2 = function (p, q) {
        var dx = p.x - q.x, dy = p.y - q.y;
        return dx * dx + dy * dy;
    };
    return Tools2D;
}());
export { Tools2D };
