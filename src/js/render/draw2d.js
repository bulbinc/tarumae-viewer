import Tarumae from "../entry";
import { Vec2 } from "../math/vector"

////////// Point //////////

// Tarumae.Point = class {
// 	constructor(x, y) {
// 		this.x = x;
// 		this.y = y;
// 	}
	
// 	set(x, y) {
// 		this.x = x;
// 		this.y = y;
// 	}

// 	clone() {
// 		return new Tarumae.Point(this.x, this.y);
// 	}

// 	mulMat(m) {
// 		return new Tarumae.Point(
// 			this.x * m.a1 + this.y * m.a2 + m.a3,
// 			this.x * m.b1 + this.y * m.b2 + m.b3);
// 	}
// };

// Tarumae.Point.zero = new Tarumae.Point(0, 0);

Tarumae.Point = Vec2;

////////// Size //////////

Tarumae.Size = class {
	constructor(w, h) {
		switch (arguments.length) {
			case 0:
				this.width = 0;
				this.height = 0;
				break;

			case 1:
				var obj = arguments;
				if (typeof obj === "object") {
					this.width = obj.width;
					this.height = obj.height;
				}
				break;
		
			case 2:
				this.width = w;
				this.height = h;
				break;
		}

		this._arr = [this.width, this.height];
	}
	
	clone() {
		return new Tarumae.Size(this.width, this.height);
	}

	toArray() {
		this._arr[0] = this.width;
		this._arr[1] = this.height;
		return this._arr;
	}
};

////////// BBox2D //////////

Tarumae.BBox2D = class {
	constructor(a, b, c, d) {
		switch (arguments.length) {
			case 0:
				this.min = Vec2.zero.clone();
				this.max = Vec2.zero.clone();
				break;
			
			case 2:
				this.min = a;
				this.max = b;
				break;
			
			case 4:
				this.min.x = a;
				this.min.y = b;
				this.max.x = c;
				this.max.y = d;
				break;
			
			default:
				throw new Error("BBox2D: unsupported argument count");
		}
	}

	get size() {
		return new Tarumae.Size(this.max.x - this.min.x,
			this.max.y - this.min.y);
	}

	get origin() {
		const size = this.size;
		return new Tarumae.Point(this.min.x + size.width * 0.5,
			this.min.y + size.height * 0.5);
	}

	updateFromTwoPoints(p1, p2) {
		this.min.x = Math.min(p1.x, p2.x);
		this.min.y = Math.min(p1.y, p2.y);
		this.max.x = Math.max(p1.x, p2.x);
		this.max.y = Math.max(p1.y, p2.y);
	}

	contains(p) {
		return p.x >= this.min.x && p.x <= this.max.x
			&& p.y >= this.min.y && p.y <= this.max.y;
	}

	intersectsBBox2D(box2) {
		if (this.max.x < box2.min.x) return false;
		if (this.min.x > box2.max.x) return false;
		if (this.max.y < box2.min.y) return false;
		if (this.min.y > box2.max.y) return false;
	}

	static fromTwoPoints(v1, v2) {
		const bbox = new Tarumae.BBox2D();
		bbox.updateFromTwoPoints(v1, v2);
		return bbox;
	}
};

////////// Rect //////////

