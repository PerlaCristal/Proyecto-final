import { Dimension } from './Dimension.js';
var CvWireframe = /** @class */ (function () {
    function CvWireframe(g, canvas) {
        this.g = g;
        this.canvas = canvas;
    }
    CvWireframe.prototype.getObj = function () { return this.obj; };
    CvWireframe.prototype.setObj = function (obj) { this.obj = obj; };
    CvWireframe.prototype.iX = function (x) { return Math.round(this.centerX + x - this.imgCenter.x); };
    CvWireframe.prototype.iY = function (y) { return Math.round(this.centerY - y + this.imgCenter.y); };
    CvWireframe.prototype.paint = function () {
        if (this.obj == undefined)
            return;
        var polyList = this.obj.getPolyList();
        if (polyList == undefined)
            return;
        var nFaces = polyList.length;
        if (nFaces == 0)
            return;
        var dim = new Dimension(this.canvas.width, this.canvas.height);
        this.canvas.width = this.canvas.width;
        this.maxX = dim.width - 1;
        this.maxY = dim.height - 1;
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
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
        this.obj.planeCoeff(); // Compute a, b, c and h.
        var e = this.obj.getE();
        var vScr = this.obj.getVScr();
        //g.setColor(Color.black);
        for (var j = 0; j < nFaces; j++) {
            var pol = polyList[j];
            var nrs = pol.getNrs();
            if (nrs.length < 3)
                continue;
            for (var iA = 0; iA < nrs.length; iA++) {
                var iB = (iA + 1) % nrs.length;
                var na = Math.abs(nrs[iA]), nb = Math.abs(nrs[iB]);
                // abs in view of minus signs discussed in Section 6.4.
                var a = vScr[na], b = vScr[nb];
                this.drawLine(this.g, this.iX(a.x), this.iY(a.y), this.iX(b.x), this.iY(b.y));
            }
        }
    };
    CvWireframe.prototype.drawLine = function (g, x1, y1, x2, y2) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.closePath();
        g.stroke();
    };
    return CvWireframe;
}());
export { CvWireframe };
