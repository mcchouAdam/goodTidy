// Canvas ----------------------------------------------------------------
let rect = {};
let drag = false;
let canvas;
let context;
let c = $('#fontOCRCanvas')[0];
let ctx = c.getContext('2d');

// hidden& previewBlash
let previewBlah = document.getElementById('blah');
previewBlah.onload = () => canvasBackground();

// Draw the upload image to canvas
function canvasBackground() {
  ctx.drawImage(previewBlah, 0, 0);
  canvas = $('#fontOCRCanvas')[0];
  context = canvas.getContext('2d');
}

function clearContext(canvas, context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// 魔術曲線圈選 ---------------------
function initCanvasListener(canvas) {
  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', finishedPosition);
}

function removeCanvasListener(canvas) {
  canvas.removeEventListener('mousedown', startPosition);
  canvas.removeEventListener('mouseup', finishedPosition);
}

// 方形圈選 ------------------------
function initRectContourListener(canvas) {
  canvas.addEventListener('mousedown', rectContour_mousedown);
  canvas.addEventListener('mouseup', rectContour_mouseup);
  canvas.addEventListener('mousemove', rectContour_mousemove);
}

function removeRectContourRemoveListener(canvas) {
  canvas.removeEventListener('mousedown', rectContour_mousedown);
  canvas.removeEventListener('mouseup', rectContour_mouseup);
  canvas.removeEventListener('mousemove', rectContour_mousemove);
}

// // 去除非文字區塊 ------------------------
function initRectListener(canvas) {
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('mousemove', mouseMove);
}

function removeRectRemoveListener(canvas) {
  canvas.removeEventListener('mousedown', mouseDown);
  canvas.removeEventListener('mouseup', mouseUp);
  canvas.removeEventListener('mousemove', mouseMove);
}

// Painting --------------------------------------------------------------------------
// let painting = false;
let clientX_percent;
let clientY_percent;

// 高寬
let Screen_width = 600;
let Screen_height = 300;

// clip-path的參數
let X_percent;
let Y_percent;
let Screen_percent_arr = [];

// 魔術曲線 ---------------------------------------------------------------------------
function startPosition(e) {
  // painting = true;

  // 圈選的座標
  let bounding = c.getBoundingClientRect();
  let positionX = e.clientX - bounding.left;
  let positionY = e.clientY - bounding.top;

  // 畫小方形
  ctx.fillStyle = 'green';
  ctx.fillRect(positionX, positionY, 7, 7);

  X_percent = parseInt((positionX / Screen_width) * 100);
  Y_percent = parseInt((positionY / Screen_height) * 100);
  Screen_percent_arr.push([`${X_percent}% ${Y_percent}%`]);
  element_position_arr.push(parseInt(positionX));
  element_positionY_arr.push(parseInt(positionY));

  console.log(parseInt(positionX), parseInt(positionY));
}

function finishedPosition(e) {
  // painting = false;
  // ctx.moveTo(e.clientX - 15, e.clientY - 135);
}

// 去除文字方塊遮蔽 ----------------------------------------
function mouseDown(e) {
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop;
  drag = true;
}

function mouseUp() {
  drag = false;
}

function mouseMove(e) {
  if (drag) {
    rect.w = e.pageX - this.offsetLeft - rect.startX;
    rect.h = e.pageY - this.offsetTop - rect.startY;
    context.fillStyle = 'rgba(0,0,0)';
    drawMarker();
  }
}

function drawMarker() {
  context.fillRect(rect.startX, rect.startY, rect.w, rect.h);
}

// 方形圈選 ----------------------------------------
let rectContour_params = [];

let mousedown = false;
let x1;
let y1;
let x2;
let y2;

function rectContour_mousedown(e) {
  rectContour_params = [];
  mousedown = true;
  x1 = e.offsetX;
  y1 = e.offsetY;
  rectContour_params.push(x1, y1);
}

function rectContour_mouseup(e) {
  mousedown = false;
  rectContour_params.push(
    e.offsetX - rectContour_params[0],
    e.offsetY - rectContour_params[1]
  );
}

function rectContour_mousemove(e) {
  if (mousedown) {
    x2 = e.offsetX;
    y2 = e.offsetY;
    redraw_rectContour();
  }
}

function redraw_rectContour() {
  context.clearRect(0, 0, 600, 500);
  canvasBackground();

  context.beginPath();
  context.rect(x1, y1, x2 - x1, y2 - y1);
  context.stroke();

  console.log(x1, y1, x2 - x1, y2 - y1);
}
