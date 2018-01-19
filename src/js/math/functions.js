////////////////////////////////////////////////////////////////////////////////
// tarumae engine
// http://tarumae.jp
//
// Copyright(c) 2016 BULB CORP. all rights reserved
////////////////////////////////////////////////////////////////////////////////

import Tarumae from "../entry"
import { Vec3, vec4 } from "./vector"

Tarumae.MathFunctions = {
  _PIAngleDelta: Math.PI / 180.0,

  degreeToAngle: function(d) {
    return d * 180.0 / Math.PI;
  },
  angleToDegree: function(a) {
    return a * Tarumae.MathFunctions._PIAngleDelta;
  },
  
  abs: function(v) {
    if (v instanceof Vec3) {
      return new Vec3(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    }
  },

  clamp: function(v, min, max) {
    if (!min) min = 0;
    if (!max) max = 1;

    if (typeof v === "number") {
      if (v < min) return min;
      else if (v > max) return max;
      else return v;
    } else if (v instanceof Vec3) {
      return new Vec3(Tarumae.MathFunctions.clamp(v.x, min, max),
        Tarumae.MathFunctions.clamp(v.y, min, max),
        Tarumae.MathFunctions.clamp(v.z, min, max));
    } else if (v instanceof vec4) {
      return new vec4(Tarumae.MathFunctions.clamp(v.x, min, max),
        Tarumae.MathFunctions.clamp(v.y, min, max),
        Tarumae.MathFunctions.clamp(v.z, min, max),
        Tarumae.MathFunctions.clamp(v.w, min, max));
    } else if (v instanceof Vec2) {
      return new Vec3(Tarumae.MathFunctions.clamp(v.x, min, max),
        Tarumae.MathFunctions.clamp(v.y, min, max));
    }
  },

  smoothstep: function(edge0, edge1, x) {
    var t = Tarumae.MathFunctions.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  },

  distancePointToLine: function(lp1, lp2, p) {
    return Tarumae.MathFunctions.distancePointToLineXY(lp1.x, lp1.y, lp2.x, lp2.y, p);
  },
  
  distancePointToLineXY: function(x1, y1, x2, y2, p) {
    var a = y2 - y1;
    var b = x1 - x2;
    var c = x2 * y1 - x1 * y2;
    return Math.abs(a * p.x + b * p.y + c) / Math.sqrt(a * a + b * b);
  },

  rectContainsPoint: function(rx, ry, rw, rh, px, py) {
    var hw = rw / 2, hy = rh / 2;
    return rx - hw <= px && rx + hw >= px && ry - hy <= py && ry + hy >= py;
  },

  triangleContainsPoint2D: function(v1, v2, v3, p) {
    function sign(pt, p2, p3) {
      return (pt.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (pt.y - p3.y);
    }

    var b1, b2, b3;

    b1 = sign(p, v1, v2) < 0;
    b2 = sign(p, v2, v3) < 0;
    b3 = sign(p, v3, v1) < 0;

    return ((b1 == b2) && (b2 == b3));
  },
  
  eulerAnglesFromVectors: function(v1, v2) {
    var l = v1 - v2;
    
    var padj = sqrt(pow(l.x, 2) + pow(l.z, 2));
    
    var x = atan2f(l.x, l.z);
    var y = 90 - atan2(padj, l.y);

    return { x: Tarumae.MathFunctions.degreeToAngle(x), y: Tarumae.MathFunctions.degreeToAngle(y) };
  },

  getEulerAnglesFromMatrix: function(m/*, order*/) {
    var
      m11 = m.a1, m12 = m.b1, m13 = m.c1,
      m21 = m.a2, m22 = m.b2, m23 = m.c2,
      m31 = m.a3, m32 = m.b3, m33 = m.c3;
    
    var x, y, z;
    
    if (m21 > 0.99999 || m21 < -0.99999) {
      x = 0;
      y = Math.atan2(m13, m33);
      z = -Math.PI / 2;
    } else {
      x = Math.atan2(m23, m22);
      y = Math.atan2(m31, m11);
      z = Math.asin(-m21);
    }

    return new Vec3(Tarumae.MathFunctions.degreeToAngle(x),
      Tarumae.MathFunctions.degreeToAngle(y),
      Tarumae.MathFunctions.degreeToAngle(z));
  
    // original source: https://github.com/mrdoob/three.js/blob/master/src/math/Euler.js    

    // if (typeof order !== "string" || order.length == 0) {
    //   order = "XYZ";
    // }
    
    // var
    // m11 = m.a1, m21 = m.b1, m31 = m.c1,
    // m12 = m.a2, m22 = m.b2, m32 = m.c2,
    // m13 = m.a3, m23 = m.b3, m33 = m.c3;
    // m11 = m.a1, m12 = m.b1, m13 = m.c1,
    // m21 = m.a2, m22 = m.b2, m23 = m.c2,
    // m31 = m.a3, m32 = m.b3, m33 = m.c3;

    // var clamp = Tarumae.MathFunctions.clamp;    
   
    // switch (order) {
    //   default:
    //     console.warn('Tarumae.MathFunctions.getEulerAnglesFromMatrix() given unsupported order: ' + order);
    //     break;

    //   case "XYZ":
    //     y = Math.asin(clamp(m13, -1, 1));

    //     if (Math.abs(m13) < 0.99999) {
    //       x = Math.atan2(-m23, m33);
    //       z = Math.atan2(-m12, m11);
    //     } else {
    //       x = Math.atan2(m32, m22);
    //       z = 0;
    //     }
    //     break;

    //   case "YXZ":
    //     x = Math.asin(-clamp(m23, -1, 1));

    //     if (Math.abs(m23) < 0.99999) {
    //       y = Math.atan2(m13, m33);
    //       z = Math.atan2(m21, m22);
    //     } else {
    //       y = Math.atan2(-m31, m11);
    //       z = 0;
    //     }
    //     break;

    //   case "ZXY":
    //     x = Math.asin(clamp(m32, -1, 1));

    //     if (Math.abs(m32) < 0.99999) {
    //       y = Math.atan2(-m31, m33);
    //       z = Math.atan2(-m12, m22);
    //     } else {
    //       y = 0;
    //       z = Math.atan2(m21, m11);
    //     }
    //     break;

    //   case "YZX":
    //     z = Math.asin(clamp(m21, - 1, 1));

    //     if (Math.abs(m21) < 0.99999) {
    //       x = Math.atan2(-m23, m22);
    //       y = Math.atan2(-m31, m11);
    //     } else {
    //       x = 0;
    //       y = Math.atan2(m13, m33);
    //     }
    //     break;

    //   case "XZY":
    //     z = Math.asin(-clamp(m12, -1, 1));

    //     if (Math.abs(m12) < 0.99999) {
    //       x = Math.atan2(m32, m22);
    //       y = Math.atan2(m13, m11);
    //     } else {
    //       x = Math.atan2(-m23, m33);
    //       y = 0;
    //     }
    //     break;

    // case "ZYX":
    //     y = Math.asin(-clamp(m31, -1, 1));

    //     if (Math.abs(m31) < 0.99999) {
    //       x = Math.atan2(m32, m33);
    //       z = Math.atan2(m21, m11);
    //     } else {
    //       x = 0;
    //       z = Math.atan2(-m12, m22);
    //     }
    //     break;
    // }

    // return new Vec3(Tarumae.MathFunctions.degreeToAngle(x),
    //   Tarumae.MathFunctions.degreeToAngle(y),
    //   Tarumae.MathFunctions.degreeToAngle(z));
  },

  triangleContainsPoint: function(p, v1orTriangle, v2, v3) {
    var v1;

    if (v1orTriangle instanceof Array) {
      v1 = v1orTriangle[0];
      v2 = v1orTriangle[1];
      v3 = v1orTriangle[2];
    } else if (typeof v1orTriangle === "object") {
      v1 = v1orTriangle.v1;
      v2 = v1orTriangle.v2;
      v3 = v1orTriangle.v3;
    } else {
      v1 = v1orTriangle;
    }

    var s = v1.y * v3.x - v1.x * v3.y + (v3.y - v1.y) * p.x + (v1.x - v3.x) * p.y;
    var t = v1.x * v2.y - v1.y * v2.x + (v1.y - v2.y) * p.x + (v2.x - v1.x) * p.y;

    if ((s < 0) != (t < 0))
      return false;

    var area = -v2.y * v3.x + v1.y * (v3.x - v2.x) + v1.x * (v2.y - v3.y) + v2.x * v3.y;
    
    if (area < 0.0) {
      s = -s;
      t = -t;
      area = -area;
    }

    return s > 0 && t > 0 && (s + t) <= area;
  },

  polygonContainsPoint2D: function(polygon, p) {
    // refer to: http://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
    
    var isInside = false;
    var minX = polygon[0].x, maxX = polygon[0].x;
    var minY = polygon[0].y, maxY = polygon[0].y;

    for (var n = 1; n < polygon.length; n++) {
      var q = polygon[n];
      minX = Math.min(q.x, minX);
      maxX = Math.max(q.x, maxX);
      minY = Math.min(q.y, minY);
      maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
      return false;
    }

    var i = 0, j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
      if ((polygon[i].y > p.y) != (polygon[j].y > p.y) &&
        p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) {
        isInside = !isInside;
      }
    }

    return isInside;
  },
  
  angleToArc: function(width, height, angle) {
    return (180.0 / Math.PI * Math.atan2(
      Math.sin(angle * Tarumae.MathFunctions._PIAngleDelta) * height / width,
      Math.cos(angle * Tarumae.MathFunctions._PIAngleDelta)));
  },

  lineIntersectsLine2D: function(line1StartX, line1StartY, line1EndX, line1EndY,
    line2StartX, line2StartY, line2EndX, line2EndY) {
    // original source: http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
    
    var denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    
    if (denominator === 0) {
      return null;
    }

    var a = line1StartY - line2StartY;
    var b = line1StartX - line2StartX;

    var numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    var numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);

    a = numerator1 / denominator;
    b = numerator2 / denominator;

    if ((a < 0 || a > 1) && (b < 0 || b > 1)) {
      return null;
    }
    
    // if we cast these lines infinitely in both directions, they intersect here:
    var result = {
      x: line1StartX + (a * (line1EndX - line1StartX)),
      y: line1StartY + (a * (line1EndY - line1StartY)),
      ta: a,
      tb: b,
    };

    return result;
  },

  rayIntersectsPlane: function(ray, plane, maxt) {
    var pd = plane.v2.sub(plane.v1).cross(plane.v3.sub(plane.v2));
    var len = pd.length();
    var l = new vec4(pd.x, pd.y, pd.z, pd.neg().dot(plane.v1)).mul(1.0 / len);

    var dist = -l.dot(new vec4(ray.origin.x, ray.origin.y, ray.origin.z, 1.0))
      / l.dot(new vec4(ray.dir.x, ray.dir.y, ray.dir.z, 0.0));

    if (dist < 0 || isNaN(dist)) {
      return null;
    }

    if (typeof maxt !== "undefined" && dist > maxt) {
      return null;
    }
    
    var hit = ray.origin.add(ray.dir.mul(dist));

    return { t: dist, hit: hit };
  },
  
  rayIntersectsTriangle: function(ray, t, maxt) {
    var pd = t.v2.sub(t.v1).cross(t.v3.sub(t.v2));
    var len = pd.length();
    var l = new vec4(pd.x, pd.y, pd.z, pd.neg().dot(t.v1)).mul(1.0 / len);

    var dist = -l.dot(new vec4(ray.origin.x, ray.origin.y, ray.origin.z, 1.0))
      / l.dot(new vec4(ray.dir.x, ray.dir.y, ray.dir.z, 0.0));

    if (dist < 0 || isNaN(dist) || dist > maxt) {
      return null;
    }

    var hit = ray.origin.add(ray.dir.mul(dist));

    var c;

    c = t.v2.sub(t.v1).cross(hit.sub(t.v1));
    if (pd.dot(c) < 0) return null;

    c = t.v3.sub(t.v2).cross(hit.sub(t.v2));
    if (pd.dot(c) < 0) return null;

    c = t.v1.sub(t.v3).cross(hit.sub(t.v3));
    if (pd.dot(c) < 0) return null;

    return { t: dist, hit: hit };
    //return pointInTriangle3D(hit, normalize(pd), t);
  },

  rayIntersectsSphere: function(ray, sphere, out) {
    var m = Vec3.sub(ray.origin, sphere.origin);
    
    var b = Vec3.dot(m, ray.dir);
    var c = Vec3.dot(m, m) - sphere.radius * sphere.radius;

    if (c > 0.0 && b > 0.0) return false;

    var discr = b * b - c;

    // A negative discriminant corresponds to ray missing sphere 
    if (discr < 0.0) return false;

    if (typeof out === "object") {
      // Ray now found to intersect sphere, compute smallest t value of intersection
      out.t = -b - Math.sqrt(discr);

      // If t is negative, ray started inside sphere so clamp t to zero 
      if (out.t < 0.0) out.t = 0.0;
    
      out.hit = Vec3.add(ray.origin, Vec3.mul(ray.dir, out.t));
    }

    return true;
  },

  rayIntersectsBox: function(ray, bbox, out) {
    // r.dir is unit direction vector of ray
    var dir = ray.dir;
    var dirfrac = new Vec3(1.0 / dir.x, 1.0 / dir.y, 1.0 / dir.z);

    var org = ray.origin, lb = bbox.min, rt = bbox.max;

    var t1 = (lb.x - org.x) * dirfrac.x;
    var t2 = (rt.x - org.x) * dirfrac.x;
    var t3 = (lb.y - org.y) * dirfrac.y;
    var t4 = (rt.y - org.y) * dirfrac.y;
    var t5 = (lb.z - org.z) * dirfrac.z;
    var t6 = (rt.z - org.z) * dirfrac.z;

    var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

    // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmax < 0) {
      if (typeof out === "object") {
        out.t = tmax;
      }

      return false;
    }

    var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax) {
      if (typeof out === "object") {
        out.t = tmax;
      }
      return false;
    }

    if (typeof out === "object") {
      out.t = tmin;
    }

    return true;
  },

  calcVertexInterpolation: function(t, p) {
    var f1 = t.v1.sub(p);
    var f2 = t.v2.sub(p);
    var f3 = t.v3.sub(p);

    var a = ((t.v1.sub(t.v2)).cross(t.v1.sub(t.v3))).length();
    
    return {
      a1: f2.cross(f3).length() / a,
      a2: f3.cross(f1).length() / a,
      a3: f1.cross(f2).length() / a,
    };
  },

  calcHitInterpolation: function(t, hit) {
    var int = Tarumae.MathFunctions.calcVertexInterpolation(t, hit);

    return {
      normal: (t.n1.mul(int.a1)).add(t.n2.mul(int.a2)).add(t.n3.mul(int.a3)),
    };
  },

  //pointAtArc: function(Rectangle rect, RGFloat angle)
  //         {
  //             RGFloat radians = (RGFloat)((GraphicsToolkit.AngleToArc(
  //                 rect.Width, rect.Height, angle)) * PIAngleDelta);

  //             RGFloat ww = rect.Width / 2;
  //             RGFloat hh = rect.Height / 2;

  //             RGFloat x = (RGFloat)Math.Sin(radians) * ww;
  //             RGFloat y = (RGFloat)Math.Cos(radians) * hh;

  //             return new Tarumae.Point(rect.X + ww + x, rect.Y + hh - y);
  //         }

  _AXISTEST_X01: function(a, b, v0, v2, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p0 = a * v0.y - b * v0.z;
    var p2 = a * v2.y - b * v2.z;
    if (p0 < p2) { min = p0; max = p2; } else { min = p2; max = p0; }
    rad = fa * boxHalfSize.y + fb * boxHalfSize.z;
    return !(min > rad || max < -rad);
  },
  
  _AXISTEST_X2: function(a, b, v0, v1, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p0 = a * v0.y - b * v0.z;
    var p1 = a * v1.y - b * v1.z;
    if (p0 < p1) { min = p0; max = p1; } else { min = p1; max = p0; }
    var rad = fa * boxHalfSize.y + fb * boxHalfSize.z;
    return !(min > rad || max < -rad);
  },

  _AXISTEST_Y02: function(a, b, v0, v2, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p0 = -a * v0.x + b * v0.z;
    var p2 = -a * v2.x + b * v2.z;
    if (p0 < p2) { min = p0; max = p2; } else { min = p2; max = p0; }
    var rad = fa * boxHalfSize.x + fb * boxHalfSize.z;
    return !(min > rad || max < -rad);
  },

  _AXISTEST_Y1: function(a, b, v0, v1, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p0 = -a * v0.x + b * v0.z;
    var p1 = -a * v1.x + b * v1.z;
    if (p0 < p1) { min = p0; max = p1; } else { min = p1; max = p0; }
    var rad = fa * boxHalfSize.x + fb * boxHalfSize.z;
    return !(min > rad || max < -rad);
  },

  _AXISTEST_Z12: function(a, b, v1, v2, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p1 = a * v1.x - b * v1.y;
    var p2 = a * v2.x - b * v2.y;
    if (p2 < p1) { min = p2; max = p1; } else { min = p1; max = p2; }
    var rad = fa * boxHalfSize.x + fb * boxHalfSize.y;
    return !(min > rad || max < -rad);
  },

  _AXISTEST_Z0: function(a, b, v0, v1, fa, fb, boxHalfSize) {
    var min = 0.0, max = 0.0;
    var p0 = a * v0.x - b * v0.y;
    var p1 = a * v1.x - b * v1.y;
    if (p0 < p1) { min = p0; max = p1; } else { min = p1; max = p0; }
    var rad = fa * boxHalfSize.x + fb * boxHalfSize.y;
    return !(min > rad || max < -rad);
  },

  _FINDMINMAX: function(x0, x1, x2, res) {
    var min = x0, max = x0;
    if (x1 < min) min = x1;
    if (x1 > max) max = x1;
    if (x2 < min) min = x2;
    if (x2 > max) max = x2;
    return { min: min, max: max };
  },

  planeBoxOverlap: function(normal, vert, maxbox) {
    var vmin, vmax;
    
    // x
    if (normal.x > 0.0) {
      vmin.x = -maxbox.x - vert.x;
      vmax.x = maxbox.x - vert.x;
    } else {
      vmin.x = maxbox.x - vert.x;
      vmax.x = -maxbox.x - vert.x;
    }
    
    // y
    if (normal.y > 0.0) {
      vmin.y = -maxbox.y - vert.y;
      vmax.y = maxbox.y - vert.y;
    } else {
      vmin.y = maxbox.y - vert.y;
      vmax.y = -maxbox.y - vert.y;
    }

    // z
    if (normal.z > 0.0) {
      vmin.z = -maxbox.z - vert.z;
      vmax.z = maxbox.z - vert.z;
    } else {
      vmin.z = maxbox.z - vert.z;
      vmax.z = -maxbox.z - vert.z;
    }
    
    if (normal.dot(vmin) > 0.0) {
      return false;
    }

    return (normal.dot(vmax) >= 0.0);
  },

  triangleIntersectBox: function(boxcenter, boxHalfSize, t) {

    var v0 = t.v1.sub(boxcenter);
    var v1 = t.v2.sub(boxcenter);
    var v2 = t.v3.sub(boxcenter);
  
    /* compute triangle edges */
    var e0 = v1.sub(v0);      /* tri edge 0 */
    var e1 = v2.sub(v1);      /* tri edge 1 */
    var e2 = v0.sub(v2);      /* tri edge 2 */
  
    var fe;

    var mf = Tarumae.MathFunctions;
    
    /* Bullet 3:  */
    fe = mf.abs3(e0);
  
    if (!mf.AXISTEST_X01(e0.z, e0.y, v0, v2, fe.z, fe.y, boxHalfSize)) return false;
    if (!mf.AXISTEST_Y02(e0.z, e0.x, v0, v2, fe.z, fe.x, boxHalfSize)) return false;
    if (!mf.AXISTEST_Z12(e0.y, e0.x, v1, v2, fe.y, fe.x, boxHalfSize)) return false;
  
    fe = mf.abs3(e1);
  
    if (!mf.AXISTEST_X01(e1.z, e1.y, v0, v2, fe.z, fe.y, boxHalfSize)) return false;
    if (!mf.AXISTEST_Y02(e1.z, e1.x, v0, v2, fe.z, fe.x, boxHalfSize)) return false;
    if (!mf.AXISTEST_Z0(e1.y, e1.x, v0, v1, fe.y, fe.x, boxHalfSize)) return false;
  
    fe = mf.abs3(e2);
  
    if (!mf.AXISTEST_X2(e2.z, e2.y, v0, v1, fe.z, fe.y, boxHalfSize)) return false;
    if (!mf.AXISTEST_Y1(e2.z, e2.x, v0, v1, fe.z, fe.x, boxHalfSize)) return false;
    if (!mf.AXISTEST_Z12(e2.y, e2.x, v1, v2, fe.y, fe.x, boxHalfSize)) return false;
  
    /* Bullet 1: */
    /*  first test overlap in the {x,y,z}-directions */
    /*  find min, max of the triangle each direction, and test for overlap in */
    /*  that direction -- this is equivalent to testing a minimal AABB around */
    /*  the triangle against the AABB */
  
    var mm;

    /* test in X-direction */
    mm = mf.FINDMINMAX(v0.x, v1.x, v2.x, mm);
    if (mm.min > boxHalfSize.x || mm.max < -boxHalfSize.x) return false;
  
    /* test in Y-direction */
    mm = mf.FINDMINMAX(v0.y, v1.y, v2.y, mm);
    if (mm.min > boxHalfSize.y || mm.max < -boxHalfSize.y) return false;
  
    /* test in Z-direction */
    mm = mf.FINDMINMAX(v0.z, v1.z, v2.z, mm);
    if (mm.min > boxHalfSize.z || mm.max < -boxHalfSize.z) return false;
  
    /* Bullet 2: */
    var normal = e0.cross(e1);
  
    if (!mf.planeBoxOverlap(normal, v0, boxHalfSize)) return false;
  
    return true;   /* box and triangle overlaps */
  },
};