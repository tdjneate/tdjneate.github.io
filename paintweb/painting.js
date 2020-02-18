var x1, y1, x2, y2, x3, y3, x4, y4;

var circleX, circleY;


var img;

var undos = [];
var redos = [];

var canvas; //for the main canvas


var brushPoint = new Array(2); 
var previousBrushPoint = new Array(2);

var smallPoint, largePoint; 

var controlDown = false;
var shiftDown = false;
var undo;


//cursor stuff

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
var matchColours = true;
var slightlyRandomColours = false;
var speedAffectsSize = false;

//brush types
var rectBrush = false;
var circleBrush = true;
var stop = false;

var horizontalMirror = false;
var verticalMirror = false;
var multiMirror = true;

var drawing = false;
var rubbing = true;

var brushSize = 15;

var imgs = ["Derek",  "Joan", "Andy", "Richard", "Michael", "Tim", "Elaine", "Paul", "Bryan", "Nial", "alley"];

var imageLoaded = 0;

var brushSizeSlider;
var button;
var brushSizeSliderLabel;
var numberOfMirrors;
var mirrorTriggerButton;
var mirrorOffsetX = .5;
var mirrorOffsetY = .5;

var clearButton;
var rubbingDotSizeSlider;
var brushModeButton;
var rubbingSquares = false;
var rubbingCircles = true;
var touchDown;
var  mirrorPoint;





function onload() 
{
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded.Cross-browser supported.
    window.scrollTo(0,0);

}


function setup() 
{

    frameRate(60);

    //canvas = createCanvas(innerWidth/2, innerWidth/3); //makes it 6 by 4
    //canvas = createCanvas(innerWidth/1.75, innerWidth/2.625); 
    
    canvas = createCanvas(innerWidth/1.5, innerWidth/2.25); //bigggg
    
    loadImageAndUpdatePreview();

    canvas.mouseReleased(addToUndoStack); // attach listener only for canvas

    canvas.parent('sketch-holder'); 
    background(20);

    clearPageButton = select('#clearPageButton');
    clearPageButton.mousePressed(clearScreen);


    var downloadImageButton = select('#downloadImageButton');
    downloadImageButton.mouseReleased(downloadImage);

    var nextImageButton = select('#nextImageButton');
    nextImageButton.mouseReleased(cycleToNextImage);


    var undoButton = select('#undoButton');
    undoButton.mouseReleased(undo);

    toggleModeInUI(false);  // this toggles the UI between 'painting mode'
    addToUndoStack(); // add the first thing to the undoStac
    mirrorPoint = [width/2, height/2]; // mirror point is the centre. Can change later.


}


function toggleModeInUI() 
{
    var drawingUI = document.getElementById("drawingUI");
    var rubbingUI  =  document.getElementById("rubbingUI");

    drawing = !drawing;
    rubbing = !rubbing;


    print("Drawing:" + drawing);
    print("Rubbing:" + rubbing);

    if (drawing)
    {
        drawingUI.style.display = "block";
        rubbingUI.style.display = "none";
        document.getElementById("toggleUIModeButton").src = "ui/drawing.png";

    }

    if (rubbing) 
    {
        drawingUI.style.display = "none";
        rubbingUI.style.display = "block";
        document.getElementById("toggleUIModeButton").src = "ui/rubbing.png";

    }

}




function clearScreen()
{

    var deleteCheck = confirm("Delete everything?");
    if(deleteCheck)
    {
        clear();
        print("clearing");
        background(20); 

        // touchingCanvas = false; // prevent drawing when we come back to the screen
    }
    else
    {
        print("user did not delete artwork");    
    }

}



function draw()
{


    if(touchingCanvas() && mouseIsPressed)
    {
        modeSelector();
    }

    //only do every 10 frames - if this gets slow, we can give each slider an 'on move' function
    if(frameCount % 10 == 0)
    {

        brushSize = select('#brushThicknessSlider').value();
        numberOfMirrors = select('#numberOfMirrors').value();
        dotSize = select('#rubbingDotSizeSlider').value();
        dotSpeed = select('#rubbingDotSpeedSlider').value();
    }
}

function cycleToNextImage()
{
    if (imageLoaded < imgs.length - 1)
    {
        imageLoaded++;
    } else
    {
        imageLoaded = 0;
    }

    loadImageAndUpdatePreview();
}

function loadImageAndUpdatePreview()
{

    img = loadImage("pics/" + imgs[imageLoaded] + ".jpg");   

    //img.resize(50,50);

    var previewPicture = select('#previewPicture');

    document.getElementById("previewPicture").src = "pics/" + imgs[imageLoaded] + ".jpg", "The preview image";



}


function toggleRubbingShape()
{
    rubbingCircles = !rubbingCircles;
    rubbingSquares = !rubbingSquares;
    print("squares:"  + rubbingSquares);
    print("circles:"  + rubbingCircles);
    if(rubbingCircles)
    {
        document.getElementById("shapeRubbingToggle").src = "ui/rubbingCircles.png"
    }
    if(rubbingSquares)
    {
        document.getElementById("shapeRubbingToggle").src = "ui/rubbingSquares.png";
    }
}

function speedAffectsSizeToggled()
{
    speedAffectsSize = !speedAffectsSize;
    if(speedAffectsSize)
    {
        document.getElementById("speedAffectsSizeToggle").src = "ui/speedEffectOn.png";
    }
    else
    {
        document.getElementById("speedAffectsSizeToggle").src = "ui/speedEffectOff.png";
    }

}


