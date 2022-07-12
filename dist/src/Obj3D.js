// Obj3D.java: A 3D object and its 2D representation.
// Uses: Point2D (Section 1.5), Point3D (Section 3.9),
//       Polygon3D, Input (Section 5.5).
import { Point2D } from './Point2D.js';
import { Point3D } from './Point3D.js';
import { Input } from './Input.js';
import { Polygon3D } from './Polygon3D.js';
var Obj3D = /** @class */ (function () {
    function Obj3D() {
        this.theta = 0.30;
        this.phi = 1.3;
        this.sunZ = 1 / Math.sqrt(3);
        this.sunY = this.sunZ;
        this.sunX = -this.sunZ;
        this.inprodMin = 1e30;
        this.inprodMax = -1e30;
        this.w = new Array(); // World coordinates
        this.polyList = new Array(); // Polygon3D objects 
        this.file = " ";
        this.indices = [];
        this.tind = 0; // File name
    }
    Obj3D.prototype.read = function (file) {
        var inp = new Input(file);
        if (inp.fails())
            return this.failing();
        this.file = file;
        this.xMin = this.yMin = this.zMin = +1e30;
        this.xMax = this.yMax = this.zMax = -1e30;
        return this.readObject(inp); // Read from inp into obj
    };
    Obj3D.prototype.getPolyList = function () { return this.polyList; };
    Obj3D.prototype.getFName = function () { return this.file; };
    Obj3D.prototype.getE = function () { return this.e; };
    Obj3D.prototype.getVScr = function () { return this.vScr; };
    Obj3D.prototype.getImgCenter = function () { return this.imgCenter; };
    Obj3D.prototype.getRho = function () { return this.rho; };
    Obj3D.prototype.getD = function () { return this.d; };
    Obj3D.prototype.failing = function () {
        return false;
    };
    Obj3D.prototype.readObject = function (inp) {
        var j = 0;
        for (;;) {
            var i = inp.readInt();
            if (inp.fails()) {
                inp.clear();
                break;
            }
            if (i < 0) {
                console.log("Negative vertex number in first part of input file");
                return this.failing();
            }
            // debugger
            //w.ensureCapacity(i + 1);
            var x = inp.readFloat();
            var y = inp.readFloat();
            var z = inp.readFloat();
            this.addVertex(i, x, y, z);
            this.indices[j++] = i;
        }
        this.tind = j--;
        this.shiftToOrigin(); // Origin in center of object.
        var ch;
        var count = 0;
        do { // Skip the line "Faces:"
            ch = inp.readChar();
            count++;
        } while (!inp.eof() && ch != '\n');
        if (count < 6 || count > 8) {
            console.log("Invalid input file");
            return this.failing();
        }
        //  Build polygon list:
        for (;;) {
            var vnrs = [];
            for (;;) {
                var i = inp.readInt();
                if (inp.fails()) {
                    inp.clear();
                    break;
                }
                var absi = Math.abs(i);
                if (i == 0 || absi >= this.w.length ||
                    this.w[absi] == null) {
                    console.log("Invalid vertex number: " + absi +
                        " must be defined, nonzero and less than " + this.w.length);
                    return this.failing();
                }
                vnrs.push(i);
            }
            ch = inp.readChar();
            if (ch != '.' && ch != '#')
                break;
            // Ignore input lines with only one vertex number:
            if (vnrs.length >= 2)
                this.polyList.push(new Polygon3D(vnrs));
        }
        //inp.close();
        //console.log(this.polyList)
        return true;
    };
    Obj3D.prototype.addVertex = function (i, x, y, z) {
        if (x < this.xMin)
            this.xMin = x;
        if (x > this.xMax)
            this.xMax = x;
        if (y < this.yMin)
            this.yMin = y;
        if (y > this.yMax)
            this.yMax = y;
        if (z < this.zMin)
            this.zMin = z;
        if (z > this.zMax)
            this.zMax = z;
        //if (i >= this.w.length) this.w.setSize(i + 1);
        //this.w.push(new Point3D(x, y, z));
        this.w[i] = new Point3D(x, y, z);
    };
    Obj3D.prototype.shiftToOrigin = function () {
        var xwC = 0.5 * (this.xMin + this.xMax);
        var ywC = 0.5 * (this.yMin + this.yMax);
        var zwC = 0.5 * (this.zMin + this.zMax);
        var n = this.w.length;
        for (var i = 1; i < n; i++) {
            if (this.w[i] != undefined) {
                this.w[i].x -= xwC;
                this.w[i].y -= ywC;
                this.w[i].z -= zwC;
            }
        }
        var dx = this.xMax - this.xMin, dy = this.yMax - this.yMin, dz = this.zMax - this.zMin;
        this.rhoMin = 0.6 * Math.sqrt(dx * dx + dy * dy + dz * dz);
        this.rhoMax = 1000 * this.rhoMin;
        this.rho = 3 * this.rhoMin;
    };
    Obj3D.prototype.initPersp = function () {
        var costh = Math.cos(this.theta);
        var sinth = Math.sin(this.theta);
        var cosph = Math.cos(this.phi);
        var sinph = Math.sin(this.phi);
        this.v11 = -sinth;
        this.v12 = -cosph * costh;
        this.v13 = sinph * costh;
        this.v21 = costh;
        this.v22 = -cosph * sinth;
        this.v23 = sinph * sinth;
        this.v32 = sinph;
        this.v33 = cosph;
        this.v43 = -this.rho;
    };
    Obj3D.prototype.eyeAndScreen = function (dim) {
        this.initPersp();
        var n = this.w.length;
        this.e = new Array(n);
        this.vScr = new Array(n);
        var xScrMin = 1e30, xScrMax = -1e30, yScrMin = 1e30, yScrMax = -1e30;
        for (var i = 1; i < n; i++) {
            var P = this.w[i];
            if (P == undefined) {
                this.e[i] = undefined;
                this.vScr[i] = null;
            }
            else {
                var x = this.v11 * P.x + this.v21 * P.y;
                var y = this.v12 * P.x + this.v22 * P.y + this.v32 * P.z;
                var z = this.v13 * P.x + this.v23 * P.y + this.v33 * P.z + this.v43;
                var Pe = this.e[i] = new Point3D(x, y, z);
                var xScr = -Pe.x / Pe.z, yScr = -Pe.y / Pe.z;
                this.vScr[i] = new Point2D(xScr, yScr);
                if (xScr < xScrMin)
                    xScrMin = xScr;
                if (xScr > xScrMax)
                    xScrMax = xScr;
                if (yScr < yScrMin)
                    yScrMin = yScr;
                if (yScr > yScrMax)
                    yScrMax = yScr;
            }
        }
        var rangeX = xScrMax - xScrMin, rangeY = yScrMax - yScrMin;
        this.d = 0.95 * Math.min(dim.width / rangeX, dim.height / rangeY);
        this.imgCenter = new Point2D(this.d * (xScrMin + xScrMax) / 2, this.d * (yScrMin + yScrMax) / 2);
        for (var i = 1; i < n; i++) {
            if (this.vScr[i] != null) {
                this.vScr[i].x *= this.d;
                this.vScr[i].y *= this.d;
            }
        }
        return this.d * Math.max(rangeX, rangeY);
        // Maximum screen-coordinate range used in CvHLines for HP-GL
    };
    Obj3D.prototype.planeCoeff = function () {
        var nFaces = this.polyList.length;
        for (var j = 0; j < nFaces; j++) {
            var pol = this.polyList[j];
            var nrs = pol.getNrs();
            if (nrs.length < 3)
                continue;
            var iA = Math.abs(nrs[0]), // Possibly negative
            iB = Math.abs(nrs[1]), // for HLines.
            iC = Math.abs(nrs[2]);
            var A = this.e[iA], B = this.e[iB], C = this.e[iC];
            var u1 = B.x - A.x, u2 = B.y - A.y, u3 = B.z - A.z, v1 = C.x - A.x, v2 = C.y - A.y, v3 = C.z - A.z, a = u2 * v3 - u3 * v2, b = u3 * v1 - u1 * v3, c = u1 * v2 - u2 * v1, len = Math.sqrt(a * a + b * b + c * c), h = void 0;
            a /= len;
            b /= len;
            c /= len;
            h = a * A.x + b * A.y + c * A.z;
            pol.setAbch(a, b, c, h);
            var A1 = this.vScr[iA], B1 = this.vScr[iB], C1 = this.vScr[iC];
            u1 = B1.x - A1.x;
            u2 = B1.y - A1.y;
            v1 = C1.x - A1.x;
            v2 = C1.y - A1.y;
            if (u1 * v2 - u2 * v1 <= 0)
                continue; // backface
            var inprod = a * this.sunX + b * this.sunY + c * this.sunZ;
            if (inprod < this.inprodMin)
                this.inprodMin = inprod;
            if (inprod > this.inprodMax)
                this.inprodMax = inprod;
        }
        this.inprodRange = this.inprodMax - this.inprodMin;
    };
    Obj3D.prototype.vp = function (cv, dTheta, dPhi, fRho) {
        this.theta += dTheta;
        this.phi += dPhi;
        var rhoNew = fRho * this.rho;
        if (rhoNew >= this.rhoMin && rhoNew <= this.rhoMax)
            this.rho = rhoNew;
        else
            return false;
        cv.paint();
        return true;
    };
    Obj3D.prototype.colorCode = function (a, b, c) {
        var inprod = a * this.sunX + b * this.sunY + c * this.sunZ;
        return Math.round(((inprod - this.inprodMin) / this.inprodRange) * 255);
    };
    return Obj3D;
}());
export { Obj3D };
