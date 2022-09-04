let alldragObject = [];

// TODO: 目前user_id, note_id, s3_HOST寫死
let user_id = 123;
let note_id = 1;
let note_name = '酷東西';
let s3_HOST = 'https://goodtidy.s3.amazonaws.com/';

// 圖形圈選 ---------------------------
$('#magicContour').click(async function () {
  initCanvasListener(canvas);
});

// 擷取鍵 ------------------------------
$('#shapeView').click(function () {
  removeCanvasListener(canvas);
  clearContext(canvas, context);
  canvasBackground();

  // TODO: 目前寫死width, height
  const item = $('<div class="contour-pick"></div')
    .css('background-image', `url('${previewBlah.src}')`)
    .css('width', '600px')
    .css('height', '300px')
    .css('clip-path', `polygon(${Screen_percent_arr.join(',')})`)
    .draggable();

  $('#note-preview-content').append(item);

  // for next element clear
  Screen_percent_arr = [];
});

// 上傳檔案 ----------------------------
$('#submit_note').click(async function () {
  // // blob url to file
  let blob = await fetch(previewBlah.src).then((r) => r.blob());
  // let filename = $('input[type=file]').val().split('\\').pop();
  let filetype = $('input[type=file]').val().split('.').pop();

  // TODO: UserID到時能要換信箱
  let timestamp = Date.now();
  let filename = `${user_id}_${timestamp}.${filetype}`;

  // // 檔案上傳s3
  let form = new FormData();
  form.append('upload_file', blob, filename);
  let upload_setting = {
    'url': '/upload/file',
    'method': 'POST',
    'timeout': 0,
    'processData': false,
    'mimeType': 'multipart/form-data',
    'contentType': false,
    'data': form,
  };
  $.ajax(upload_setting).done(function (response) {
    console.log(response);
  });

  // 儲存資料庫
  let note = {
    'user_id': user_id,
    'note_name': note_name,
    'timestamp': timestamp,
    'file_name': filename,
    'elements': $('#note-preview-content').html(),
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/note',
    data: note,
  });

  alert(`${note_name} 上傳成功!`);
});

// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  const item = $('<div class="add_fonts"><p>新增文字方塊</p></div>')
    .attr('contenteditable', 'true')
    .draggable();
  $('.note-edit-block').append(item);
});

// 去除非文字鍵 ------------------------------------
$('#removeNotWant').click(function () {
  initRectListener(canvas);
});

// 文字辨識鍵 --------------------------------------
$('#OCR').click(async function () {
  let image = canvas.toDataURL('image/jpeg', 1);
  const base64Response = await fetch(image);
  const blob = await base64Response.blob();

  let filename = `OCR_${user_id}_${note_id}.jpg`;
  let form = new FormData();
  form.append('upload_file', blob, filename);

  // TODO: 統一改成axios
  let upload_setting = {
    'url': '/upload/file',
    'method': 'POST',
    'timeout': 0,
    'processData': false,
    'mimeType': 'multipart/form-data',
    'contentType': false,
    'data': form,
  };

  $.ajax(upload_setting).done(function (response) {
    console.log(response);
  });

  // Canvas重畫
  clearContext(canvas, context);
  canvasBackground();
  removeRectRemoveListener(canvas);

  // 文字辨識
  const OCR_result = await OCR(filename);

  // append進預覽框裡
  // OCR_result[0] 是全部辨識的字串
  for (let i = 1; i < OCR_result.length; i++) {
    let font = OCR_result[i].description;
    let fontTop = OCR_result[i].boundingPoly.vertices[0].y;
    let fontLeft = OCR_result[i].boundingPoly.vertices[0].x;

    // TODO: 預覽頁面 - 使用relative會跑掉，但存檔後不會跑掉
    const item = $(`<div class="OCR_fonts"><p>${font}</p></div>`)
      // TODO: left的座標調整數字不隻從哪兒來
      // .css({
      //   top: fontTop + 200,
      //   left: fontLeft + $('#fontOCRCanvas').width(),
      //   position: 'absolute',
      // })
      .css({
        top: fontTop,
        left: fontLeft,
        position: 'relative',
      })
      .attr('contenteditable', 'true')
      .draggable();

    $('#note-preview-content').append(item);
  }
});

// 回復鍵 ------------------------------------
$('#reDraw').click(function () {
  clearContext(canvas, context);
  canvasBackground();
  removeRectRemoveListener(canvas);
  Screen_percent_arr = [];
});
