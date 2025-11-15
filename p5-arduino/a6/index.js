// used base code: https://p5js.org/examples/games-snake/

// The snake moves along a grid, one space at a time
// The grid is smaller than the canvas, and its dimensions
//  are stored in these variables
let gridWidth = 30;
let gridHeight = 30;

let gameStarted = false;

// How many segments snake starts with
let startingSegments = 10;

// Starting coordinates for first segment
let xStart = 0;
let yStart = 15;

// Starting direction of motion
let startDirection = 'right';

// Current direction of motion
let direction = startDirection;

// The snake is divided into small segments,
// stored as vectors in this array
let segments = [];

let score = 0;
let highScore;

// The fruit's position is stored as a vector
// in this variable
let fruit;

//Web Serial set up
let port;
let connectBtn;

// Joystick values(middle values)
let joyX = 512;
let joyY = 512;

let canvas;
const BAUD_RATE = 9600;

function setup() {
  canvas = createCanvas(500, 500);
  canvas.style("position", "relative");
  canvas.style("z-index", "1"); // put canvas behind button

  // --- Center the canvas ---
  centerCanvas();

  setupSerial(); // Run our serial setup function

  frameRate(10);

  textAlign(CENTER, CENTER);
  textSize(2);

  highScore = getItem('high score');

  describe(
    'A reproduction of the arcade game Snake, in which a snake, represented by a green line on a black background, is controlled by the arrow keys. Users move the snake toward a fruit, represented by a red dot, but the snake must not hit the sides of the window or itself.'
  );
}

function draw() {

    // set background color
    background(0);

  // Set scale so that the game grid fills canvas
  scale(width / gridWidth, height / gridHeight);
  if (gameStarted === false) {
    showStartScreen();
  } else {
    // Shift over so that snake and fruit are still on screen
    // when their coordinates are 0
    translate(0.5, 0.5);
    showFruit();
    showSegments();
    joystickControl();
    updateSegments();
    checkForCollision();
    checkForFruit();
  }
}

function showStartScreen() {
  background(0);
  noStroke();
  fill(32);
  rect(2, gridHeight / 2 - 5, gridWidth - 4, 10, 2);
  fill(255);
  text(
    'Click to play.\nUse joystick to move.',
    gridWidth / 2,
    gridHeight / 2
  );
//   noLoop();
}


function mousePressed() {
  // Only start the game if:
  // 1. The game hasn't started yet
  // 2. The click is inside the canvas
  if (!gameStarted && mouseX >= 0 && mouseX <= width &&
                     mouseY >= 0 && mouseY <= height) {
    startGame();
  }
}
// function mousePressed() {
//   // If connectBtn doesn't exist yet, behave normally
//   if (!connectBtn) {
//     if (!gameStarted) startGame();
//     return;
//   }

//   // Get the page position and size of the connect button
//   const rect = connectBtn.elt.getBoundingClientRect();

//   // Convert the canvas-relative mouseX/mouseY to page coordinates
//   const pageX = mouseX + canvas.position().x;
//   const pageY = mouseY + canvas.position().y;

//   // If the click was inside the button's rectangle, do nothing
//   if (pageX >= rect.left && pageX <= rect.right && pageY >= rect.top && pageY <= rect.bottom) {
//     return;
//   }

//   // Otherwise, start the game if it hasn't started yet
//   if (!gameStarted) {
//     startGame();
//   }
// }


function startGame() {
  // Put the fruit in a random place
  updateFruitCoordinates();

  // Start with an empty array for segments
  segments = [];

  // Start with x at the starting position and repeat until specified
  // number of segments have been created, increasing x by 1 each time
  for (let x = xStart; x < xStart + startingSegments; x += 1) {
    // Create a new vector at the current position
    let segmentPosition = createVector(x, yStart);

    // Add it to the beginning of the array
    segments.unshift(segmentPosition);
  }

  direction = startDirection;
  score = 0;
  gameStarted = true;
  loop();
}

function showFruit() {
  stroke(255, 64, 32);
  point(fruit.x, fruit.y);
}

function showSegments() {
  noFill();
  stroke(96, 255, 64);
  beginShape();
  for (let segment of segments) {
    vertex(segment.x, segment.y);
  }
  endShape();
}

function updateSegments() {
  // Remove last segment
  segments.pop();

  // Copy current head of snake
  let head = segments[0].copy();

  // Insert the new snake head at the beginning of the array
  segments.unshift(head);

  // Adjust the head's position based on the current direction
  switch (direction) {
    case 'right':
      head.x = head.x + 1;
      break;
    case 'up':
      head.y = head.y - 1;
      break;
    case 'left':
      head.x = head.x - 1;
      break;
    case 'down':
      head.y = head.y + 1;
      break;
  }
}

