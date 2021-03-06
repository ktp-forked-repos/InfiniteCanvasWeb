
Decimal.set({precision: 50});

var aspectRatio = 0;

var mainCamera = new Camera(new Vec2(new Decimal(0), new Decimal(0)), new Decimal(1));

var shapes = [];

var currentLine, currentText;

var imageShapes = [], currentImageShape;

var mouseDelta =
{
	start: new p5.Vector(0, 0),
	total: new p5.Vector(0, 0)
};



function getAspectRatio()
{
	return width / height;
}



function preload()
{
	let links = ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/290px-The_Earth_seen_from_Apollo_17.jpg"];

	links.forEach(function(link))
	{
		imageShapes.push(loadImage(link));
	});
}

function setup()
{
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas_container");

	canvas.onclick = function(event)
	{
		console.log(event);
	}

	colorMode(HSL, 1, 1, 1, 1);
	rectMode(CENTER);

	background(color(1, 1, 1));

	aspectRatio = getAspectRatio();

	currentImageShape = imageShapes[0];
}

function draw()
{
	let deltatime = 1 / frameRate();

	mouseDelta.total = mouseDelta.start.sub(new p5.Vector(mouseX, mouseY));
	mouseDelta.start = createVector(mouseX, mouseY);

	mainCamera.tick(deltatime);

	if(mousePressed)
	{
		if(currentLine !== undefined)
		{
			currentLine.endPosition = mainCamera.screenToWorldPoint(new p5.Vector(mouseX, mouseY));
			if(currentLine.minLengthReached())
			{
				placeLine();
			}
		}
	}

	background(color(1, 1, 1));

	noStroke();

	shapes.forEach(function(s)
	{
		s.render();
	});

	fill(colorFromCSSString(settings.color));
	let brushSize = [Number.parseFloat(settings.brushSize.x), Number.parseFloat(settings.brushSize.y)];
	switch(settings.tool)
	{
		case "ellipse":
			noStroke();
			ellipse(mouseX, mouseY, width * brushSize[0], width * brushSize[1]);
			break;
		case "rectangle":
			noStroke();
			rectMode(CENTER);
			rect(mouseX, mouseY, width * brushSize[0], width * brushSize[1]);
			break;
		case "line":
			noStroke();
			ellipse(mouseX, mouseY, width * brushSize[0], width * brushSize[0]);
			break;
		case "text":
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(brushSize[0] * width);
			text("A", mouseX, mouseY);
			break;
		case "image":
			noStroke();
			Utils.imageExt(currentImageShape, mouseX, mouseY, brushSize[0] * width, brushSize[1] * width, colorFromCSSString(settings.color), radians(settings.image.rotation));
			break;
		default:
			break;
	}

	stroke(0);
  strokeWeight(2);
  rectMode(CORNER);
  for(let x = 0, i = 0; x < width; x += width / 10, i++)
  {
    fill(i % 2 == 0 ? 0 : color(0, 0, 1, 1));
		rect(x, height * 0.98, width / 10, 30);
  }
  rectMode(CENTER);

	textAlign(CENTER, BOTTOM);
	fill(0);
	textSize(40);
	text("<- " + DistanceFormatter.format(mainCamera.getRange()) + " ->", width / 2, height - 40);

	textAlign(LEFT, TOP);
}

function windowResized()
{
	resizeCanvas(windowWidth, windowHeight);

	aspectRatio = getAspectRatio();
}

function keyTyped()
{
	if(currentText !== undefined)
	{
		currentText.text += key;
	}
}

function mousePressed(event)
{
	if(event.buttons === 1 && !cursorOnToolbar)
	{
		if(settings.tool === "line")
		{
			placeLine();
		}
		else
		{
			placeShape();
		}
	}
}

function mouseReleased()
{
	currentLine = undefined;
}

function mouseDragged(event)
{
	if(event.buttons === 2)
	{
		let delta = new p5.Vector(mouseDelta.total.x * -1, mouseDelta.total.y).div(width);
		mainCamera.moveRelative(new p5.Vector(delta.x, delta.y));
	}
}

function mouseWheel(event)
{
	mainCamera.zoomIn(Decimal.pow(0.8, new Decimal(event.delta / 100)));
}

function placeShape()
{
	let color = colorFromCSSString(settings.color);
	let position = mainCamera.screenToWorldPoint(createVector(mouseX, mouseY));
	let size = new Vec2(mainCamera.getRange().mul(Number.parseFloat(settings.brushSize.x)),
						mainCamera.getRange().mul(Number.parseFloat(settings.brushSize.y)));

	switch(settings.tool)
	{
		case "ellipse":
			addShape(new Ellipse(position, size, color));
			break;
		case "rectangle":
			addShape(new Rectangle(position, size, color));
			break;
		case "text":
			currentText = addShape(new Text("", position, size.x, color));
			break;
		case "image":
			addShape(new ImageShape(position, size, currentImageShape, color, radians(settings.image.rotation)));
			break;
		default:
			break;
	}
}

function placeLine()
{
	let color = colorFromCSSString(settings.color);
	let startPos = mainCamera.screenToWorldPoint(new p5.Vector(mouseX, mouseY));
	let width = mainCamera.getRange().mul(Number.parseFloat(settings.brushSize.x));
	currentLine = addShape(new Line(startPos, startPos, width, color));
}

function addShape(shape)
{
	shapes.push(shape);
	return shape;
}