function colourInvertToggle()
{
    colourInvert =  !colourInvert;
    if(colourInvert)
    {
        document.getElementById("colourInvertToggle").src = "ui/invertColourOn.png";
    }
    else
    {
        document.getElementById("colourInvertToggle").src = "ui/invertColourOff.png";
    }
}


function toggleBrushMode()
{
    drawing = !drawing;
    rubbing = !rubbing; 
}


function toggleRandomColours()
{
    randomColours = !randomColours;


}



function touchingCanvas()
{

    if ((mouseX <= width) &&  (mouseX >= 0) &&   (mouseY <= height) && (mouseY >= 0)) 
    {
        return true;
    } 
    else
    {
        return false;
    } 
}



function modeSelector()
{





    if(numberOfMirrors == 0)
    {
        if (drawing)
        {
            drawWithBrush(mouseX, mouseY, pmouseX, pmouseY);
        }
        if (rubbing)
        {
            runPoints(mouseX, mouseY);
        }
    }
    else{


        var points  =  [mouseX, mouseY];
        var prevPoints = [pmouseX, pmouseY];
        mirror(mirrorPoint, numberOfMirrors, points, prevPoints);
        // circle(mirrorPoint[0], mirrorPoint[1], 20);
        //fill()
    }

}





function drawWithBrush(x,  y,  prevX,  prevY)
{ 
    var mouseSpeed;
    if(speedAffectsSize)
    {
        mouseSpeed =  dist(x, y, prevX, prevY);
        brushSize = brushSize + mouseSpeed/10 ; // this could be log or something
    }


    strokeWeight(brushSize);

    if(randomColours)
    {
        stroke(randomizeAllColours());
    }

    if(matchColours)
    {
        stroke(getColourAtPoint(x, y));
    }

    if (colourInvert)
    {       
        var col = getColourAtPoint(x, y);
        stroke(invertColor(red(col), green(col), blue(col)));
    }

    line(x, y, prevX, prevY);
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
            drawWithBrush(rotatedPoint[0], rotatedPoint[1], rotatedPreviousPoint[0], rotatedPreviousPoint[1]);
        }
        if (rubbing)runPoints(rotatedPoint[0], rotatedPoint[1]);
    }


}


function rotatePoint(points,  centre,  angle)
{

    angle = angle * (PI/180); //make it into radians



    var rotatedX = cos(angle) * (points[0] - centre[0]) - sin(angle) * (points[1] - centre[1]) + centre[0];


    var rotatedY = sin(angle) * (points[0] - centre[0]) + cos(angle) * (points[1] - centre[1]) + centre[1]; 

    rotatedPoint = [rotatedX, rotatedY];


    //
    return rotatedPoint;
}



function getColourAtPoint(xPos,  yPos)
{
    //this bit of maths is done because the resize function does not work. It might be less expensive too.
    xPos = xPos * (img.width/width);
    yPos = yPos * (img.height/height);

    var pix = img.get(xPos, yPos);

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
            randomPoint = getRandomPointInCircle(xPos, yPos, brushSize, brushSize);// if circle
        } else if (rectBrush)
        {
            randomPoint = getRandomPointInSquare(xPos, yPos, brushSize, brushSize);
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
        if(rubbingSquares)
        {   
            rect(randomPoint[0], randomPoint[1], randomCircleSize + xDotVariation, randomCircleSize + yDotVariation);
        }
        if(rubbingCircles)
        {
            ellipse(randomPoint[0], randomPoint[1], randomCircleSize + xDotVariation, randomCircleSize + yDotVariation);
        }
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

function windowResized()
{
    resizeCanvas(window.innerWidth/2, window.innerWidth/3);


}


function undo()
{
    if(undos.length > 1) // if there is more than the blank canvas there...
    {
        undos.pop();
        
        image(undos[undos.length - 1], 0 ,0); // set to last img in array
    }
    else if (undos.length == 0)
    {
        print("no more undo for you");
    }
}



/*
function redo()
{

    if(redos.length > 0)
    {
        redos.pop();
        image(redos[redos.length + 1 ], 0, 0);
    }
}
*/

function addToUndoStack()
{   
    
    undos.push(get());
}


function downloadImage ()
{

    saveCanvas('myCreation' , 'png');

}

//printing

/*
function printImage(path) 
{  
  Process p = exec("lp", path); 
  try {
    int result = p.waitFor();
    println("the process returned " + result);
  } 
  catch (InterruptedException e) {
    println("error : " + e);
  }
}
*/




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
        matchColours = !matchColours;
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
        clearScreen();
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
    }
    if ('0' <= key && key <= '9')
    {
        dotSize = int(key) - 48;
        print("brush: " + dotSize + "\n");
    }
}









/*
function mousePressed()
{
/if(touchingCanvas == true)
{
    modeSelector();
}
   // return false;
}
    //touchDown = true;
    */
function mouseReleased()
{
    touchDown = false;
    
    if(touchingCanvas() == true)
    {
        addToUndoStack();

    }
}


function touchMoved()
{
    if(touchingCanvas() == true)
    {
        return false;
    }
}

function mouseMoved()
{
    if(touchingCanvas() == true)
    {
        return false;
    }

}
function mousePressed()
{

    if(touchingCanvas() == true)
    {
        return false;
    }
    // return false;
}


