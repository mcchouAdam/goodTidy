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

  const item_img = $(`<img src="${previewBlah.src}" />`)
    .css('width', previewBlah.width)
    .css('height', previewBlah.height)
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
  note_name = $('#note-name').val();
  note_classification = $('#note-classification').val();
  let ver_name = prompt('請輸入此版本名稱:', `${note_name}_第一版`);

  // // 檢查版本名
  if (ver_name == null || ver_name == '') {
    alert('版本名不能為空');
    return;
  }

  // blob url to file
  let blob = await fetch(previewBlah.src).then((r) => r.blob());
  let filetype = $('input[type=file]').val().split('.').pop();
  let timestamp = Date.now();
  let filename = `${user_id}_${timestamp}.${filetype}`;
  let elements = $('#note-preview-content').html();
  let removeSrc_element = elements.replaceAll(previewBlah.src, '');
  // console.log(removeSrc_element);

  let keywords = $('#note-preview-content').text().replaceAll('\n', '');

  await noteUpload(
    blob,
    filename,
    user_id,
    note_name,
    timestamp,
    removeSrc_element,
    note_classification,
    ver_name,
    keywords
  );

  // location.reload();
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

  let file_name = `OCR_${user_id}_${current_note_id}_${Date.now()}.jpg`;
  let data = new FormData();
  data.append('OCR_upload', blob, file_name);

  let config = {
    method: 'post',
    url: `${server}/api/1.0/OCR`,
    data: data,
  };

  await axios(config)
    .then(function (response) {
      alert('OCR成功');

      // Canvas重畫
      clearContext(canvas, context);
      canvasBackground();
      removeRectRemoveListener(canvas);

      const OCR_result = response.data;

      // append進預覽框裡
      // OCR_result[0] 是全部辨識的字串
      let font = OCR_result[0].description;
      let fontTop = OCR_result[0].boundingPoly.vertices[0].y;
      let fontLeft = OCR_result[0].boundingPoly.vertices[0].x;

      addDragTextarea('#note-preview-content', font);
    })
    .catch(function (error) {
      console.log(error);
      console.log('OCR失敗');
    });
});

// 回復鍵 ------------------------------------
$('#reDraw').click(function () {
  clearContext(canvas, context);
  canvasBackground();
  removeRectRemoveListener(canvas);
  Screen_percent_arr = [];
});