function checkForCollision() {
  // Store first segment in array as head
  let head = segments[0];

  // If snake's head...
  if (
    // hit right edge or
    head.x >= gridWidth ||
    // hit left edge or
    head.x < 0 ||
    // hit bottom edge or
    head.y >= gridHeight ||
    // hit top edge or
    head.y < 0 ||
    // collided with itself
    selfColliding() === true
  ) {
    // show game over screen
    gameOver();
  }
}

function gameOver() {
  noStroke();
  fill(32);
  rect(2, gridHeight / 2 - 5, gridWidth - 4, 12, 2);
  fill(255);

  // Set high score to whichever is larger: current score or previous
  // high score
  highScore = max(score, highScore);

  // Put high score in local storage. This will be be stored in browser
  // data, even after the user reloads the page.
  storeItem('high score', highScore);
  text(
    `Game over!
Your score: ${score}
High score: ${highScore}
Click to play again.`,
    gridWidth / 2,
    gridHeight / 2
  );
  gameStarted = false;
  noLoop();
}

function selfColliding() {
  // Store the last segment as head
  let head = segments[0];

  // Store every segment except the first
  let segmentsAfterHead = segments.slice(1);

  // Check each of the other segments
  for (let segment of segmentsAfterHead) {
    // If segment is in the same place as head
    if (segment.equals(head) === true) {
      return true;
    }
  }
  return false;
}

function checkForFruit() {
  // Store first segment as head
  let head = segments[0];

  // If the head segment is in the same place as the fruit
  if (head.equals(fruit) === true) {
    // Give player a point
    score = score + 1;

    // Duplicate the tail segment
    let tail = segments[segments.length - 1];
    let newSegment = tail.copy();

    // Put the duplicate in the beginning of the array
    segments.push(newSegment);

    // Reset fruit to a new location
    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  // Pick a random new coordinate for the fruit
  // and round it down using floor().
  // Because the segments move in increments of 1,
  // in order for the snake to hit the same position
  // as the fruit, the fruit's coordinates must be
  // integers, but random() returns a float
  let x = floor(random(gridWidth));
  let y = floor(random(gridHeight));
  fruit = createVector(x, y);
}
// Controlling snake with the joystick
// Left = joyX < 400
// Right = joyX > 600
// Up = joyY < 400
// Down = joyY > 600

function joystickControl() {
    // if (joyX < 400 && direction !== 'right') {
    //     direction = 'left';
    // } else if (joyX > 600 && direction !== 'left') {
    //     direction = 'right';
    //  } else if (joyY < 400 && direction !== 'down') {
    //     direction = 'up';
    // } else if (joyY > 600 && direction !== 'up') {
    //     direction = 'down';
    // }
    const deadzoneLow = 450;
    const deadzoneHigh = 550;

    if (joyX < deadzoneLow && direction !== 'right') direction = 'left';
    else if (joyX > deadzoneHigh && direction !== 'left') direction = 'right';

    if (joyY < deadzoneLow && direction !== 'down') direction = 'up';
    else if (joyY > deadzoneHigh && direction !== 'up') direction = 'down';
}

// When an arrow key is pressed, switch the snake's direction of movement,
// but if the snake is already moving in the opposite direction,
// do nothing.
// function keyPressed() {
//   switch (keyCode) {
//     case LEFT_ARROW:
//       if (direction !== 'right') {
//         direction = 'left';
//       }
//       break;
//     case RIGHT_ARROW:
//       if (direction !== 'left') {
//         direction = 'right';
//       }
//       break;
//     case UP_ARROW:
//       if (direction !== 'down') {
//         direction = 'up';
//       }
//       break;
//     case DOWN_ARROW:
//       if (direction !== 'up') {
//         direction = 'down';
//       }
//       break;
//   }
// }

// Three helper functions for managing the serial connection.

// call this from setup()
function setupSerial() {
  port = createSerial();

  // check if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], BAUD_RATE);
  }

  // Create a connect button and place it outside the canvas
  connectBtn = createButton("Connect to Arduino");
  connectBtn.parent("serial-ui");        // put it in the serial-ui div
  connectBtn.style("position", "fixed"); // take it out of normal flow
  connectBtn.style("z-index", "9999");
  connectBtn.style("pointer-events", "auto");  
  connectBtn.position(20, 20);           // screen coordinates

 connectBtn.mousePressed(onConnectButtonClicked);

// debugging
// connectBtn.mousePressed(() => {
//   console.log("BUTTON CLICKED");
//   onConnectButtonClicked();
// });

 // Event-based reading
  port.on('data', gotJoystickData);

}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}

// Helper function to center the canvas
function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

// Keep canvas centered when window size changes
function windowResized() {
  centerCanvas();
}

// Called automatically when Arduino sends data
function gotJoystickData() {
  let currentString = port.readUntil("\n"); // read one line
  if (!currentString) return;

  let joyValues = currentString.trim().split(",");
  if (joyValues.length === 2) {
    joyX = int(joyValues[0]);
    joyY = int(joyValues[1]);
  }
}