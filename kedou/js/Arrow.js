var Arrow = function(tadpole, camera) {
    var arrow = this;

    this.x = 0;
    this.y = 0;

    this.tadpole = tadpole;
    this.camera = camera;

    this.angle = 0;
    this.distance = 10;

    this.opacity = 1;

    this.draw = function(canvas, context, bounds) {
        //在可视范围内不显示三角符号
        if (arrow.tadpole.x > bounds.min.x &&
            arrow.tadpole.y > bounds.min.y &&
            arrow.tadpole.x < bounds.max.x &&
            arrow.tadpole.y < bounds.max.y)
            return;

        // Update arrows
        arrow.angle = Math.atan2(tadpole.y - bounds.cen.y, tadpole.x - bounds.cen.x);

        var size = 4;

        var arrowDistance = 100;

        var angle = arrow.angle;
        var w = (canvas.width / 2) - 10;
        var h = (canvas.height / 2) - 10;
        var aa = Math.atan(h / w);
        var ss = Math.cos(angle);
        var cc = Math.sin(angle);

        if ((Math.abs(angle) + aa) % Math.PI / 2 < aa) {
            arrowDistance = w / Math.abs(ss);
        } else {
            arrowDistance = h / Math.abs(cc);
        }

        var x = (canvas.width / 2) + Math.cos(arrow.angle) * arrowDistance;
        var y = (canvas.height / 2) + Math.sin(arrow.angle) * arrowDistance;

        var point = calcPoint(x, y, this.angle, 2, size);
        var side1 = calcPoint(x, y, this.angle, 1.5, size);
        var side2 = calcPoint(x, y, this.angle, 0.5, size);

        var gender = tadpole.gender;
        if (gender < 0) gender = 0;
        if (gender > 2) gender = 2;
        var genderRgb = ["226,219,226", "192, 253, 247", "255, 181, 197"];

        arrow.angle = Math.atan2();

        //实际距离 / 可显示距离
        var dis1 = Math.sqrt(Math.pow(tadpole.y - bounds.cen.y, 2) + Math.pow(tadpole.x - bounds.cen.x, 2));
        //透明度和距离成反比
        arrow.opacity = arrowDistance / dis1;
        if (arrow.opacity > 1) arrow.opacity = 1;

        // Draw arrow
        context.fillStyle = "rgba(" + genderRgb[gender] + "," + arrow.opacity + ')';

        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(side1.x, side1.y);
        context.lineTo(side2.x, side2.y)
        context.closePath();
        context.fill();
    };

    var calcPoint = function(x, y, angle, angleMultiplier, length) {
        return {
            x: x + Math.cos(angle + Math.PI * angleMultiplier) * length,
            y: y + Math.sin(angle + Math.PI * angleMultiplier) * length
        }
    };
}