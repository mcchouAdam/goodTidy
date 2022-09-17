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

  const item_id = `${Date.now()}_contour-pic`;
  const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
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

  // 圖形擷取資訊
  let contourImg_count = $('.contour-pic').length;
  let element_html = '';
  for (let i = 0; i < contourImg_count; i++) {
    element_html += $('.contour-pic').get(i).outerHTML;
  }
  let removeSrc_element = element_html.replaceAll(previewBlah.src, '');

  // 儲存時需要按照順序append
  // OCR的draggable文字方塊資訊
  OCR_ids.map((id) => {
    const OCR_top = $(`#${id}`).parent().get(0).style.top;
    const OCR_left = $(`#${id}`).parent().get(0).style.left;
    const OCR_width = $(`#${id}`).parent().get(0).style.width;
    const OCR_height = $(`#${id}`).parent().get(0).style.height;
    const OCR_text = $(`#${id}`).val();
    const OCR_obj = {
      'text': OCR_text,
      'textTop': OCR_top,
      'textLeft': OCR_left,
      'height': OCR_height,
      'width': OCR_width,
    };
    OCR_elements.push(OCR_obj);
  });

  let keywords = $('#note-preview-content')
    .text()
    .replaceAll('\n', '')
    .replace(/\s/g, '');

  await noteUpload(
    blob,
    filename,
    user_id,
    note_name,
    timestamp,
    removeSrc_element,
    note_classification,
    ver_name,
    keywords,
    OCR_elements
  );

  location.reload();
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

  let file_name = `OCR_${Date.now()}.jpg`;
  let data = new FormData();
  data.append('OCR_upload', blob, file_name);

  let config = {
    method: 'POST',
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
      let text = OCR_result[0].description;
      let textTop = OCR_result[0].boundingPoly.vertices[0].y;
      let textLeft = OCR_result[0].boundingPoly.vertices[0].x;

      addDragTextarea('#note-preview-content', text, textTop, textLeft);
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

// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  addDragTextarea('#update-note-content', '新增文字方塊');
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  // TODO: 版控使用差異法

  // 確認儲存 & 輸入版本名稱
  let version_name = prompt('請輸入此版本名稱:', '');

  if (version_name === null || version_name === '') {
    alert('版本名不能為空');
    return;
  }

  // TODO: 目前version_img先寫死，可以用puppeteer截圖

  // 圖形擷取資訊
  let contourImg_count = $('.contour-pic').length;
  let element_html = '';
  for (let i = 0; i < contourImg_count; i++) {
    element_html += $('.contour-pic').get(i).outerHTML;
  }
  let removeSrc_element = element_html.replaceAll(previewBlah.src, '');

  // 儲存時需要按照順序append
  // OCR的draggable文字方塊資訊
  OCR_elements = [];
  OCR_ids.map((id) => {
    const OCR_top = $(`#${id}`).parent().get(0).style.top;
    const OCR_left = $(`#${id}`).parent().get(0).style.left;
    const OCR_width = $(`#${id}`).parent().get(0).style.width;
    const OCR_height = $(`#${id}`).parent().get(0).style.height;
    const OCR_text = $(`#${id}`).val();
    const OCR_obj = {
      'text': OCR_text,
      'textTop': OCR_top,
      'textLeft': OCR_left,
      'height': OCR_height,
      'width': OCR_width,
    };
    OCR_elements.push(OCR_obj);
  });

  // console.log(OCR_elements);

  // // 搜尋使用的keywords;
  let ek = $('.addtextarea')
    .map((_, el) => el.value)
    .get();
  let keywords = ek.join('').replaceAll('\n', '').replace(/\s/g, '');

  let data = {
    'note_id': current_note_id,
    'created_time': '',
    'version_img': '123_coolthing_ver3.png',
    'version_name': version_name,
    'elements': removeSrc_element,
    'keywords': keywords,
    'text_elements': JSON.stringify(OCR_elements),
  };

  await axios({
    method: 'POST',
    url: '/api/1.0/noteVersion',
    data: data,
  });

  alert(`${version_name} 儲存成功!`);
  window.location.assign('/note');

  // 更新版本選擇的內容
  // ver_info = await load_version();
  // show_version(ver_info);
});

// // 復原版本鍵 --------------------------------------
// $('#recovery-btn').click(function () {
//   // 清空原div上的物件
//   $('#update-note-content').html('');
//   // 初始化drag elements
//   const version_chosen = +$('input[name=version]:checked').val();
//   let $note_content = $('#update-note-content');

//   drag_elements_init($note_content, [ver_info[version_chosen]]);
// });

// 自動儲存鍵 ---------------------------------------------
$('#autoSave_box').change(function () {
  if (this.checked) {
    AutoSave.start();
  } else {
    AutoSave.stop();
  }
});

// 回復自動儲存最新版鍵 ------------------------------
$('#newest-version-btn').click(function () {
  const newest_version = AutoSave.restore();
  $('#update-note-content').html('');

  //TODO: 待重構
  let elements = $.parseHTML(newest_version);
  elements.map((s) => {
    $('.contour-pic.ui-draggable.ui-draggable-handle').draggable({
      containment: '#update-note-content',
    });
    $('.add_fonts').draggable({ containment: '#update-note-content' });
    $('.OCR_fonts').draggable({ containment: '#update-note-content' });
    $('#update-note-content').append(s);
  });
});

// 版本列表鍵 -------------------------------------------
$('#version_list-btn').click(async function () {
  current_version_obj = await getVersionList(
    version_obj,
    $('#modal-version-main')
  );
});

// 版本回復鍵
$('#version-change').click(function () {
  const version_chosen = $('input[name="version_options"]:checked').val();
  noteShowFromVer(version_chosen, current_version_obj);
});

// ------------------------------------------------------

// 留言button
$('#comment-btn').click(function (e) {
  const item = $(
    '<i class="fa fa-solid fa-comments" ondblclick="openNav()"></i>'
  )
    // .attr('contenteditable', 'true')
    .draggable({ containment: '#update-note-content' })
    .on('drag', stepDrag);
  $('#update-note-content').append(item);
});

$('#commentSwitch').change(function () {
  let isChecked = $('#commentSwitch')[0].checked;
  if (isChecked) {
    $('.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle').show();
  } else {
    $('.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle').hide();
  }
});

// 刪除鍵 --------------------------------------------------
$('#deleteNote').click(function () {
  console.log($(':focus'));
});

// --------------------------------------------------------
// 特定人分享清單鍵
$('#sharedNote-btn').click(function () {
  getSharedNote(shared_note_obj, $('#modal-sharedNote-main'));
});

// 特定人分享查看鍵
$('#sharedNote-change').click(function () {
  const note_chosen = $('input[name="shareNote_options"]:checked').val();
  // console.log(shared_note_obj);
  sharedNoteShow(note_chosen, shared_note_obj);
  $('textarea').prop('disabled', true);
  $('textarea').draggable({ 'disable': true });
});

// ------------------------------------------------------