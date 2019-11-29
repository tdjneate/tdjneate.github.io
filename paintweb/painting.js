var x1, y1, x2, y2, x3, y3, x4, y4;

var circleX, circleY;

var col;
var counter = 0;
var strokeWidth = 8;
var maxStrokeLength = 32;
var bristleCount = 6; 
var bristleThickness = 3;
var img;

var canvas; //for the main canvas


var brushPoint = new Array(2); 
var previousBrushPoint = new Array(2);

var smallPoint, largePoint; 

var controlDown = false;
var shiftDown = false;
var undo;


//cursor stuff

var cx;
var cy;
var circleSize = 75;
var overBox = false;
var locked = false;
var xOffset = 0.0; 
var yOffset = 0.0; 


var dotSize = 2;
var dotWidth = 100;
var dotHeight = 200;
var dotSpeed = 50;

var colourInvert = false;

var xDotVariation, yDotVariation;
var randomDotShape = false;
var randomColours = false;
var slightlyRandomColours = false;
var speedAffectsSize = true;

//brush types
var rectBrush = false;
var circleBrush = true;

var stop = false;

var horizontalMirror = false;
var verticalMirror = false;
var multiMirror = false;

var drawing = true;
var rubbing = false;


var imgs = ["alley", "beach", "mountain", "sea", "tree", "waterfall"];
var imageLoaded = 0;



function preload() 
{
  img = loadImage("pics/" + imgs[imageLoaded] + ".jpg");
}

function setup() 
{
  var canvas = createCanvas(displayWidth/2, displayHeight/2 );

  canvas.parent('sketch-holder');
  
  //undo = new Undo(20); //setup some undos

 // initNewStroke();

  cx = width/2.0;
  cy = height/2.0;
  rectMode(RADIUS);  

  background(20);
}



function touchStarted() {

  xOffset = mouseX-cx; 
  yOffset = mouseY-cy; 
  modeSelector();
}



function touchMoved() {
  if (locked) 
  {
    cx = mouseX-xOffset; 
    cy = mouseY-yOffset;
  }

  modeSelector();
    return false;
}



function modeSelector()
{

  if (drawing)
  {
    drawWithBrush(mouseX, mouseY, pmouseX, pmouseY);
  }
  if (rubbing)
  {
    runPoints(mouseX, mouseY);
  }
  if(multiMirror)
  {
      var  mirrorPoint = [width/2,height/2];
      var points  =  [mouseX, mouseY];
      var prevPoints = [pmouseX, pmouseY];
      mirror(mirrorPoint, 5, points, prevPoints);
  
  
  }
}


function drawWithBrush( x,  y,  prevX,  prevY)
{ 
    var mouseSpeed;
    var brushSize;
  if(speedAffectsSize)
    {
     mouseSpeed =  dist(x, y, prevX, prevY);
    brushSize = mouseSpeed * 5;
    }
    else{brushSize = 15;}
    
    strokeWeight(brushSize);
    
    stroke(getColourAtPoint(x, y)); 
    line(x, y, prevX, prevY);
}


function mouseReleased() {
  locked = false;
 // undo.takeSnapshot(); //save current state
}




function keyPressed()
{
  if (key == 's')
  {
    stop = !stop;
  }
  if (key == 'r') // for random dot shapes
  {
    randomDotShape = !randomDotShape;
  }
  if (key == 'i')
  {
    colourInvert = !colourInvert;
  }
  if (key == ',')
  {
    randomColours = !randomColours;
  }
  if (key == 'z')
  {
    slightlyRandomColours = !slightlyRandomColours;
  }
  if (key == 'p')
  {
    save("data/picture.png");

    var picturePath = dataPath("");
    print(dataPath(""));

    printImage(picturePath + "picture.png");
  }
  if (key == 'h')

  {
    horizontalMirror = true;
    verticalMirror = false;
  }

  if (key == 'v')
  {
    verticalMirror = true;
    horizontalMirror = false;
  }

  if (key == 'g') //undo
  {
    undo.undo();
  }
  if (key == 'f')
  {
    undo.redo();
  }
  if (key == 'c')
  {
    clear();
    background(20);
  }
  if(key == 'a')
  {
    multiMirror = !multiMirror;
    
  }
  if(key == 'k')
  {
    speedAffectsSize = !speedAffectsSize;
  }

  if (key == 'l')
  {
    if (imageLoaded < imgs.length - 1)
    {
      imageLoaded++;
    } else
    {
      imageLoaded = 0;
    }
    img = loadImage("pics/" + imgs[imageLoaded] + ".jpg");
  }

  if (key == 'q') //switch the brush
  {
    rectBrush = !rectBrush;
    circleBrush = !circleBrush;
  }
  if (key == 'm')
  {
    drawing = !drawing;
    rubbing = !rubbing; 
    print("Rubbing: " + rubbing + "\n" + "Drawing" + drawing + "\n" );
  }
  if ('0' <= key && key <= '9')
  {
    dotSize = int(key) - 48;
    print("brush: " + dotSize + "\n");
  }
}


function mirror(rotationPoint, totalMirrors,  point, prevPoint)
{
    var  mousePoints = [point[0], point[1]];
    var  previousMousePoints = [prevPoint[0], prevPoint[1]];
    
    var mirrorAngle = 360/totalMirrors;
    for(var mirrors = 1; mirrors <= totalMirrors; mirrors++)
    {
    
    var angleToShift = mirrors * mirrorAngle; 
    var rotatedPoint  = rotatePoint(mousePoints, rotationPoint, angleToShift);
    var rotatedPreviousPoint = rotatePoint(previousMousePoints, rotationPoint, angleToShift);
       
    if (drawing)
    {
      line(rotatedPoint[0], rotatedPoint[1], rotatedPreviousPoint[0], rotatedPreviousPoint[1]);
    }
    if (rubbing)runPoints(rotatedPoint[0], rotatedPoint[1]);
    }
    

}


