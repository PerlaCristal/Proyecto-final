import { Point3D } from './Point3D.js';
var Rota3D = /** @class */ (function () {
    function Rota3D() {
    }
    /* The method initRotate computes the general rotation matrix
    
                | r11 r12 r13 0 |
            R = | r21 r22 r23 0 |
                | r31 r32 r33 0 |
                | r41 r42 r43 1 |
    
       to be used as [x1 y1 z1 1] = [x y z 1] R
       by the method 'rotate'.
       Point (x1, y1, z1) is the image of (x, y, z).
       The rotation takes place about the directed axis
       AB and through the angle alpha.
    */
    Rota3D.initRotate = function (a, b, alpha) {
        var v1 = b.x - a.x, v2 = b.y - a.y, v3 = b.z - a.z, theta = Math.atan2(v2, v1), phi = Math.atan2(Math.sqrt(v1 * v1 + v2 * v2), v3);
        this.initRotate2(a, theta, phi, alpha);
    };
    Rota3D.initRotate2 = function (a, theta, phi, alpha) {
        var cosAlpha, sinAlpha, cosPhi, sinPhi, cosTheta, sinTheta, cosPhi2, sinPhi2, cosTheta2, sinTheta2, pi, c, a1 = a.x, a2 = a.y, a3 = a.z;
        cosPhi = Math.cos(phi);
        sinPhi = Math.sin(phi);
        cosPhi2 = cosPhi * cosPhi;
        sinPhi2 = sinPhi * sinPhi;
        cosTheta = Math.cos(theta);
        sinTheta = Math.sin(theta);
        cosTheta2 = cosTheta * cosTheta;
        sinTheta2 = sinTheta * sinTheta;
        cosAlpha = Math.cos(alpha);
        sinAlpha = Math.sin(alpha);
        c = 1.0 - cosAlpha;
        this.r11 = cosTheta2 * (cosAlpha * cosPhi2 + sinPhi2)
            + cosAlpha * sinTheta2;
        this.r12 = sinAlpha * cosPhi + c * sinPhi2 * cosTheta * sinTheta;
        this.r13 = sinPhi * (cosPhi * cosTheta * c - sinAlpha * sinTheta);
        this.r21 = sinPhi2 * cosTheta * sinTheta * c - sinAlpha * cosPhi;
        this.r22 = sinTheta2 * (cosAlpha * cosPhi2 + sinPhi2)
            + cosAlpha * cosTheta2;
        this.r23 = sinPhi * (cosPhi * sinTheta * c + sinAlpha * cosTheta);
        this.r31 = sinPhi * (cosPhi * cosTheta * c + sinAlpha * sinTheta);
        this.r32 = sinPhi * (cosPhi * sinTheta * c - sinAlpha * cosTheta);
        this.r33 = cosAlpha * sinPhi2 + cosPhi2;
        this.r41 = a1 - a1 * this.r11 - a2 * this.r21 - a3 * this.r31;
        this.r42 = a2 - a1 * this.r12 - a2 * this.r22 - a3 * this.r32;
        this.r43 = a3 - a1 * this.r13 - a2 * this.r23 - a3 * this.r33;
    };
    Rota3D.rotate = function (p) {
        return new Point3D(p.x * this.r11 + p.y * this.r21 + p.z * this.r31 + this.r41, p.x * this.r12 + p.y * this.r22 + p.z * this.r32 + this.r42, p.x * this.r13 + p.y * this.r23 + p.z * this.r33 + this.r43);
    };
    return Rota3D;
}());
export { Rota3D };
