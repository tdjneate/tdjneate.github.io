/*

Painting APP

*/



//float x1, y1, x2, y2, x3, y3, x4, y4;

var circleX, circleY;

let col;
let counter = 0;
let strokeWidth = 8;
let maxStrokeLength = 32;
let bristleCount = 6;
let bristleThickness = 3;
let img;

let smallPoint, largePoint; 


//cursor stuff

let cx;
let cy;
let circleSize = 75;
let overBox = false;
let locked = false;
let xOffset = 0.0; 
let yOffset = 0.0; 


let dotSize = 2;
let dotWidth = 100;
let dotHeight = 200;
let dotSpeed = 50;

let colourInvert = false;

let xDotVariation, yDotVariation;
let randomDotShape = false;
let randomColours = false;
let slightlyRandomColours = false;

//brush types
let rectBrush = false;
let circleBrush = true;

let stop = false;

let horizontalMirror = false;
let verticalMirror = false;
let drawing = true;
let rubbing = false;


function setup() {
  background(255);
  //source image. Add your own here.
  //img = loadImage("capybara.jpg");
  img = loadImage("sea.jpg");
 
  createCanvas(1500,1000);
 // initNewStroke();
  
  cx = width/2.0;
  cy = height/2.0;
  rectMode(RADIUS);  

background(0);

}



function draw() 
{
  



  
}

function mousePressed() {

  xOffset = mouseX-cx; 
  yOffset = mouseY-cy; 
modeSelector();
  
}

function mouseDragged() {
  if(locked) 
  {
    cx = mouseX-xOffset; 
    cy = mouseY-yOffset; 
  }
  
modeSelector();
  


}

function modeSelector()
{
  
  if(drawing)
  {
    

    strokeWeight(8);
    stroke(getColourAtPoint(mouseX, mouseY)); 
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  if(rubbing)
  {
    runPoints(mouseX, mouseY);
    
  }
  mirrorMouse();
}

function getColourAtPoint(xPos,  yPos)
{
  let pix = img.get(xPos, yPos);
  
  return pix;
}


function mirrorMouse()
{
   if(horizontalMirror)
  {
    mirrorHorizontally();
  }
  if(verticalMirror)
  {
    mirrorVertically();
  }
}
function quadMirror()
{
  
}

function mirrorVertically()
{
    if(mouseY < height / 2)
  {
    stroke(getColourAtPoint(mouseX, height - mouseY)); 
    if(drawing){line(mouseX, height - mouseY, pmouseX, height - pmouseY);}
    if(rubbing){runPoints(mouseX, height - mouseY);}
  }
  else if(mouseY >= height / 2)
  {  stroke(getColourAtPoint(mouseX, abs(height - mouseY))); 
    if(drawing){line(mouseX, abs(height - mouseY), pmouseX, abs(height - pmouseY));}
    if(rubbing)runPoints(mouseX, abs(height - mouseY));
  }
}


function mirrorHorizontally()
{
  
  if(mouseX < width / 2)
  {stroke(getColourAtPoint(width - mouseX, mouseY)); 
    if(drawing){line(width - mouseX, mouseY, width - pmouseX, pmouseY);}
    if(rubbing){runPoints(width - mouseX, mouseY);}
  }
  else if(mouseX >= width /2)
  {
    stroke(getColourAtPoint(abs(width - mouseX), mouseY)); 
    if(rubbing){runPoints(abs(width - mouseX), mouseY);}
    if(drawing){line(abs(width - mouseX), mouseY, abs(width - pmouseX), pmouseY);}

    
  }
}


function mouseReleased() {
  locked = false;
}



function getRandomPointInCircle( xPos,  yPos,  w,  h)
{
  let randX=random(w);
   let randY=random(h);
  let  angle= random(359);
  
  let  circleX = (randX*cos(radians(angle))) + xPos;
  let circleY = (randY*sin(radians(angle))) + yPos;
  
  let randomCirclePoint = {circleX, circleY};
  return randomCirclePoint;

}


function  getRandomPointInSquare( xPos,  yPos,  w,  h)
{
  let cursorMinX = xPos - w / 2;
  let cursorMaxX = xPos + w / 2;
 let cursorMinY = yPos - h / 2;
  let cursorMaxY = yPos + h / 2;
 
  let pointX = random(cursorMinX,cursorMaxX);
  let pointY = random(cursorMinY, cursorMaxY);
  let randomSquarePoint = {pointX, pointY};
  return randomSquarePoint;
}

function runPoints( xPos,  yPos)
{
 
for ( i=0; i < dotSpeed; i++) 
{
 // let randomPoint = {0, 0}; //load as blank for nowbbbb
  
  if(circleBrush)
  {
  randomPoint = getRandomPointInCircle(xPos, yPos,30, 30);// if circle
  }
  else if(rectBrush)
  {
   randomPoint = getRandomPointInSquare(xPos, yPos, 60, 60);
  }



   col = img.get(randomPoint[0],randomPoint[1]);
  let pix = img.get(randomPoint[0],randomPoint[1]);
 
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
  noStroke();
  
  
  
  if(randomDotShape)
  {
    xDotVariation = random(-10, 10);
    yDotVariation = random(-10, 10);
    
  }
  else
  {
    xDotVariation = 0;
    yDotVariation = 0;
  }

  let randomCircleSize = random(1 * dotSize  ,4 * dotSize);
 
   ellipse(randomPoint[0], randomPoint[1],randomCircleSize + xDotVariation, randomCircleSize + yDotVariation);
  }
  
}


function keyPressed()
{
  if(key == 's')
  {
    stop = !stop;
  }
  if(key == 'r') // for random dot shapes
  {
    randomDotShape = !randomDotShape;
  }
  if(key == 'i')
  {
    colourInvert = !colourInvert;
  }
    if(key == 'c')
  {
    randomColours = !randomColours;
  }
      if(key == 'z')
  {
    slightlyRandomColours = !slightlyRandomColours;
  }
  if(key == 'p')
  {
   save("data/picture.png");

   let picturePath = dataPath("");
   print(dataPath(""));
   
   printImage(picturePath + "picture.png");
   
  }
    if(key == 'h')
    
  {
    horizontalMirror = true;
    verticalMirror = false;
  }

     if(key == 'v')
    
  {
    verticalMirror = true;
    horizontalMirror = false;
  }
  
  if(key == 'q') //switch the brush
  {
    rectBrush = !rectBrush;
    circleBrush = !circleBrush;
  }
  if(key == 'm')
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

function mutateColor(c) {
  let mr = 10; // mutation rate
  let r = red(c);
  let g = green(c);
  let b = blue(c);
  r += random(-mr, mr);
  r = constrain(r, 0, 255);
  g += random(-mr, mr);
  g = constrain(g, 0, 255);
  b += random(-mr, mr);
  b = constrain(b, 0, 255);
  return color(r, g, b);
}

function invertColor(  r,  g,  b) {

  return color(255 - r, 255 - g, 255 - b);
}

function randomR( r,  g, b) {

  return color(random(0, 255), 255 - g, 255 - b);//randomize one channel
}


function slightlyRandomizeAllColours( r,  g,  b) {

  let slightVariation = random(-40, 40); 
  return color(r + slightVariation, g + slightVariation, b + slightVariation);//randomize one channel
}



function randomizeAllColours() {

  return color(random(0, 255), random(0, 255), random(0, 255));//randomize one channel
}




function printImage( path) 
{  
  let p = exec("lp", path); 
  try {
    let result = p.waitFor();
    
    println("the process returned " + result);
  } 
  catch ( e) {
    println("error : " + e);
  }
}