function rotatePoint(points,  centre,  angle)
{
  
  angle = angle * (PI/180); //make it into radians
  
  var rotatedX = cos(angle) * (points[0] - centre[0]) - sin(angle) * (points[1]-centre[1]) + centre[0];
  var rotatedY = sin(angle) * (points[0] - centre[0]) + cos(angle) * (points[1] - centre[1]) + centre[0];
  
   rotatedPoint = [rotatedX, rotatedY];
   
   return rotatedPoint;
}



function getColourAtPoint(xPos,  yPos)
{
  
  var pix = img.get(xPos, yPos); 
 // print("color: " + pix);

  return pix;
}



function getRandomPointInCircle( xPos,  yPos,  w,  h)
{
  var randX=random(w);
  var randY=random(h);
  var  angle= random(359);

  var  circleX = randX*cos(radians(angle)) + xPos;
  var circleY = randY*sin(radians(angle)) + yPos;

  var randomCirclePoint = [circleX, circleY];
  return randomCirclePoint;
}


function getRandomPointInSquare(xPos, yPos,  w,  h)
{
  var cursorMinX = xPos - w / 2;
  var cursorMaxX = xPos + w / 2;
  var cursorMinY = yPos - h / 2;
  var cursorMaxY = yPos + h / 2;

  var pointX = random(cursorMinX, cursorMaxX);
  var pointY = random(cursorMinY, cursorMaxY);
  var randomSquarePoint  = [pointX, pointY];
  return randomSquarePoint;
}


function runPoints(xPos, yPos)
{
  for (var i=0; i < dotSpeed; i++) 
  {
    var randomPoint = new Array (2); //load as blank for now

    if (circleBrush)
    {
      randomPoint = getRandomPointInCircle(xPos, yPos, 30, 30);// if circle
    } else if (rectBrush)
    {
      randomPoint = getRandomPointInSquare(xPos, yPos, 60, 60);
    }

       pix = getColourAtPoint(randomPoint[0], randomPoint[1]);
  
    if (colourInvert)
    {
      pix = invertColor(red(pix), green(pix), blue(pix));
    }
    if (randomColours)
    {
      pix = randomizeAllColours();
    }
    if (slightlyRandomColours)
    {
      pix = randomR(red(pix), green(pix), blue(pix));
    }

    fill(pix, 128);
    //  fill(233,233,233);
      
    noStroke();

    if (randomDotShape)
    {
      xDotVariation = random(-10, 10);
      yDotVariation = random(-10, 10);
    } else
    {
      xDotVariation = 0;
      yDotVariation = 0;
    }

    var randomCircleSize = random(1 * dotSize, 4 * dotSize);

    ellipse(randomPoint[0], randomPoint[1], randomCircleSize + xDotVariation, randomCircleSize + yDotVariation);
  }
}








function mutateColor(c) {
  var mr = 10; // mutation rate
  var r = red(c);
  var g = green(c);
  var b = blue(c);
  r += random(-mr, mr);
  r = constrain(r, 0, 255);
  g += random(-mr, mr);
  g = constrain(g, 0, 255);
  b += random(-mr, mr);
  b = constrain(b, 0, 255);
  return color(r, g, b);
}

function invertColor( r,  g,  b) 
{
  return color(255 - r, 255 - g, 255 - b);
}

function randomR(r, g, b) {

  return color(random(0, 255), 255 - g, 255 - b);//randomize one channel
}


function slightlyRandomizeAllColours( r,  g,  b) {

  var slightVariation = random(-40, 40); 
  return color(r + slightVariation, g + slightVariation, b + slightVariation);//randomize one channel
}



function randomizeAllColours() 
{

  return color(random(0, 255), random(0, 255), random(0, 255));//randomize one channel
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

/*
 FOR UNDO AND REDO 
 Methods from: https://www.openprocessing.org/sketch/131411/
 */
 
/*
class Undo
{
  constructor()
    {
          this.undoSteps =  0;
        this.redoSteps =  0;  
    }


circImageCollection  images;

  Undo( levels) {
    images = new CircImgCollection(levels);
  }

function takeSnapshot()
  {
    undoSteps = min(undoSteps+1, images.amount-1);
    // each time we draw we disable redo
    redoSteps = 0;
    images.next();
    images.capture();
  }

  function undo() {
    if (undoSteps > 0) {
      undoSteps--;
      redoSteps++;
      images.prev();
      images.show();
      if (undoSteps == 1)
      {
        background(20); //also reset background if last time
      }
    }
  }

  function redo() 
{
    if (redoSteps > 0) {
      undoSteps++;
      redoSteps--;
      images.next();
      images.show();
    }
  }
}


class CircImgCollection {
  var amount, current;
  PImage[] img;

  CircImgCollection( amountOfImages) {
    amount = amountOfImages;

    // Initialize all images as copies of the current display
    var = new PImage[amount];
    for (var i=0; i<amount; i++) 
    {
      img[i] = createImage(width, height, RGB);
      img[i] = get();
    }
  }
  function next() {
    current = (current + 1) % amount;
  }
  function prev() {
    current = (current - 1 + amount) % amount;
  }
  function capture() {
    img[current] = get();
  }
  function show() {
    image(img[current], 0, 0);
  }
}



function printImage( path) 
{  
  var p = exec("lp", path); 
  try {
    var result = p.waitFor();

    println("the process returned " + result);
  } 
  catch (e) {
    println("error : " + e);
  }
}


*/


















