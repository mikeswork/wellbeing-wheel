var validPts = [
	[
		{ x: 343, y: 252 },
		{ x: 374, y: 226 },
		{ x: 436, y: 175 },
		{ x: 343, y: 252 },
	],
	[
		{ x: 339, y: 276 },
		{ x: 377, y: 295 },
		{ x: 445, y: 328 },
		{ x: 339, y: 276 },
	],
	[
		{ x: 301, y: 278 },
		{ x: 265, y: 300 },
		{ x: 201, y: 338 },
		{ x: 301, y: 278 },
	],
	[
		{ x: 302, y: 254 },
		{ x: 261, y: 235 },
		{ x: 184, y: 194 },
		{ x: 302, y: 254 },
	],
];

var bgImg = new Image();
var shapes = [];
var shapeIndx = 0;
var canvas = document.getElementById("wheel");
var ctx;
const toggle = document.getElementById("shape-toggle");

function reset() {
	shapes = [];
	shapeIndx = 0;
	clear_canvas();

	if (toggle) {
		toggle.disabled = true;
		toggle.checked = false;
	}
}

function toggleShape() {
	shapeIndx = shapeIndx ? 0 : 1;
}

function vertex(x, y) {
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";
	ctx.fillRect(x - 3, y - 3, 6, 6);
	ctx.moveTo(x, y);
}

function clear_canvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById("coordinates").value = "";
	prep_canvas();
}

function draw() {
	clear_canvas();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "white";
	ctx.lineCap = "square";

	shapes.forEach((shape, indx) => {
		const perimeter = shape.points;
		const path = new Path2D();

		for (var i = 0; i < perimeter.length; i++) {
			// Draw point/line only if current point has coordinates
			if (perimeter[i] !== undefined) {
				if (i == 0) {
					path.moveTo(perimeter[i]["x"], perimeter[i]["y"]);
				} else {
					path.lineTo(perimeter[i]["x"], perimeter[i]["y"]);
				}

				shape.isComplete || vertex(perimeter[i]["x"], perimeter[i]["y"]);
			}
		}

		if (shape.isComplete) {
			path.lineTo(perimeter[0]["x"], perimeter[0]["y"]);
			path.closePath();
			ctx.fillStyle = indx % 2 ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)";
			ctx.fill(path);
			ctx.strokeStyle = "white";
		}
		ctx.stroke(path);

		// print coordinates
		if (perimeter.length == 0) {
			document.getElementById("coordinates").value = "";
		} else {
			document.getElementById("coordinates").value = JSON.stringify(perimeter);
		}
	});
}

function findSnap(clX, clY, snap = true) {
	if (!snap) return { x: clX, y: clY }; // Debug override

	let tDistance;
	let snapX = 1;
	let snapY = 1;
	let pGroup;

	// Look through all valid points and find the closest to user's click
	validPts.forEach((group, indx) => {
		group.forEach((pt) => {
			const newTDist = Math.abs(pt.x - clX) + Math.abs(pt.y - clY);
			if (newTDist < tDistance || tDistance === undefined) {
				snapX = pt.x;
				snapY = pt.y;

				tDistance = newTDist;
				pGroup = indx;
			}
		});
	});

	return { x: snapX, y: snapY, index: pGroup };
}

function point_it(event) {
	var rect;

	if (!shapes[shapeIndx]) {
		shapes[shapeIndx] = {
			isComplete: false,
			points: validPts.map(() => undefined), // Begin with array of undefined points
		};
	}

	let shape = shapes[shapeIndx];
	let perimeter = shape.points;

	rect = canvas.getBoundingClientRect();
	const { x, y, index } = findSnap(event.clientX - rect.left, event.clientY - rect.top);

	perimeter[index] = { x: x, y: y };

	if (!shape.isComplete) {
		// Complete if all points have been set
		if (perimeter.every((point) => point !== undefined)) {
			// Final point was created above--move to the first point automatically
			perimeter.push({ x: perimeter[0].x, y: perimeter[0].y });

			shape.isComplete = true;

			if (shapeIndx === 0) {
				// Automatically toggle to second shape after first shape is complete
				shapeIndx = 1;
			} else {
				// Show toggle switch after second shape is complete
				if (toggle) {
					toggle.disabled = false;
					toggle.checked = true;
				}
			}
		}
	} else {
		// When shape is complete, always update the existing first/last point
		// (created automatically) in case it should change based on an update to the shape
		const fIndex = perimeter.length - 1;
		perimeter[fIndex].x = perimeter[0].x;
		perimeter[fIndex].y = perimeter[0].y;
	}

	draw();
	return false;
}

function start() {
	bgImg.src = canvas.getAttribute("data-imgsrc");

	bgImg.onload = function () {
		prep_canvas();
	};
}

function prep_canvas() {
	if (!ctx) ctx = canvas.getContext("2d");

	ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}
