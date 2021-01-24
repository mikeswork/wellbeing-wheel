/*
   jPolygon - a ligthweigth javascript library to draw polygons over HTML5 canvas images.
   Project URL: http://www.matteomattei.com/projects/jpolygon
   Author: Matteo Mattei <matteo.mattei@gmail.com>
   Version: 1.0
   License: MIT License
*/

var validPts = [
    [{"x":352,"y":195},{"x":401,"y":147},{"x":452,"y":94}],
    [{"x":334,"y":238},{"x":382,"y":304},{"x":431,"y":373}],
    [{"x":309,"y":211},{"x":239,"y":166},{"x":159,"y":127}]
];

var bgImg = new Image();
var shapes = [];
var shapeIndx = 0;
var canvas = document.getElementById("wheel");
var ctx;

function line_intersects(p0, p1, p2, p3) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1['x'] - p0['x'];
    s1_y = p1['y'] - p0['y'];
    s2_x = p3['x'] - p2['x'];
    s2_y = p3['y'] - p2['y'];

    var s, t;
    s = (-s1_y * (p0['x'] - p2['x']) + s1_x * (p0['y'] - p2['y'])) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0['y'] - p2['y']) - s2_y * (p0['x'] - p2['x'])) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }
    return false; // No collision
}

function vertex(x, y){
    ctx.fillStyle="white";
    ctx.strokeStyle = "white";
    ctx.fillRect(x-2,y-2,4,4);
    ctx.moveTo(x,y);
}

function reset() {
    shapes = [];
    shapeIndx = 0;
    clear_canvas();
}

function clear_canvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('coordinates').value = '';
    prep_canvas();
}

function draw(){
    clear_canvas();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    // ctx.beginPath();
    const realCtx = ctx;
    shapes.forEach((shape, indx) => {
        perimeter = shape.points;

        let ctx = new Path2D();
        for(var i=0; i<perimeter.length; i++){
            if(i==0){
                ctx.moveTo(perimeter[i]['x'],perimeter[i]['y']);
                shape.isComplete || vertex(perimeter[i]['x'],perimeter[i]['y']);
            } else {
                ctx.lineTo(perimeter[i]['x'],perimeter[i]['y']);
                shape.isComplete || vertex(perimeter[i]['x'],perimeter[i]['y']);
            }
        }

        if(shape.isComplete){
            ctx.lineTo(perimeter[0]['x'],perimeter[0]['y']);
            ctx.closePath();
            realCtx.fillStyle = indx % 2 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 255, 0.5)';
            realCtx.fill(ctx);
            realCtx.strokeStyle = 'white';
        }
        realCtx.stroke(ctx);
    
        // print coordinates
        if(perimeter.length == 0){
            document.getElementById('coordinates').value = '';
        } else {
            document.getElementById('coordinates').value = JSON.stringify(perimeter);
        }
    });
   
}

function findNearest(clX, clY, snap = true) {
    if (!snap) return {x: clX, y: clY};  // Debug override

    let tDistance;
    let snapX = 1;
    let snapY = 1;
    let pGroup;

    validPts.forEach((group, indx) => {
        group.forEach(pt => {
            const newTDist = Math.abs(pt.x - clX) + Math.abs(pt.y - clY);
            if (newTDist < tDistance || tDistance === undefined) {
                snapX = pt.x;
                snapY = pt.y;

                tDistance = newTDist;
                pGroup = indx;
            }
        })
    })

    return {x: snapX, y: snapY, index: pGroup};
}

function point_it(event) {
    var rect;

    // TODO: Hook shapeIndx into toggle switch
    let perimeter = shapes[shapeIndx] && shapes[shapeIndx].points || [];

    rect = canvas.getBoundingClientRect();
    const { x, y, index } = findNearest(event.clientX - rect.left, event.clientY - rect.top);

    if (index < perimeter.length) {
        // Replace existing point
        perimeter[index].x = x;
        perimeter[index].y = y;
    } else {
        // Point doesn't exist, create new one
        perimeter.push({'x':x,'y':y});
    }

    let isComplete = shapes[shapeIndx] && shapes[shapeIndx].isComplete;

    finalX = perimeter[0].x;
    finalY = perimeter[0].y;

    if (!isComplete) {
        if (perimeter.length === validPts.length) {
            // Final point was created above--move to the first point automatically
            perimeter.push({'x':finalX,'y':finalY});

            isComplete = true;
        }
    } else {
        // Always update the existing first/last point in case it changed
        const fIndex = perimeter.length - 1;
        perimeter[fIndex].x = finalX;
        perimeter[fIndex].y = finalY;
    }

    shapes[shapeIndx] = { "isComplete": isComplete, "points": perimeter };
    
    draw();
    return false;
}

function start() {
    bgImg.src = canvas.getAttribute('data-imgsrc');

    bgImg.onload = function(){
        prep_canvas();
    }
}

function prep_canvas() {
    if (!ctx) ctx = canvas.getContext("2d");
    
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}