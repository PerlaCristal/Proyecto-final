var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CanvasLocal } from "./canvasLocal.js";
import { Obj } from "./obj.js";
var CvCubePersp = /** @class */ (function (_super) {
    __extends(CvCubePersp, _super);
    function CvCubePersp(g, canvas) {
        var _this = _super.call(this, g, canvas) || this;
        _this.obj = new Obj();
        return _this;
    }
    CvCubePersp.prototype.line = function (i, j) {
        var p = this.obj.vScr[i], q = this.obj.vScr[j];
        this.graphics.beginPath();
        this.graphics.moveTo(_super.prototype.iX.call(this, p.x), _super.prototype.iY.call(this, p.y));
        this.graphics.lineTo(_super.prototype.iX.call(this, q.x), _super.prototype.iY.call(this, q.y));
        this.graphics.closePath();
        this.graphics.stroke();
    };
    CvCubePersp.prototype.paint = function () {
        //Dimension dim = getSize();
        //int maxX = dim.width - 1, maxY = dim.height - 1,
        //let     minMaxXY = Math.min(maxX, maxY);
        //centerX = maxX/2; centerY = maxY/2;
        this.obj.d = this.obj.rho * this.pixelSize / this.obj.objSize;
        this.obj.eyeAndScreen();
        // Horizontal edges at the bottom:
        this.line(0, 1);
        this.line(1, 2);
        this.line(2, 3);
        this.line(3, 0);
        // Horizontal edges at the top:
        this.line(4, 5);
        this.line(5, 6);
        this.line(6, 7);
        this.line(7, 4);
        // Vertical edges:
        this.line(0, 4);
        this.line(1, 5);
        this.line(2, 6);
        this.line(3, 7);
    };
    return CvCubePersp;
}(CanvasLocal));
export { CvCubePersp };
