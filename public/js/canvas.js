// Canvas ----------------------------------------------------------------
const rect = {};
let drag = false;
let canvas;
let context;
const c = $('#fontOCRCanvas')[0];
const ctx = c.getContext('2d');

// hidden& previewBlash
const previewBlah = document.getElementById('img-preview');
previewBlah.onload = () => canvasBackground();

// 方形圈選 ------------------------
function initRectContourListener(canvas) {
  canvasBackground();
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
  RemoveContour_params = [];
  canvas.removeEventListener('mousedown', mouseDown);
  canvas.removeEventListener('mouseup', mouseUp);
  canvas.removeEventListener('mousemove', mouseMove);
}

// 去除文字方塊遮蔽 ----------------------------------------
let Rx1;
let Rx2;
let Ry1;
let Ry2;
let Rx;
let Ry;
let width;
let height;
let RemoveContour_params = [];

function mouseDown(e) {
  drag = true;
  Rx1 = e.offsetX;
  Ry1 = e.offsetY;
}

function mouseUp(e) {
  drag = false;
  Rx2 = e.offsetX;
  Ry2 = e.offsetY;

  Rx = Math.min(Rx1, Rx2);
  Ry = Math.min(Ry1, Ry2);
  width = Math.abs(Rx2 - Rx1);
  height = Math.abs(Ry2 - Ry1);

  RemoveContour_params.push({
    Rx,
    Ry,
    width,
    height,
  });

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

function canvasPartialRedraw() {
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(previewBlah, 0, 0);
  for (let i = 0; i < RemoveContour_params.length; i++) {
    const rectObj = RemoveContour_params[i];
    // console.log('rectObj', rectObj);
    ctx.fillStyle = 'black';
    ctx.fillRect(rectObj.Rx, rectObj.Ry, rectObj.width, rectObj.height);
  }
  canvas = $('#fontOCRCanvas')[0];
  context = canvas.getContext('2d');
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

  canvasBackground();

  context.beginPath();
  context.rect(x1, y1, x2 - x1, y2 - y1);
  context.stroke();
  // console.log(x1, y1, x2 - x1, y2 - y1);
}

// Redraw the upload image to canvas
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

// 方形圈選後擷取
async function shapeSnapShot() {
  canvasBackground();

  // console.log(rectContour_params);
  let item_x1 = rectContour_params[0];
  let item_y1 = rectContour_params[1];
  const item_width = Math.abs(rectContour_params[2]);
  const item_height = Math.abs(rectContour_params[3]);

  // 防止使用從左下、右下、右上開始拉
  const item_x2 = rectContour_params[4];
  const item_y2 = rectContour_params[5];

  item_x1 = Math.min(item_x1, item_x2);
  item_y1 = Math.min(item_y1, item_y2);

  // 圖形
  const item_img = $(`<img src="${previewBlah.src}" />`)
    .css('width', previewBlah.width)
    .css('height', previewBlah.height)
    .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`); // 取圈選的位置

  // 圖形外框
  const item_id = `${Date.now()}_contour-pic`;
  const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
    .css('width', `${item_width}px`)
    .css('height', `${item_height}px`)
    .css('overflow', 'hidden')
    .css('position', 'absolute')
    .draggable({
      containment: '#note-preview-content',
    });

  // 圖形叉叉
  const imgClose = $(
    `<label style="display:none" class="imgClose" onclick="javascript:deleteNoteElement('img','${item_id}');">X</label>`
  );

  item.append(imgClose);
  item.append(item_img);
  $('#note-preview-content').append(item);

  upload_preview_element.push(item);
}
