// Canvas ----------------------------------------------------------------
let rect = {};
let drag = false;
let canvas;
let context;
let c = $('#fontOCRCanvas')[0];
let ctx = c.getContext('2d');

// hidden& previewBlash
let previewBlah = document.getElementById('img-preview');
previewBlah.onload = () => canvasBackground();

// Draw the upload image to canvas
function canvasBackground() {
  // clearContext(c, ctx);
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(previewBlah, 0, 0);
  canvas = $('#fontOCRCanvas')[0];
  context = canvas.getContext('2d');
}

function clearContext(canvas, context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// 去除圖形的重畫
function canvasPartialRedraw(Rx1, Ry1, Rx2, Ry2) {
  let Xstart = Math.min(Rx1, Rx2);
  let Ystart = Math.min(Ry1, Ry2);
  let redrawWidth = Math.abs(Rx1 - Rx2);
  let redrawHeight = Math.abs(Ry1 - Ry2);
  ctx.clearRect(Xstart, Ystart, redrawWidth, redrawHeight);
  ctx.drawImage(
    previewBlah,
    Xstart,
    Ystart,
    redrawWidth,
    redrawHeight,
    Xstart,
    Ystart,
    redrawWidth,
    redrawHeight
  );
  canvas = $('#fontOCRCanvas')[0];
  context = canvas.getContext('2d');
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

// 魔術曲線使用的高寬
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

// 去除文字方塊遮蔽 ----------------------------------------
// function mouseDown(e) {
//   rect.startX = e.offsetX;
//   rect.startY = e.offsetY;
//   drag = true;
// }

// function mouseUp() {
//   drag = false;
// }

// function mouseMove(e) {
//   if (drag) {
//     rect.w = e.offsetX - rect.startX;
//     rect.h = e.offsetY - rect.startY;
//     context.fillStyle = 'rgba(0,0,0)';
//     drawMarker();
//   }
// }

// function drawMarker() {
//   context.fillRect(rect.startX, rect.startY, rect.w, rect.h);
// }

let Rx1;
let Rx2;
let Ry1;
let Ry2;
let Rx;
let Ry;
let width;
let height;
// let RemoveContour_params = [];

function mouseDown(e) {
  drag = true;
  // RemoveContour_params = [];
  Rx1 = e.offsetX;
  Ry1 = e.offsetY;
  // RemoveContour_params.push(Rx1, Ry1);
}

function mouseUp(e) {
  drag = false;
  Rx2 = e.offsetX;
  Ry2 = e.offsetY;
  // RemoveContour_params.push(Rx2 - Rx1, Ry2 - Ry1);
  // 防止使用從左下、右下、右上開始拉
  // RemoveContour_params.push(Rx2, Ry2);

  Rx = Math.min(Rx1, Rx2);
  Ry = Math.min(Ry1, Ry2);
  width = Math.abs(Rx2 - Rx1);
  height = Math.abs(Ry2 - Ry1);

  context.fillStyle = 'black';
  context.fillRect(Rx, Ry, width, height);
}

function mouseMove(e) {
  if (drag) {
    Rx2 = e.offsetX;
    Ry2 = e.offsetY;
    drawMarker();
  }
}

function drawMarker() {
  // context.clearRect(Rx, Ry, width, height);
  canvasPartialRedraw(Rx1, Ry1, Rx2, Ry2);

  context.beginPath();
  context.rect(Rx1, Ry1, Rx2 - Rx1, Ry2 - Ry1);
  context.stroke();
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
  // 長方形的長寬
  rectContour_params.push(
    e.offsetX - rectContour_params[0],
    e.offsetY - rectContour_params[1]
  );

  // 防止使用從左下、右下、右上開始拉
  x2 = e.offsetX;
  y2 = e.offsetY;
  rectContour_params.push(x2, y2);
  // 直接擷取圖形
  shapeSnapShot();
}

function rectContour_mousemove(e) {
  if (mousedown) {
    x2 = e.offsetX;
    y2 = e.offsetY;
    redraw_rectContour();
  }
}

function redraw_rectContour() {
  // context.clearRect(0, 0, canvas_width, canvas_height);
  canvasBackground();

  context.beginPath();
  context.rect(x1, y1, x2 - x1, y2 - y1);
  context.stroke();

  console.log(x1, y1, x2 - x1, y2 - y1);
}
