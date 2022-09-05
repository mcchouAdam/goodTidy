let alldragObject = [];

// 圖形圈選 ---------------------------

// 魔術
$('#magicContour').click(async function () {
  initCanvasListener(canvas);
});

// 方形
$('#rectContour').click(async function () {
  initRectContourListener(canvas);
});

// 擷取鍵 ------------------------------
$('#shapeView').click(function () {
  removeCanvasListener(canvas);
  removeRectContourRemoveListener(canvas);
  clearContext(canvas, context);
  canvasBackground();

  console.log(rectContour_params);
  let item_x1 = rectContour_params[0];
  let item_y1 = rectContour_params[1];
  let item_width = rectContour_params[2];
  let item_height = rectContour_params[3];

  // TODO: 目前寫死width, height
  // const item = $('<div class="contour-pick"></div')
  //   .css('background-image', `url('${previewBlah.src}')`)
  //   .css('width', '600px')
  //   .css('height', '300px')
  //   .css('clip-path', `polygon(${Screen_percent_arr.join(',')})`)
  //   .draggable();

  const item_img = $(`<img src="${previewBlah.src}" />`)
    .css('width', '600px')
    .css('height', '300px')
    .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`);

  const item = $(`<div class="contour-pic"></div>`)
    .css('width', `${item_width}px`)
    .css('height', `${item_height}px`)
    .css('overflow', 'hidden')
    .draggable({ containment: '#note-preview-content' });

  item.append(item_img);

  $('#note-preview-content').append(item);

  // for next element clear
  Screen_percent_arr = [];
});

// 上傳檔案 ----------------------------
$('#submit_note').click(async function () {
  let ver_name = prompt('請輸入此版本名稱:', `${note_name}_第一版`);

  // 檢查版本名
  if (ver_name == null || ver_name == '') {
    alert('版本名不能為空');
    return;
  }
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
    'note_name': $('#note-name').val(),
    'timestamp': timestamp,
    'file_name': filename,
    'elements': $('#note-preview-content').html(),
    'url': '',
    'ver_img': '123_coolthing_ver3.png', // 先寫死
    'ver_name': ver_name,
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/note',
    data: note,
  });

  alert(`${note_name} 上傳成功!`);
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

  let file_name = `OCR_${user_id}_${note_id}_${Date.now()}.jpg`;
  let form = new FormData();
  form.append('upload_file', blob, file_name);

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
  const OCR_result = await OCR(file_name);

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
      .draggable({ containment: '#note-preview-content' });

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
