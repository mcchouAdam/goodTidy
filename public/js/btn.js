// 圖形圈選 ---------------------------
// 魔術
$('#magicContour').click(async function () {
  initCanvasListener(canvas);
});

// 方形圈選
$('#rectContour').click(async function (e) {
  // const isfile_upload = $('#file-preview').get(0).files.length;
  // if (isfile_upload == 0) {
  //   // Swal.fire('請先選擇檔案');
  //   Swal.fire('請先選擇檔案');
  //   return;
  // }

  $('#fontOCRCanvas').css('cursor', 'crosshair');
  initRectContourListener(canvas);
});

// 方形+擷取
async function shapeSnapShot() {
  // removeCanvasListener(canvas);
  // removeRectContourRemoveListener(canvas);
  // clearContext(canvas, context);
  canvasBackground();

  // console.log(rectContour_params);
  let item_x1 = rectContour_params[0];
  let item_y1 = rectContour_params[1];
  let item_width = Math.abs(rectContour_params[2]);
  let item_height = Math.abs(rectContour_params[3]);

  // 防止使用從左下、右下、右上開始拉
  let item_x2 = rectContour_params[4];
  let item_y2 = rectContour_params[5];

  item_x1 = Math.min(item_x1, item_x2);
  item_y1 = Math.min(item_y1, item_y2);

  const item_img = $(`<img src="${previewBlah.src}" />`)
    .css('width', previewBlah.width)
    .css('height', previewBlah.height)
    .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`); // 取圈選的位置

  const item_id = `${Date.now()}_contour-pic`;
  const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
    .css('width', `${item_width}px`)
    .css('height', `${item_height}px`)
    .css('overflow', 'hidden')
    .css('position', 'absolute')
    .draggable({ containment: '#note-preview-content' });

  item.append(item_img);
  $('#note-preview-content').append(item);

  upload_preview_element.push(item);
  // for next element clear
  Screen_percent_arr = [];
}

// 擷取鍵 ------------------------------
// $('#shapeView').click(function () {
//   removeCanvasListener(canvas);
//   removeRectContourRemoveListener(canvas);
//   clearContext(canvas, context);
//   canvasBackground();

//   console.log(rectContour_params);
//   let item_x1 = rectContour_params[0];
//   let item_y1 = rectContour_params[1];
//   let item_width = rectContour_params[2];
//   let item_height = rectContour_params[3];

//   const item_img = $(`<img src="${previewBlah.src}" />`)
//     .css('width', previewBlah.width)
//     .css('height', previewBlah.height)
//     .css('margin', `${-item_y1}px 0 0 ${-item_x1}px`); // 取圈選的位置

//   const item_id = `${Date.now()}_contour-pic`;
//   const item = $(`<div class="contour-pic" id="${item_id}"></div>`)
//     .css('width', `${item_width}px`)
//     .css('height', `${item_height}px`)
//     .css('overflow', 'hidden')
//     .css('position', 'absolute')
//     .draggable({ containment: '#note-preview-content' });

//   item.append(item_img);
//   $('#note-preview-content').append(item);

//   // for next element clear
//   Screen_percent_arr = [];
// });

// 回復鍵 ------------------------------------
$('#reDraw').click(function () {
  clearContext(canvas, context);
  canvasBackground();
  removeRectRemoveListener(canvas);
  Screen_percent_arr = [];
});

// 新增文字方塊鍵 ---------------------------------
$('#addfont').click(async function () {
  addDragTextarea('#update-note-content', '', 25, 25);
});

// 儲存鍵 --------------------------------------
$('#storeNote').click(async function () {
  Swal.fire({
    title: '你確定要儲存檔案嗎?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      let version_name = new Date();

      // 圖形擷取資訊
      let contourImg_count = $('.contour-pic').length;
      let element_html = '';
      for (let i = 0; i < contourImg_count; i++) {
        element_html += $('.contour-pic').get(i).outerHTML;
      }
      const file_name = `${S3_HOST}notes/${note_bg}`;
      let removeSrc_element = element_html.replaceAll(file_name, '');

      // OCR的draggable文字方塊資訊
      // OCR_elements = [];
      // if (OCR_ids.length != 0) {
      //   OCR_ids.map((id) => {
      //     const OCR_top = $(`#${id}`).parent().get(0).style.top;
      //     const OCR_left = $(`#${id}`).parent().get(0).style.left;
      //     const OCR_width = $(`#${id}`).parent().get(0).style.width;
      //     const OCR_height = $(`#${id}`).parent().get(0).style.height;
      //     const OCR_text = $(`#${id}`).val();
      //     const OCR_obj = {
      //       'text': OCR_text,
      //       'textTop': OCR_top,
      //       'textLeft': OCR_left,
      //       'height': OCR_height,
      //       'width': OCR_width,
      //     };
      //     OCR_elements.push(OCR_obj);
      //   });
      // }

      // 文字擷取
      const text_elements = $('.div_addtextarea');
      let OCR_elements = [];
      if (text_elements.length != 0) {
        text_elements.map((i, e) => {
          let obj = {};
          const OCR_top = e.style.top;
          const OCR_left = e.style.left;
          const OCR_width = e.style.width;
          const OCR_height = e.style.height;
          const OCR_text = e.firstChild.value;
          obj = {
            'text': OCR_text,
            'textTop': OCR_top,
            'textLeft': OCR_left,
            'height': OCR_height,
            'width': OCR_width,
          };
          OCR_elements.push(obj);
        });
      }

      // 搜尋使用的keywords，將全部的字串串起來
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

      Swal.fire({
        icon: 'success',
        title: '存檔成功',
        showConfirmButton: false,
        timer: 1000,
      });

      // 重抓使用者資料
      await getUserNotes();
      current_version_obj = await getVersionList(
        version_obj,
        $('#modal-version-main')
      );
      // window.location.assign('/note');
    }
  });
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
$('#autoSave-toggle').change(function () {
  if (this.checked) {
    AutoSave.start();
  } else {
    AutoSave.stop();
  }
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

// --------------------------------------------------------
// 特定人分享清單鍵
$('#sharedNote-btn').click(async function () {
  await getSharedNote(shared_note_obj, $('#modal-sharedNote-main'));
});

// 特定人分享查看鍵
$('#sharedNote-change').click(function () {
  const note_chosen = $('input[name="shareNote_options"]:checked').val();
  window.open(`/sharedToOtherNote/${shared_note_obj[note_chosen].note_id}`);
});

// 上傳檔案鍵 ----------------------------
// $('#submit_note').click(async function () {
//   // Loading圖示
//   $('#submit_note').prop('disabled', true);
//   $('body').css('cursor', 'progress');

//   note_name = $('#note-name').val();
//   note_classification = $('#note-classification').val();
//   let ver_name = prompt('請輸入此版本名稱:', `${note_name}_第一版`);

//   // // 檢查版本名
//   if (ver_name == null || ver_name == '') {
//     Swal.fire('版本名不能為空');
//     return;
//   }

//   // blob url to file
//   let blob = await fetch(previewBlah.src).then((r) => r.blob());
//   let filetype = $('input[type=file]').val().split('.').pop();
//   let timestamp = Date.now();
//   let filename = `${user_id}_${timestamp}.${filetype}`;

//   // 圖形擷取資訊
//   let contourImg_count = $('.contour-pic').length;
//   let element_html = '';
//   for (let i = 0; i < contourImg_count; i++) {
//     element_html += $('.contour-pic').get(i).outerHTML;
//   }
//   let removeSrc_element = element_html.replaceAll(previewBlah.src, '');

//   // 儲存時需要按照順序append
//   // OCR的draggable文字方塊資訊
//   OCR_ids.map((id) => {
//     const OCR_top = $(`#${id}`).parent().get(0).style.top;
//     const OCR_left = $(`#${id}`).parent().get(0).style.left;
//     const OCR_width = $(`#${id}`).parent().get(0).style.width;
//     const OCR_height = $(`#${id}`).parent().get(0).style.height;
//     const OCR_text = $(`#${id}`).val();
//     const OCR_obj = {
//       'text': OCR_text,
//       'textTop': OCR_top,
//       'textLeft': OCR_left,
//       'height': OCR_height,
//       'width': OCR_width,
//     };
//     OCR_elements.push(OCR_obj);
//   });

//   let keywords = $('#note-preview-content')
//     .text()
//     .replaceAll('\n', '')
//     .replace(/\s/g, '');

//   await noteUpload(
//     blob,
//     filename,
//     user_id,
//     note_name,
//     timestamp,
//     removeSrc_element,
//     note_classification,
//     ver_name,
//     keywords,
//     OCR_elements
//   );

//   // Loading釋放
//   $('#submit_note').prop('disabled', false);
//   $('body').css('cursor', 'default');

//   window.location.assign('/note');
// });
