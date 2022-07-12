import { Point2D } from './Point2D.js';
import { Dimension } from './Dimension.js';
import { Point3D } from './Point3D.js';
import { Tools2D } from './Tools2D.js';
var CvHLines = /** @class */ (function () {
    function CvHLines(g, canvas) {
        this.chunkSize = 4;
        this.g = g;
        this.canvas = canvas;
    }
    CvHLines.prototype.getObj = function () { return this.obj; };
    CvHLines.prototype.setObj = function (obj) { this.obj = obj; };
    CvHLines.prototype.paint = function () {
        if (this.obj == undefined)
            return;
        var polyList = this.obj.getPolyList();
        if (polyList == undefined)
            return;
        var nFaces = polyList.length;
        if (nFaces == 0)
            return;
        var xe, ye, ze;
        var dim = new Dimension(this.canvas.width, this.canvas.height);
        this.canvas.width = this.canvas.width;
        this.maxX = dim.width - 1;
        this.maxY = dim.height - 1;
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
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
        for (var j = 0; j < nFaces; j++) {
            //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
            var pol = polyList[j];
            if (pol.getNrs().length > 2 && pol.getH() <= this.hLimit) {
                pol.triangulate(this.obj);
                this.nTria += pol.getT().length;
            }
        }
        this.tr = new Array(this.nTria); // Triangles of all polygons
        this.refPol = new Array(this.nTria); // tr[i] belongs to refPol[i]
        var iTria = 0;
        for (var j = 0; j < nFaces; j++) {
            //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
            var pol = polyList[j];
            var t = pol.getT(); // Triangles of one polygon
            if (pol.getNrs().length > 2 && pol.getH() <= this.hLimit) {
                for (var i = 0; i < t.length; i++) {
                    var tri = t[i];
                    this.tr[iTria] = tri;
                    this.refPol[iTria++] = j;
                }
            }
        }
        var e = this.obj.getE();
        var vScr = this.obj.getVScr();
        //Point3D[] e = obj.getE();
        //Point2D[] vScr = obj.getVScr();
        for (var i = 0; i < this.nVertices; i++) {
            for (var j = 0; j < this.nConnect[i]; j++) {
                var jj = this.connect[i][j];
                this.lineSegment(this.g, e[i], e[jj], vScr[i], vScr[jj], i, jj, 0);
            }
        }
        //hpgl = null;
    };
    CvHLines.prototype.buildLineSet = function () {
        // Build the array
        // 'connect' of int arrays, where
        // connect[i] is the array of all
        // vertex numbers j, such that connect[i][j] is
        // an edge of the 3D object.
        this.polyList = this.obj.getPolyList();
        this.nVertices = this.obj.getVScr().length;
        this.connect = new Array(this.nVertices);
        this.nConnect = [];
        for (var i = 0; i < this.nVertices; i++)
            this.nConnect[i] = 0;
        var nFaces = this.polyList.length; //SEFUNDA REFERENCIA A POLYLIST
        for (var j = 0; j < nFaces; j++) {
            //Polygon3D pol = (Polygon3D)(polyList.elementAt(j));
            var pol = this.polyList[j]; //TERCERA REFERENCIA A POLYLIST
            var nrs = pol.getNrs();
            var n = nrs.length;
            if (n > 2 && pol.getH() > 0)
                continue;
            var ii = Math.abs(nrs[n - 1]);
            for (var k = 0; k < n; k++) {
                var jj = nrs[k];
                if (jj < 0)
                    jj = -jj; // abs
                else {
                    var i1 = Math.min(ii, jj), j1 = Math.max(ii, jj), nCon = this.nConnect[i1];
                    // Look if j1 is already present:
                    var l = void 0;
                    for (l = 0; l < nCon; l++)
                        if (this.connect[i1][l] == j1)
                            break;
                    if (l == nCon) { // Not found:
                        if (nCon % this.chunkSize == 0) {
                            var temp = new Array(nCon + this.chunkSize);
                            for (l = 0; l < nCon; l++)
                                temp[l] = this.connect[i1][l];
                            this.connect[i1] = temp;
                        }
                        this.connect[i1][this.nConnect[i1]++] = j1;
                    }
                }
                ii = jj;
            }
        }
    };
    CvHLines.prototype.iX = function (x) { return Math.round(this.centerX + x - this.imgCenter.x); };
    CvHLines.prototype.iY = function (y) { return Math.round(this.centerY - y + this.imgCenter.y); };
    /*int iX(float x){return Math.round(centerX + x - imgCenter.x);}
    int iY(float y){return Math.round(centerY - y + imgCenter.y);}*/
    CvHLines.prototype.toString = function (t) {
        // From screen device units (pixels) to HP-GL units (0-10000) :
        var i = Math.round(5000 + t * 9000 / this.maxScreenRange);
        var s = "";
        var n = 1000;
        for (var j = 3; j >= 0; j--) {
            s += i / n;
            i %= n;
            n /= 10;
        }
        return s;
    };
    CvHLines.prototype.drawLine = function (g, px1, py1, px2, py2) {
        var x1 = this.iX(px1), y1 = this.iY(py1), x2 = this.iX(px2), y2 = this.iY(py2);
        if (x1 != x2 || y1 != y2) {
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.closePath();
            g.stroke();
        }
        //console.log("coord:",pScr.x, pScr.y, qScr.x, qScr.y )
    };
    CvHLines.prototype.lineSegment = function (g, p, q, pScr, qScr, iP, iQ, iStart) {
        var u1 = qScr.x - pScr.x, u2 = qScr.y - pScr.y;
        var minPQx = Math.min(pScr.x, qScr.x);
        var maxPQx = Math.max(pScr.x, qScr.x);
        var minPQy = Math.min(pScr.y, qScr.y);
        var maxPQy = Math.max(pScr.y, qScr.y);
        var zP = p.z, zQ = q.z; // p and q give eye-coordinates
        var minPQz = Math.min(zP, zQ);
        var e = this.obj.getE();
        var vScr = this.obj.getVScr();
        //Point3D[] e = obj.getE();
        //Point2D[] vScr = obj.getVScr();
        for (var i = iStart; i < this.nTria; i++) {
            var t = this.tr[i];
            var iA = t.iA, iB = t.iB, iC = t.iC;
            var aScr = vScr[iA], bScr = vScr[iB], cScr = vScr[iC];
            // 1. Minimax test for x and y screen coordinates:
            if (maxPQx <= aScr.x && maxPQx <= bScr.x && maxPQx <= cScr.x
                || minPQx >= aScr.x && minPQx >= bScr.x && minPQx >= cScr.x
                || maxPQy <= aScr.y && maxPQy <= bScr.y && maxPQy <= cScr.y
                || minPQy >= aScr.y && minPQy >= bScr.y && minPQy >= cScr.y)
                continue; // This triangle does not obscure PQ.
            // 2. Test if PQ is an edge of ABC:
            if ((iP == iA || iP == iB || iP == iC) &&
                (iQ == iA || iQ == iB || iQ == iC))
                continue; // This triangle does not obscure PQ.
            // 3. Test if PQ is clearly nearer than ABC:
            var zA = e[iA].z, zB = e[iB].z, zC = e[iC].z;
            if (minPQz >= zA && minPQz >= zB && minPQz >= zC)
                continue; // This triangle does not obscure PQ.
            // 4. Do P and Q (in 2D) lie in a half plane defined
            //    by line AB, on the side other than that of C?
            //    Similar for the edges BC and CA.
            var eps = 0.1; // Relative to numbers of pixels
            if (Tools2D.area2(aScr, bScr, pScr) < eps &&
                Tools2D.area2(aScr, bScr, qScr) < eps ||
                Tools2D.area2(bScr, cScr, pScr) < eps &&
                    Tools2D.area2(bScr, cScr, qScr) < eps ||
                Tools2D.area2(cScr, aScr, pScr) < eps &&
                    Tools2D.area2(cScr, aScr, qScr) < eps)
                continue; // This triangle does not obscure PQ.
            // 5. Test (2D) if A, B and C lie on the same side
            //    of the infinite line through P and Q:
            var pqa = Tools2D.area2(pScr, qScr, aScr);
            var pqb = Tools2D.area2(pScr, qScr, bScr);
            var pqc = Tools2D.area2(pScr, qScr, cScr);
            if (pqa < +eps && pqb < +eps && pqc < +eps ||
                pqa > -eps && pqb > -eps && pqc > -eps)
                continue; // This triangle does not obscure PQ.
            // 6. Test if neither P nor Q lies behind the
            //    infinite plane through A, B and C:
            var iPol = this.refPol[i];
            //Polygon3D pol = (Polygon3D)polyList.elementAt(iPol);
            var pol = this.polyList[iPol]; ////REFERENCIA A POLYLIST GLOBAL
            var a = pol.getA(), b = pol.getB(), c = pol.getC(), h = pol.getH(), eps1 = 1e-5 * Math.abs(h), hP = a * p.x + b * p.y + c * p.z, hQ = a * q.x + b * q.y + c * q.z;
            if (hP > h - eps1 && hQ > h - eps1)
                continue; // This triangle does not obscure PQ.
            // 7. Test if both P and Q behind triangle ABC:
            var pInside = Tools2D.insideTriangle(aScr, bScr, cScr, pScr);
            var qInside = Tools2D.insideTriangle(aScr, bScr, cScr, qScr);
            if (pInside && qInside)
                return; // This triangle obscures PQ.
            // 8. If P nearer than ABC and inside, PQ visible;
            //    the same for Q:
            var h1 = h + eps1;
            if (hP > h1 && pInside || hQ > h1 && qInside)
                continue; // This triangle does not obscure PQ.
            // 9. Compute the intersections I and J of PQ
            // with ABC in 2D.
            // If, in 3D, such an intersection lies in front of
            // ABC, this triangle does not obscure PQ.
            // Otherwise, the intersections lie behind ABC and
            // this triangle obscures part of PQ:
            var lambdaMin = 1.0, lambdaMax = 0.0;
            for (var ii = 0; ii < 3; ii++) {
                var v1 = bScr.x - aScr.x, v2 = bScr.y - aScr.y, w1 = aScr.x - pScr.x, w2 = aScr.y - pScr.y, denom = u2 * v1 - u1 * v2;
                if (denom != 0) {
                    var mu = (u1 * w2 - u2 * w1) / denom;
                    // mu = 0 gives A and mu = 1 gives B.
                    if (mu > -0.0001 && mu < 1.0001) {
                        var lambda = (v1 * w2 - v2 * w1) / denom;
                        // lambda = PI/PQ
                        // (I is point of intersection)
                        if (lambda > -0.0001 && lambda < 1.0001) {
                            if (pInside != qInside &&
                                lambda > 0.0001 && lambda < 0.9999) {
                                lambdaMin = lambdaMax = lambda;
                                break;
                                // Only one point of intersection
                            }
                            if (lambda < lambdaMin)
                                lambdaMin = lambda;
                            if (lambda > lambdaMax)
                                lambdaMax = lambda;
                        }
                    }
                }
                var temp = aScr;
                aScr = bScr;
                bScr = cScr;
                cScr = temp;
            }
            var d = this.obj.getD();
            if (!pInside && lambdaMin > 0.001) {
                var iScrx = pScr.x + lambdaMin * u1, iScry = pScr.y + lambdaMin * u2;
                // Back from screen to eye coordinates:
                var zI = 1 / (lambdaMin / zQ + (1 - lambdaMin) / zP), xI = -zI * iScrx / d, yI = -zI * iScry / d;
                if (a * xI + b * yI + c * zI > h1)
                    continue; // This triangle does not obscure PQ.
                var iScr = new Point2D(iScrx, iScry);
                if (Tools2D.distance2(iScr, pScr) >= 1.0)
                    this.lineSegment(g, p, new Point3D(xI, yI, zI), pScr, iScr, iP, -1, i + 1);
            }
            if (!qInside && lambdaMax < 0.999) {
                var jScrx = pScr.x + lambdaMax * u1, jScry = pScr.y + lambdaMax * u2;
                var zJ = 1 / (lambdaMax / zQ + (1 - lambdaMax) / zP), xJ = -zJ * jScrx / d, yJ = -zJ * jScry / d;
                if (a * xJ + b * yJ + c * zJ > h1)
                    continue; // This triangle does not obscure PQ.
                var jScr = new Point2D(jScrx, jScry);
                if (Tools2D.distance2(jScr, qScr) >= 1.0)
                    this.lineSegment(g, q, new Point3D(xJ, yJ, zJ), qScr, jScr, iQ, -1, i + 1);
            }
            return;
            // if no continue-statement has been executed
        }
        this.drawLine(g, pScr.x, pScr.y, qScr.x, qScr.y);
        // No triangle obscures PQ.
    };
    return CvHLines;
}());
export { CvHLines };
