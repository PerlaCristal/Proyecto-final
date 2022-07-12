var CanvasLocal = /** @class */ (function () {
    function CanvasLocal(g, canvas) {
        this.graphics = g;
        this.rWidth = 10;
        this.rHeight = 10;
        this.maxX = canvas.width - 1;
        this.maxY = canvas.height - 1;
        this.pixelSize = Math.min(this.maxX, this.maxY); //Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
    }
    CanvasLocal.prototype.iX = function (x) { return Math.round(this.centerX + x); };
    CanvasLocal.prototype.iY = function (y) { return Math.round(this.centerY - y); };
    CanvasLocal.prototype.paint = function () {
        this.graphics.arc(this.iX(0), this.iY(0), Math.abs(this.iX(4) - this.iX(0)), 0, 2 * Math.PI, false);
        this.graphics.stroke();
        this.graphics.fillText("Lienzo listo desde ts", this.iX(2), this.iY(3.7));
    };
    return CanvasLocal;
}());
export { CanvasLocal };
