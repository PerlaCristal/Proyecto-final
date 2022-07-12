// Polygon3D.java: Polygon in 3D, represented by vertex numbers
//                 referring to coordinates stored in an Obj3D object.
import { Tria } from './Tria.js';
import { Tools2D } from './Tools2D.js';
var Polygon3D = /** @class */ (function () {
    ///CHECAR QUE ARGUEMNTO SE ESTA  PASANDS
    function Polygon3D(vnrs) {
        var n = vnrs.length;
        this.nrs = new Array(n);
        for (var i = 0; i < n; i++)
            this.nrs[i] = vnrs[i];
    }
    ;
    Polygon3D.prototype.getNrs = function () { return this.nrs; };
    Polygon3D.prototype.getA = function () { return this.a; };
    Polygon3D.prototype.getB = function () { return this.b; };
    Polygon3D.prototype.getC = function () { return this.c; };
    Polygon3D.prototype.getH = function () { return this.h; };
    Polygon3D.prototype.setAbch = function (a, b, c, h) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.h = h;
    };
    Polygon3D.prototype.getT = function () { return this.t; };
    Polygon3D.prototype.triangulate = function (obj) {
        // Successive vertex numbers (CCW) in vector nrs.
        // Resulting triangles will be put in array t.
        var n = this.nrs.length; // n > 2 is required
        var next = new Array(n);
        //checar inicializacion del arreglo  USO DE NEW ARRAY O NO
        this.t = new Array(n - 2);
        var vScr = obj.getVScr();
        var iA = 0, iB, iC;
        var j = n - 1;
        for (var i = 0; i < n; i++) {
            next[j] = i;
            j = i;
        }
        for (var k = 0; k < n - 2; k++) { // Find a suitable triangle, consisting of two edges
            // and an internal diagonal:
            var a = void 0, b = void 0, c = void 0;
            var found = false;
            var count = 0, nA = -1, nB = 0, nC = 0, nj = void 0;
            while (!found && ++count < n) {
                iB = next[iA];
                iC = next[iB];
                nA = Math.abs(this.nrs[iA]);
                a = vScr[nA];
                nB = Math.abs(this.nrs[iB]);
                b = vScr[nB];
                nC = Math.abs(this.nrs[iC]);
                c = vScr[nC];
                if (Tools2D.area2(a, b, c) >= 0) { // Edges AB and BC; diagonal AC.
                    // Test to see if no vertex (other than A,
                    // B, C) lies within triangle ABC:
                    j = next[iC];
                    nj = Math.abs(this.nrs[j]);
                    while (j != iA &&
                        (nj == nA || nj == nB || nj == nC ||
                            !Tools2D.insideTriangle(a, b, c, vScr[nj]))) {
                        j
                            = next[j];
                        nj = Math.abs(this.nrs[j]);
                    }
                    if (j == iA) { // Triangle found:
                        this.t[k] = new Tria(nA, nB, nC);
                        next[iA] = iC;
                        found = true;
                    }
                }
                iA = next[iA];
            }
            if (count == n) { // Degenerated polygon, possibly with all
                // vertices on one line.
                if (nA >= 0) {
                    this.t[k] = new Tria(nA, nB, nC);
                }
                else {
                    console.log("Nonsimple polygon");
                }
            }
        }
    };
    return Polygon3D;
}());
export { Polygon3D };