Tarumae.Rect = class {
	constructor(x, y, width, height) {
		switch (arguments.length) {
			default:
				this.x = 0;
				this.y = 0;
				this.width = 0;
				this.height = 0;
				break;

			case 2:
				this.x = arguments[0].x;
				this.y = arguments[0].y;
				this.width = arguments[1].width;
				this.height = arguments[1].height;
				break;

			case 4:
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				break;
		}
	}

	clone() {
		return new Tarumae.Rect(this.x, this.y, this.width, this.height);
	}

	contains(pos) {
		return this.x <= pos.x && this.y <= pos.y
			&& this.right >= pos.x && this.bottom >= pos.y;
	}
	
	moveTo(x, y) {
		this.x = x;
		this.y = y;
	}
	
	offset(value) {
		this.x += value.x;
		this.y += value.y;
	}

	get right() {
		return this.x + this.width;
	}
	
	set right(v) {
		this.width = this.x + v;
	}

	get bottom() {
		return this.y + this.height;
	}
	
	set bottom(v) {
		this.height = this.y + v;
	}

	get origin() {
		return new Tarumae.Point(
			this.x + this.width / 2,
			this.y + this.height / 2);
	}
	
	set origin(p) {
		this.x = p.x - this.width / 2;
		this.y = p.y - this.height / 2;
	}

	get topLeft() {
		return new Tarumae.Point(this.x, this.y);
	}

	get topRight() {
		return new Tarumae.Point(this.right, this.y);
	}

	get bottomLeft() {
		return new Tarumae.Point(this.x, this.bottom);
	}

	get bottomRight() {
		return new Tarumae.Point(this.right, this.bottom);
	}

	get topEdge() {
		return new Tarumae.LineSegment2D(this.x, this.y, this.right, this.y);
	}
	
	get bottomEdge() {
		return new Tarumae.LineSegment2D(this.x, this.bottom, this.right, this.bottom);
	}

	get leftEdge() {
		return new Tarumae.LineSegment2D(this.x, this.y, this.x, this.bottom);
	}
	
	get rightEdge() {
		return new Tarumae.LineSegment2D(this.right, this.y, this.right, this.bottom);
	}

	strink(x, y) {
		this.x += x;
		this.width -= x;
		this.y += y;
		this.height -= y;
	}

	set(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	bbox() {
		return new Tarumae.BBox2D(this.topLeft, this.bottomRight);
	}

	static createFromPoints(p1, p2) {
		var minx = Math.min(p1.x, p2.x);
		var miny = Math.min(p1.y, p2.y);
		var maxx = Math.max(p1.x, p2.x);
		var maxy = Math.max(p1.y, p2.y);
	
		return new Tarumae.Rect(minx, miny, maxx - minx, maxy - miny);
	}
};

////////// LineSegment2D //////////

Tarumae.LineSegment2D = class {
	constructor(x1, y1, x2, y2) {
		this.start = { x: x1, y: y1 };
		this.end = { x: x2, y: y2 };

		this.bbox = new Tarumae.BBox2D(
			Tarumae.Point.zero.clone(), Tarumae.Point.zero.clone());
		this.updateBoundingBox();
	}

	get x1() {
		return this.start.x;
	}
	set x1(v) {
		this.start.x = v;
		this.updateBoundingBoxX();
	}
	
	get y1() {
		return this.start.y;
	}
	set y1(v) {
		this.start.y = v;
		this.updateBoundingBoxY();
	}

	get x2() {
		return this.end.x;
	}
	set x2(v) {
		this.end.x = v;
		this.updateBoundingBoxX();
	}
	
	get y2() {
		return this.end.y;
	}
	set y2(v) {
		this.end.y = v;
		this.updateBoundingBoxY();
	}
	
	updateBoundingBox() {
		this.updateBoundingBoxX();
		this.updateBoundingBoxY();
	}

	updateBoundingBoxX() {
		this.bbox.min.x = Math.min(this.start.x, this.end.x) - 1;
		this.bbox.max.x = Math.max(this.start.x, this.end.x) + 1;
	}

	updateBoundingBoxY() {
		this.bbox.min.y = Math.min(this.start.y, this.end.y) - 1;
		this.bbox.max.y = Math.max(this.start.y, this.end.y) + 1;
	}

	intersectsLineSegment(l2) {

	}
};

Tarumae.Polygon = class {
	constructor(points) {
		this.points = points;
		this.bbox = new Tarumae.BBox2D();
		this.updateBoundingBox();
	}

	updateBoundingBox() {
		for (let i = 0; i < this.points.length; i++) {
			const x = this.points[i][0], y = this.points[i][1];
			
			const min = this.bbox.min, max = this.bbox.max;
			if (min.x > x) min.x = x;
			if (min.y > y) min.y = y;
			if (max.x < x) max.x = x;
			if (max.y < y) max.y = y;
		}
	}
};

////////// DrawingContext2D //////////

Tarumae.DrawingContext2D = class {
	constructor(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;

		this.resetDrawingStyle();

		this.currentTransform = new Tarumae.Matrix3().loadIdentity();
		this.transformStack = new Array();
	}

	pushTransform(t) {
		this.transformStack.push(this.currentTransform.clone());
		this.currentTransform = t.mul(this.currentTransform);
		t = this.currentTransform;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	popTransform() {
		this.currentTransform = this.transformStack.pop();
		var t = this.currentTransform;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	pushTranslation(x, y) {
		const m = Tarumae.Matrix3.makeTranslation(x, y);
		this.pushTransform(m);
		return m;
	}

	pushRotation(angle, x, y) {
		const m = Tarumae.Matrix3.makeRotation(angle, x, y);
		this.pushTransform(m);
		return m;
	}

	resetTransform() {
		this.currentTransform.loadIdentity();
		this.transformStack._s3_clear();
	}

	resetDrawingStyle() {
		this.strokeWidth = 1;
		this.strokeColor = "black";
		this.fillColor = "transparent";
	}

	drawRect(rect, strokeWidth, strokeColor, fillColor) {
		var ctx = this.ctx;
	
		fillColor = fillColor || this.fillColor;

		if (fillColor !== "transparent") {
			ctx.fillStyle = fillColor;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		}
		
		if (typeof strokeWidth !== "undefined") {
			ctx.lineWidth = strokeWidth;
		} else {
			ctx.lineWidth = this.strokeWidth;
		}

		if (strokeColor != undefined) {

			if (typeof strokeColor !== "undefined") {
				ctx.strokeStyle = strokeColor;
			} else {
				ctx.strokeStyle = this.strokeColor;
			}

			if (ctx.lineWidth > 0) {
				// ctx.beginPath();
				ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
				// ctx.closePath();
			}
		}
	}

	drawRoundRect(rect, cornerSize, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		fillColor = fillColor || this.fillColor;

		const minEdge = Math.min(rect.width, rect.height);
		if (cornerSize > minEdge) cornerSize = minEdge;

		const
			w = rect.width, h = rect.height,
			x = rect.x, y = rect.y,
			hc = cornerSize / 2,
			xe = x + w, ye = y + h;
	
		ctx.beginPath();
		ctx.moveTo(x + hc, y);
		ctx.arc(xe - hc, y + hc, hc, Math.PI / 2 + Math.PI, 0);
		ctx.arc(xe - hc, ye - hc, hc, 0, Math.PI / 2);
		ctx.arc(x + hc, ye - hc, hc, Math.PI / 2, Math.PI);
		ctx.arc(x + hc, y + hc, hc, Math.PI, Math.PI / 2 + Math.PI);
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		if (strokeWidth > 0 && strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}
	}

	drawPoint(p, size = 3, color = "black") {
		this.drawEllipse(new Tarumae.Rect(p.x - size / 2, p.y - size / 2, size, size), 0, null, color);
	}

	drawEllipse(rect, strokeWidth, strokeColor, fillColor) {
		var ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth;
		strokeColor = strokeColor || this.strokeColor;
		fillColor = fillColor || this.fillColor;

		var w = rect.width;
		var h = rect.height;
		var hw = w / 2;
		var hh = h / 2;
		// var x = rect.x - hw;
		// var y = rect.y - hh;
		var x = rect.x;
		var y = rect.y;
	
		var kappa = 0.5522848,
			ox = hw * kappa,   // control point offset horizontal
			oy = hh * kappa,   // control point offset vertical
			xe = x + w,        // x-end
			ye = y + h,        // y-end
			xm = x + hw,       // x-middle
			ym = y + hh;       // y-middle
	
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		if (typeof strokeWidth === "undefined") {
			strokeWidth = 1;
		}
	
		if (strokeWidth || strokeColor) {
			ctx.lineWidth = strokeWidth || 1;
			ctx.strokeStyle = strokeColor || "black";
			ctx.stroke();
		}
	}

	drawArc(rect, startAngle, endAngle, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		fillColor = fillColor || this.fillColor;

		const x = rect.x, y = rect.y,
			w = rect.width, h = rect.height,
			hw = w / 2, hh = h / 2,
			r = Math.max(w, h);
		
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, r, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
	
		if (strokeWidth > 0 && strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}
	}

	drawImage(p, image) {
		var ctx = this.ctx;
		
		ctx.drawImage(image, p.x, p.y);
	}

	drawText(p, text, color, halign, font) {
		var ctx = this.ctx;
	
		ctx.fillStyle = color || "black";
	
		var size = ctx.measureText(text);
	
		// TODO: get text height, allow to change text font
		ctx.font = "12px Arial";
	
		if (halign == "center") {
			p.x -= size.width / 2;
		}

		if (font) ctx.font = font;
	
		ctx.fillText(text, p.x, p.y);
  }
  		
	drawLine(from, to, width, color) {
		this.drawLineSegments([from, to], width, color);
	};
		
	drawLineSegments() {
		return this.drawLines(...arguments);
	};

	drawLines(lines, width, color, strip) {
		if (lines.length < 2) return;
	
		const ctx = this.ctx;
	
		if (width == undefined) width = this.strokeWidth;
		if (color == undefined) color = this.strokeColor;

		if (width > 0 && color != "transparent") {
			ctx.lineWidth = width || 1;
			ctx.strokeStyle = color || "black";
	
			ctx.beginPath();
	
			if (strip) {
				const from = lines[0];

				if (Array.isArray(from)) {
					ctx.moveTo(from[0], from[1]);
				} else {
					ctx.moveTo(from.x, from.y);
				}

				for (let i = 1; i < lines.length; i++) {
					const to = lines[i];
					if (Array.isArray(from)) {
						ctx.lineTo(to[0], to[1]);
					} else {
						ctx.lineTo(to.x, to.y);
					}
				}
			} else {
				for (let i = 0; i < lines.length; i += 2) {
					const from = lines[i], to = lines[i + 1];
					if (Array.isArray(from)) {
						ctx.moveTo(from[0], from[1]);
						ctx.lineTo(to[0], to[1]);
					} else {
						ctx.moveTo(from.x, from.y);
						ctx.lineTo(to.x, to.y);
					}
				}
			}

			ctx.closePath();
			ctx.stroke();
		}
	}
		
	drawArrow(from, to, width, color, arrowSize) {
		var ctx = this.ctx;
		
		if (width === undefined) width = 2;
		if (arrowSize === undefined) arrowSize = width * 5;
		
		ctx.lineWidth = width;
		ctx.strokeStyle = color || "black";
		
		var angle = Math.atan2(to.y - from.y, to.x - from.x);
		
		ctx.beginPath();
		
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		
		ctx.lineTo(to.x - arrowSize * Math.cos(angle - Math.PI / 6),
			to.y - arrowSize * Math.sin(angle - Math.PI / 6));
		
		ctx.moveTo(to.x, to.y);
		ctx.lineTo(to.x - arrowSize * Math.cos(angle + Math.PI / 6),
			to.y - arrowSize * Math.sin(angle + Math.PI / 6));
		
		ctx.closePath();
		ctx.stroke();
	};
		
	fillArrow(from, to, size, color) {
		var ctx = this.ctx;
		
		size = size || 10;
		ctx.fillStyle = color || "black";
		
		var angle = Math.atan2(to.y - from.y, to.x - from.x);
		
		ctx.beginPath();
		
		ctx.moveTo(to.x, to.y);
		ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
		ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
		
		ctx.closePath();
		ctx.fill();
	};
		
	drawPolygon(points, strokeWidth, strokeColor, fillColor) {
		var ctx = this.ctx;
		
		if (points.length < 2) return;
		
		ctx.beginPath();
		
		var p0 = points[0];
		ctx.moveTo(p0.x, p0.y);
		
		for (var i = 1; i < points.length; i++) {
			var p = points[i];
			ctx.lineTo(p.x, p.y);
		}
		
		ctx.lineTo(p0.x, p0.y);

		ctx.closePath();
		
		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
		
		if (strokeWidth || strokeColor) {
			ctx.lineWidth = strokeWidth || 1;
			ctx.strokeStyle = strokeColor || "black";
		
			ctx.stroke();
		}
	};
    
	drawEllipse(p, size, strokeWidth, strokeColor, fillColor) {
		var r = new Tarumae.Rect(p.x - size / 2, p.y - size / 2, size, size);
		return this.drawingContext2D.drawEllipse(r, strokeWidth, strokeColor, fillColor);
	};
		
	drawText2D() {
		return this.drawingContext2D.drawText.apply(this.drawingContext2D, arguments);
	};

};