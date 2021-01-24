/*
   jPolygon - a ligthweigth javascript library to draw polygons over HTML5 canvas images.
   Project URL: http://www.matteomattei.com/projects/jpolygon
   Author: Matteo Mattei <matteo.mattei@gmail.com>
   Version: 1.0
   License: MIT License
*/

var bgImg = new Image();
var shapes = new Array();
var complete = false;
var canvas = document.getElementById("jPolygon");
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

function point(x, y){
    ctx.fillStyle="white";
    ctx.strokeStyle = "white";
    ctx.fillRect(x-2,y-2,4,4);
    ctx.moveTo(x,y);
}

function reset() {
    shapes = new Array();
    clear_canvas();
}

function clear_canvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('coordinates').value = '';
    prep_canvas();
}

function draw(end){
    clear_canvas();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    // ctx.beginPath();
    const realCtx = ctx;
    shapes.forEach((perimeter, indx) => {
        let ctx = new Path2D();
        for(var i=0; i<perimeter.length; i++){
            if(i==0){
                ctx.moveTo(perimeter[i]['x'],perimeter[i]['y']);
                end || point(perimeter[i]['x'],perimeter[i]['y']);
            } else {
                ctx.lineTo(perimeter[i]['x'],perimeter[i]['y']);
                end || point(perimeter[i]['x'],perimeter[i]['y']);
            }
        }

        // If end of latest shape or current shape/perimeter being drawn was completed previously
        if(end || indx < shapes.length-1){
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

function point_it(event) {
    var rect, x, y;

    let perimeter;
    if (shapes.length == 0 || complete == true) {
        perimeter = new Array();
        shapes.push(perimeter)
        complete = false;
    } else {
        perimeter = shapes[shapes.length-1];
    }
    // var perimeter = shapes.length > 0 ?  : new Array();

    if(event.ctrlKey || event.which === 3 || event.button === 2){
        if(perimeter.length==2){
            alert('You need at least three points for a polygon');
            return false;
        }
        x = perimeter[0]['x'];
        y = perimeter[0]['y'];

        draw(true);
        complete = true;
	    event.preventDefault();
        return false;
    } else {
        rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (perimeter.length>0 && x == perimeter[perimeter.length-1]['x'] && y == perimeter[perimeter.length-1]['y']){
            // same point - double click
            return false;
        }
        perimeter.push({'x':x,'y':y});
        draw(false);
        return false;
    }
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