var Dimension = /** @class */ (function () {
    function Dimension(w, h) {
        this._width = w;
        this._height = h;
    }
    Object.defineProperty(Dimension.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Dimension.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
        configurable: true
    });
    return Dimension;
}());
export { Dimension };
