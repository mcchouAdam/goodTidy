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

function initCanvasListener(canvas) {
  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', finishedPosition);
}

function removeCanvasListener(canvas) {
  canvas.removeEventListener('mousedown', startPosition);
  canvas.removeEventListener('mouseup', finishedPosition);
}

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

  console.log(X_percent, Y_percent);
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
